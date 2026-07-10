import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

// GET /api/menus - 전체 메뉴 조회
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM menus ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/menus/:id - 단일 메뉴 조회
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM menus WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '메뉴를 찾을 수 없습니다.' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/menus - 메뉴 생성 (관리자)
router.post('/', async (req, res, next) => {
  try {
    const { name, description = '', price, stock = 0, image_url = '', is_available = true } = req.body;
    if (!name || price == null) {
      return res.status(400).json({ error: '이름(name)과 가격(price)은 필수입니다.' });
    }
    const { rows } = await query(
      `INSERT INTO menus (name, description, price, stock, image_url, is_available)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, price, stock, image_url, is_available]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/menus/:id - 메뉴 수정 (관리자, 재고 포함)
router.put('/:id', async (req, res, next) => {
  try {
    const { name, description, price, stock, image_url, is_available } = req.body;
    const { rows } = await query(
      `UPDATE menus SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         price = COALESCE($3, price),
         stock = COALESCE($4, stock),
         image_url = COALESCE($5, image_url),
         is_available = COALESCE($6, is_available),
         updated_at = now()
       WHERE id = $7 RETURNING *`,
      [name, description, price, stock, image_url, is_available, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: '메뉴를 찾을 수 없습니다.' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/menus/:id - 메뉴 삭제 (관리자)
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await query('DELETE FROM menus WHERE id = $1', [req.params.id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: '메뉴를 찾을 수 없습니다.' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
