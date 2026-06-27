import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const menuItems = [
  { path: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
  { path: '/admin/users', icon: 'bi-people', label: 'Users' },
  { path: '/admin/products', icon: 'bi-box-seam', label: 'Products' },
  { path: '/admin/orders', icon: 'bi-truck', label: 'Orders' },
  { path: '/admin/reviews', icon: 'bi-star', label: 'Reviews' },
];

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3><i className="bi bi-eyeglasses"></i> Lensique</h3>
          <small>Admin Panel</small>
        </div>
        <div className="sidebar-user">
          <div className="user-avatar">{user?.username?.charAt(0)?.toUpperCase() || 'A'}</div>
          <div>
            <strong>{user?.username || 'Admin'}</strong>
            <small>Administrator</small>
          </div>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
