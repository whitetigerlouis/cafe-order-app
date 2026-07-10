// 백엔드 API 호출 헬퍼. vite 프록시를 통해 /api 로 요청한다.
const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `요청 실패 (${res.status})`);
  }
  return data;
}

// 메뉴
export const getMenus = () => request('/menus');
export const createMenu = (menu) =>
  request('/menus', { method: 'POST', body: JSON.stringify(menu) });
export const updateMenu = (id, menu) =>
  request(`/menus/${id}`, { method: 'PUT', body: JSON.stringify(menu) });
export const deleteMenu = (id) => request(`/menus/${id}`, { method: 'DELETE' });

// 주문
export const getOrders = () => request('/orders');
export const createOrder = (items) =>
  request('/orders', { method: 'POST', body: JSON.stringify({ items }) });
export const updateOrderStatus = (id, status) =>
  request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const deleteOrder = (id) => request(`/orders/${id}`, { method: 'DELETE' });
