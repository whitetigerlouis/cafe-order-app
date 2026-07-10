import { useEffect, useState } from 'react';
import { getMenus, createOrder } from '../api.js';

export default function OrderPage() {
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState({}); // { [menuId]: quantity }
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState({}); // 이미지 로드 실패한 메뉴 id

  async function loadMenus() {
    setLoading(true);
    try {
      const data = await getMenus();
      setMenus(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMenus();
  }, []);

  const addToCart = (menu) => {
    setCart((prev) => {
      const current = prev[menu.id] || 0;
      if (current >= menu.stock) return prev; // 재고 초과 방지
      return { ...prev, [menu.id]: current + 1 };
    });
  };

  const removeFromCart = (menuId) => {
    setCart((prev) => {
      const current = prev[menuId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[menuId];
        return next;
      }
      return { ...prev, [menuId]: current - 1 };
    });
  };

  const cartItems = Object.entries(cart).map(([menuId, qty]) => {
    const menu = menus.find((m) => m.id === Number(menuId));
    return { menu, quantity: qty };
  });

  const totalPrice = cartItems.reduce(
    (sum, { menu, quantity }) => sum + (menu ? menu.price * quantity : 0),
    0
  );

  const handleOrder = async () => {
    setMessage(null);
    setError(null);
    const items = Object.entries(cart).map(([menu_id, quantity]) => ({
      menu_id: Number(menu_id),
      quantity,
    }));
    try {
      const order = await createOrder(items);
      setMessage(`주문이 완료되었습니다! (주문번호 #${order.id}, 총 ${order.total_price.toLocaleString()}원)`);
      setCart({});
      loadMenus(); // 재고 갱신
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>메뉴를 불러오는 중...</p>;

  return (
    <div className="order-page">
      <section className="menu-section">
        <h2>메뉴</h2>
        <div className="menu-grid">
          {menus.map((menu) => {
            const soldOut = !menu.is_available || menu.stock <= 0;
            return (
              <div key={menu.id} className={`menu-card ${soldOut ? 'sold-out' : ''}`}>
                <div className="menu-thumb">
                  {menu.image_url && !imgError[menu.id] ? (
                    <img
                      src={menu.image_url}
                      alt={menu.name}
                      loading="lazy"
                      onError={() => setImgError((prev) => ({ ...prev, [menu.id]: true }))}
                    />
                  ) : (
                    <div className="menu-thumb-fallback">☕</div>
                  )}
                  {soldOut && <span className="thumb-badge">품절</span>}
                </div>
                <div className="menu-card-body">
                  <h3>{menu.name}</h3>
                  <p className="menu-desc">{menu.description}</p>
                  <p className="menu-price">{menu.price.toLocaleString()}원</p>
                  <p className="menu-stock">재고: {menu.stock}</p>
                </div>
                <button disabled={soldOut} onClick={() => addToCart(menu)}>
                  {soldOut ? '품절' : '담기'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <aside className="cart-section">
        <h2>🛒 장바구니</h2>
        {cartItems.length === 0 ? (
          <p className="empty">담긴 메뉴가 없습니다.</p>
        ) : (
          <>
            <ul className="cart-list">
              {cartItems.map(({ menu, quantity }) => (
                <li key={menu.id} className="cart-item">
                  <span className="cart-item-name">{menu.name}</span>
                  <div className="cart-item-controls">
                    <button onClick={() => removeFromCart(menu.id)}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => addToCart(menu)} disabled={quantity >= menu.stock}>
                      +
                    </button>
                  </div>
                  <span className="cart-item-price">
                    {(menu.price * quantity).toLocaleString()}원
                  </span>
                </li>
              ))}
            </ul>
            <div className="cart-total">
              <strong>합계</strong>
              <strong>{totalPrice.toLocaleString()}원</strong>
            </div>
            <button className="order-btn" onClick={handleOrder}>
              주문하기
            </button>
          </>
        )}
        {message && <p className="msg success">{message}</p>}
        {error && <p className="msg error">{error}</p>}
      </aside>
    </div>
  );
}
