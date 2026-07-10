import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import OrderPage from './pages/OrderPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>☕ 커피 주문 앱</h1>
        <nav className="nav">
          <NavLink to="/order" className={({ isActive }) => (isActive ? 'active' : '')}>
            주문하기
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
            관리자
          </NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/order" replace />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  );
}
