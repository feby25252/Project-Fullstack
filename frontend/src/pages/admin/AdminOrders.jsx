import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatRupiah, formatDate, getStatusInfo, getPaymentInfo } from '../../utils/format';
import api from '../../services/api';
import Pagination from '../../components/common/Pagination';
import Loading from '../../components/common/Loading';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    let url = `/admin/orders?page=${page}&limit=10`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (statusFilter) url += `&status=${statusFilter}`;
    if (paymentFilter) url += `&payment_status=${paymentFilter}`;
    api.get(url).then(r => {
      if (r.data?.success) { setOrders(r.data.data || []); setTotalPages(r.data.pagination?.totalPages || 1); }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page, search, statusFilter, paymentFilter]);

  return (
    <>
      <div className="page-header"><h1>Orders</h1><p>Kelola semua pesanan</p></div>
      <div className="card" style={{border:'none',borderRadius:'20px',padding:'24px'}}>
        <div className="d-flex gap-2 flex-wrap mb-3">
          <input className="form-control" placeholder="Cari order/user..." value={search} onChange={e => setSearch(e.target.value)} style={{maxWidth:'250px'}} />
          <select className="form-select" style={{maxWidth:'160px'}} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Semua Status</option>
            {['pending','processing','shipped','delivered','cancelled'].map(s => <option key={s} value={s}>{getStatusInfo(s).label}</option>)}
          </select>
          <select className="form-select" style={{maxWidth:'160px'}} value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
            <option value="">Semua Pembayaran</option>
            {['pending','paid','failed'].map(s => <option key={s} value={s}>{getPaymentInfo(s).label}</option>)}
          </select>
        </div>
        {loading ? <Loading /> : (
          <div className="table-responsive">
            <table className="table">
              <thead><tr><th>Order #</th><th>User</th><th>Total</th><th>Status</th><th>Bayar</th><th>Tanggal</th><th>Aksi</th></tr></thead>
              <tbody>
                {orders.map(o => {
                  const si = getStatusInfo(o.status || o.order_status);
                  const pi = getPaymentInfo(o.payment?.payment_status || 'pending');
                  return (
                    <tr key={o.id}>
                      <td><strong>{o.order_number}</strong></td>
                      <td>{o.username || '-'}<br/><small className="text-muted">{o.email || ''}</small></td>
                      <td>{formatRupiah(o.total_amount)}</td>
                      <td><span className={`badge-status ${si.cls}`}>{si.label}</span></td>
                      <td><span className={`badge-status ${pi.cls}`}>{pi.label}</span></td>
                      <td><small>{formatDate(o.created_at)}</small></td>
                      <td><Link to={`/admin/orders/${o.id}`} className="btn btn-sm btn-lensique rounded-pill">Detail</Link></td>
                    </tr>
                  );
                })}
                {orders.length === 0 && <tr><td colSpan="7" className="text-center text-muted">Tidak ada pesanan</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </>
  );
}
