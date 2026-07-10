import { useEffect, useState } from 'react';
import {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  getOrders,
  updateOrderStatus,
  deleteOrder,
} from '../api.js';

const STATUSES = ['대기중', '제조중', '완료', '취소'];
const EMPTY_FORM = { name: '', description: '', price: '', stock: '', is_available: true };

export default function AdminPage() {
  const [menus, setMenus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  async function loadAll() {
    try {
      const [m, o] = await Promise.all([getMenus(), getOrders()]);
      setMenus(m);
      setOrders(o);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      is_available: form.is_available,
    };
    try {
      if (editingId) {
        await updateMenu(editingId, payload);
      } else {
        await createMenu(payload);
      }
      resetForm();
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (menu) => {
    setEditingId(menu.id);
    setForm({
      name: menu.name,
      description: menu.description,
      price: menu.price,
      stock: menu.stock,
      is_available: menu.is_available,
    });
  };

  const handleDeleteMenu = async (id) => {
    if (!confirm('이 메뉴를 삭제하시겠습니까?')) return;
    try {
      await deleteMenu(id);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm('이 주문을 삭제하시겠습니까?')) return;
    try {
      await deleteOrder(id);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-page">
      {error && <p className="msg error">{error}</p>}

      {/* 메뉴 / 재고 관리 */}
      <section className="admin-section">
        <h2>메뉴 · 재고 관리</h2>

        <form className="menu-form" onSubmit={handleSubmit}>
          <h3>{editingId ? `메뉴 수정 (#${editingId})` : '새 메뉴 추가'}</h3>
          <div className="form-row">
            <input
              placeholder="이름"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              placeholder="가격"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
            <input
              placeholder="재고"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required
            />
          </div>
          <input
            placeholder="설명"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
            />
            판매 중
          </label>
          <div className="form-actions">
            <button type="submit">{editingId ? '수정' : '추가'}</button>
            {editingId && (
              <button type="button" onClick={resetForm}>
                취소
              </button>
            )}
          </div>
        </form>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>가격</th>
              <th>재고</th>
              <th>판매</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {menus.map((menu) => (
              <tr key={menu.id}>
                <td>{menu.id}</td>
                <td>{menu.name}</td>
                <td>{menu.price.toLocaleString()}원</td>
                <td>{menu.stock}</td>
                <td>{menu.is_available ? '판매중' : '중지'}</td>
                <td className="actions">
                  <button onClick={() => startEdit(menu)}>수정</button>
                  <button className="danger" onClick={() => handleDeleteMenu(menu.id)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 주문 관리 */}
      <section className="admin-section">
        <h2>주문 관리</h2>
        {orders.length === 0 ? (
          <p className="empty">주문이 없습니다.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>항목</th>
                <th>총액</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>
                    {order.items.map((it) => (
                      <div key={it.id}>
                        {it.menu_name} × {it.quantity}
                      </div>
                    ))}
                  </td>
                  <td>{order.total_price.toLocaleString()}원</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="actions">
                    <button className="danger" onClick={() => handleDeleteOrder(order.id)}>
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
