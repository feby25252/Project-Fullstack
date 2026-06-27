import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-lensique">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4">
            <h5><i className="bi bi-eyeglasses"></i> Lensique</h5>
            <p>E-Commerce optik terpercaya dengan koleksi kacamata terlengkap dan berkualitas premium.</p>
          </div>
          <div className="col-md-4 mb-4">
            <h5>Menu</h5>
            <p><Link to="/katalog">Katalog Produk</Link></p>
            <p><Link to="/login">Login</Link></p>
            <p><Link to="/register">Daftar</Link></p>
          </div>
          <div className="col-md-4 mb-4">
            <h5>Kontak</h5>
            <p><i className="bi bi-envelope"></i> info@lensique.com</p>
            <p><i className="bi bi-telephone"></i> (021) 1234-5678</p>
            <p><i className="bi bi-geo-alt"></i> Jakarta, Indonesia</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Lensique. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
