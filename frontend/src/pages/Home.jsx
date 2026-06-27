import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';
import Loading from '../components/common/Loading';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/katalog/kategori').then(r => r.data?.data || []),
      api.get('/katalog/produk?limit=8').then(r => r.data?.data || []),
    ]).then(([cats, prods]) => {
      setCategories(cats);
      setProducts(prods);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const icons = ['bi-eyeglasses', 'bi-sunglasses', 'bi-eye', 'bi-stars', 'bi-gem', 'bi-heart'];
  const colors = ['var(--soft-pink)', 'var(--baby-blue)', 'var(--soft-purple)', '#ABEBC6', '#FAD7A0', '#AED6F1'];

  if (loading) return <Loading />;

  return (
    <>
      {/* Hero */}
      <section className="hero-section">
        <div className="container">
          <h1><i className="bi bi-eyeglasses"></i> Selamat Datang di Lensique</h1>
          <p>Temukan kacamata impianmu dengan koleksi terlengkap dan harga terbaik. Kualitas premium, gaya tanpa batas.</p>
          <Link to="/katalog" className="btn btn-lensique btn-lg me-2"><i className="bi bi-grid"></i> Lihat Katalog</Link>
          <Link to="/register" className="btn btn-lensique-outline btn-lg"><i className="bi bi-person-plus"></i> Daftar Sekarang</Link>
        </div>
      </section>

      {/* Categories */}
      <section className="container mb-5">
        <div className="section-heading">
          <h2>Kategori Produk</h2>
          <p>Pilih kategori kacamata sesuai kebutuhanmu</p>
          <div className="heading-line"></div>
        </div>
        <div className="row g-4">
          {categories.length > 0 ? categories.map((cat, idx) => (
            <div key={cat.id} className="col-6 col-md-4 col-lg-2">
              <Link to={`/katalog?category=${cat.id}`} className="text-decoration-none">
                <div className="card-container text-center" style={{background: colors[idx % colors.length], padding: '20px', cursor: 'pointer', transition: 'transform 0.3s'}}>
                  <i className={`bi ${icons[idx % icons.length]}`} style={{fontSize: '2rem', color: 'var(--dark-text)'}}></i>
                  <h6 className="mt-2 mb-0">{cat.name}</h6>
                </div>
              </Link>
            </div>
          )) : (
            <p className="text-center text-muted">Belum ada kategori tersedia.</p>
          )}
        </div>
      </section>

      {/* Latest Products */}
      <section className="container mb-5">
        <div className="section-heading">
          <h2>Produk Terbaru</h2>
          <p>Koleksi kacamata terbaru untuk kamu</p>
          <div className="heading-line"></div>
        </div>
        <div className="row g-4">
          {products.length > 0 ? products.map(p => (
            <div key={p.id} className="col-6 col-md-4 col-lg-3">
              <ProductCard product={p} />
            </div>
          )) : (
            <div className="empty-state">
              <i className="bi bi-box-seam"></i>
              <h4>Belum Ada Produk</h4>
              <p>Produk akan segera tersedia, tunggu ya!</p>
            </div>
          )}
        </div>
        <div className="text-center mt-4">
          <Link to="/katalog" className="btn btn-lensique-purple">Lihat Semua Produk <i className="bi bi-arrow-right"></i></Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mb-5">
        <div className="row g-4">
          {[
            { icon: 'bi-shield-check', color: '#C77986', title: 'Kualitas Terjamin', desc: 'Semua produk kami telah melalui quality control ketat' },
            { icon: 'bi-truck', color: '#5DADE2', title: 'Pengiriman Cepat', desc: 'Kirim ke seluruh Indonesia dengan kurir terpercaya' },
            { icon: 'bi-headset', color: '#A569BD', title: 'Layanan 24/7', desc: 'Tim support kami siap membantu kapan saja' },
          ].map((f, i) => (
            <div key={i} className="col-md-4">
              <div className="card-container text-center">
                <i className={`bi ${f.icon}`} style={{fontSize: '2.5rem', color: f.color}}></i>
                <h5 className="mt-3">{f.title}</h5>
                <p className="text-muted">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
