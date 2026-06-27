import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatRupiah } from '../../utils/format';
import api from '../../services/api';
import Loading from '../../components/common/Loading';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => {
      if (r.data?.success) setStats(r.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (!stats) return <div className="empty-state"><h4>Gagal memuat dashboard</h4></div>;

  const cards = [
    { label: 'Total Users', value: stats.total_users, icon: 'bi-people', color: 'var(--baby-blue)' },
    { label: 'Total Produk', value: stats.total_products, icon: 'bi-box-seam', color: 'var(--soft-purple)' },
    { label: 'Total Pesanan', value: stats.total_orders, icon: 'bi-truck', color: 'var(--soft-pink)' },
    { label: 'Total Review', value: stats.total_reviews, icon: 'bi-star', color: 'var(--soft-yellow, #FCF3CF)' },
    { label: 'Wishlist', value: stats.total_wishlist, icon: 'bi-heart', color: '#ABEBC6' },
  ];

  return (
    <>
      <div className="page-header"><h1>Dashboard</h1><p>Ringkasan data Lensique</p></div>
      <div className="row g-4 mb-4">
        {cards.map(c => (
          <div key={c.label} className="col-6 col-md-4 col-lg">
            <div className="card text-center" style={{background:c.color,border:'none',borderRadius:'20px',padding:'24px'}}>
              <i className={`bi ${c.icon}`} style={{fontSize:'2rem'}}></i>
              <h3 className="mt-2 mb-0">{c.value ?? 0}</h3>
              <small className="text-muted">{c.label}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card" style={{border:'none',borderRadius:'20px',padding:'24px'}}>
            <h5 className="mb-3">Pesanan Terbaru</h5>
            <div className="table-responsive">
              <table className="table">
                <thead><tr><th>Order #</th><th>User</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {(stats.recent_orders || []).map(o => (
                    <tr key={o.id}>
                      <td><Link to={`/admin/orders/${o.id}`}>{o.order_number}</Link></td>
                      <td>{o.username || '-'}</td>
                      <td>{formatRupiah(o.total_amount)}</td>
                      <td><span className={`badge-status badge-${o.status}`}>{o.status}</span></td>
                    </tr>
                  ))}
                  {(!stats.recent_orders || stats.recent_orders.length === 0) && <tr><td colSpan="4" className="text-center text-muted">Belum ada pesanan</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card" style={{border:'none',borderRadius:'20px',padding:'24px'}}>
            <h5 className="mb-3">Stok Rendah</h5>
            {(stats.low_stock_products || []).map(p => (
              <div key={p.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <div><strong>{p.name}</strong><br/><small className="text-muted">{p.category_name || '-'}</small></div>
                <span className="badge bg-danger rounded-pill">{p.stock} sisa</span>
              </div>
            ))}
            {(!stats.low_stock_products || stats.low_stock_products.length === 0) && <p className="text-muted text-center">Semua stok aman</p>}
          </div>
        </div>
      </div>
    </>
  );
}
