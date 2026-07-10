import { Router } from 'express';
import { query, getClient } from '../db.js';

const router = Router();

const VALID_STATUSES = ['대기중', '제조중', '완료', '취소'];

// 주문 1건에 항목들을 붙여서 반환하는 헬퍼
async function fetchOrderWithItems(orderId) {
  const orderRes = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
  if (orderRes.rows.length === 0) return null;
  const itemsRes = await query(
    'SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC',
    [orderId]
  );
  return { ...orderRes.rows[0], items: itemsRes.rows };
}

// GET /api/orders - 전체 주문 조회 (관리자)
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = await Promise.all(
      rows.map(async (o) => {
        const items = await query(
          'SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC',
          [o.id]
        );
        return { ...o, items: items.rows };
      })
    );
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id - 단일 주문 조회
router.get('/:id', async (req, res, next) => {
  try {
    const order = await fetchOrderWithItems(req.params.id);
    if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// POST /api/orders - 주문 생성 (고객). body: { items: [{ menu_id, quantity }] }
router.post('/', async (req, res, next) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: '주문 항목(items)이 비어 있습니다.' });
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    let total = 0;
    const preparedItems = [];

    // 각 항목 검증 + 재고 확인/차감
    for (const item of items) {
      const { menu_id, quantity } = item;
      if (!menu_id || !quantity || quantity <= 0) {
        throw Object.assign(new Error('잘못된 주문 항목입니다.'), { status: 400 });
      }

      const menuRes = await client.query(
        'SELECT * FROM menus WHERE id = $1 FOR UPDATE',
        [menu_id]
      );
      if (menuRes.rows.length === 0) {
        throw Object.assign(new Error(`메뉴(id=${menu_id})를 찾을 수 없습니다.`), { status: 404 });
      }
      const menu = menuRes.rows[0];

      if (!menu.is_available) {
        throw Object.assign(new Error(`'${menu.name}'는 현재 판매하지 않습니다.`), { status: 400 });
      }
      if (menu.stock < quantity) {
        throw Object.assign(
          new Error(`'${menu.name}'의 재고가 부족합니다. (남은 수량: ${menu.stock})`),
          { status: 400 }
        );
      }

      await client.query('UPDATE menus SET stock = stock - $1, updated_at = now() WHERE id = $2', [
        quantity,
        menu_id,
      ]);

      total += menu.price * quantity;
      preparedItems.push({ menu_id, menu_name: menu.name, unit_price: menu.price, quantity });
    }

    // 주문 생성
    const orderRes = await client.query(
      'INSERT INTO orders (status, total_price) VALUES ($1, $2) RETURNING *',
      ['대기중', total]
    );
    const order = orderRes.rows[0];

    // 주문 항목 저장
    for (const pi of preparedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_id, menu_name, unit_price, quantity)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, pi.menu_id, pi.menu_name, pi.unit_price, pi.quantity]
      );
    }

    await client.query('COMMIT');
    const full = await fetchOrderWithItems(order.id);
    res.status(201).json(full);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// PATCH /api/orders/:id/status - 주문 상태 변경 (관리자)
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `상태는 ${VALID_STATUSES.join(', ')} 중 하나여야 합니다.`,
      });
    }
    const { rows } = await query(
      'UPDATE orders SET status = $1, updated_at = now() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
    const full = await fetchOrderWithItems(rows[0].id);
    res.json(full);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/orders/:id - 주문 삭제 (관리자)
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await query('DELETE FROM orders WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
