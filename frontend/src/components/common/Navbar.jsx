import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      api.get('/keranjang').then(res => {
        if (res.data?.success && res.data?.data?.items) {
          setCartCount(res.data.data.items.length);
        }
      }).catch(() => {});
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-lensique sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-eyeglasses"></i> Lens<span>ique</span>
        </Link>
        <button className="navbar-toggler" type="button" onClick={() => setMenuOpen(!menuOpen)}>
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav ms-auto">
            {isLoggedIn && isAdmin ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/dashboard"><i className="bi bi-speedometer2"></i> Dashboard</Link>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i className="bi bi-person-circle"></i> {user?.username}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" style={{borderRadius:'16px',border:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}>
                    <li><Link className="dropdown-item" to="/admin/dashboard"><i className="bi bi-speedometer2"></i> Dashboard</Link></li>
                    <li><Link className="dropdown-item" to="/admin/users"><i className="bi bi-people"></i> Kelola User</Link></li>
                    <li><Link className="dropdown-item" to="/admin/products"><i className="bi bi-box-seam"></i> Kelola Produk</Link></li>
                    <li><Link className="dropdown-item" to="/admin/orders"><i className="bi bi-truck"></i> Kelola Pesanan</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><a className="dropdown-item text-danger" href="#" onClick={handleLogout}><i className="bi bi-box-arrow-right"></i> Logout</a></li>
                  </ul>
                </li>
              </>
            ) : isLoggedIn ? (
              <>
                <li className="nav-item"><Link className="nav-link" to="/"><i className="bi bi-house"></i> Beranda</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/katalog"><i className="bi bi-grid"></i> Katalog</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/wishlist"><i className="bi bi-heart"></i> Wishlist</Link></li>
                <li className="nav-item position-relative">
                  <Link className="nav-link" to="/keranjang">
                    <i className="bi bi-cart3"></i> Keranjang
                    {cartCount > 0 && <span className="badge-cart">{cartCount}</span>}
                  </Link>
                </li>
                <li className="nav-item"><Link className="nav-link" to="/user/orders"><i className="bi bi-receipt"></i> Pesanan</Link></li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i className="bi bi-person-circle"></i> {user?.username}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" style={{borderRadius:'16px',border:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}>
                    <li><Link className="dropdown-item" to="/profile"><i className="bi bi-person"></i> Profil Saya</Link></li>
                    <li><Link className="dropdown-item" to="/user/orders"><i className="bi bi-receipt"></i> Riwayat Pesanan</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><a className="dropdown-item text-danger" href="#" onClick={handleLogout}><i className="bi bi-box-arrow-right"></i> Logout</a></li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/katalog"><i className="bi bi-grid"></i> Katalog</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/login"><i className="bi bi-box-arrow-in-right"></i> Login</Link></li>
                <li className="nav-item"><Link className="nav-link btn-lensique text-white px-3" to="/register">Daftar</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
