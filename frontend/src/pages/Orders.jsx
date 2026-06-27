import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatRupiah, formatDate, getStatusInfo, getPaymentInfo } from '../utils/format';
import api from '../services/api';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    let url = `/orders/history?page=${page}&limit=10`;
    if (filter) url += `&status=${filter}`;
    api.get(url).then(r => {
      if (r.data?.success) {
        setOrders(r.data.data || []);
        setTotalPages(r.data.pagination?.totalPages || 1);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page, filter]);

  if (loading) return <Loading />;

  return (
    <div className="container py-4">
      <div className="section-heading"><h2><i className="bi bi-receipt"></i> Riwayat Pesanan</h2><div className="heading-line"></div></div>

      <div className="d-flex gap-2 mb-4 flex-wrap">
        {['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
          <button key={s} className={`btn btn-sm rounded-pill ${filter === s ? 'btn-lensique text-white' : 'btn-outline-secondary'}`}
            onClick={() => { setFilter(s); setPage(1); }}>
            {s ? getStatusInfo(s).label : 'Semua'}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="empty-state"><i className="bi bi-receipt"></i><h4>Belum Ada Pesanan</h4>
          <p>Kamu belum memiliki pesanan</p><Link to="/katalog" className="btn btn-lensique mt-2">Mulai Belanja</Link></div>
      ) : (
        <>
          {orders.map(order => {
            const si = getStatusInfo(order.status || order.order_status);
            const pi = getPaymentInfo(order.payment?.payment_status || 'pending');
            return (
              <Link to={`/user/orders/${order.id}`} key={order.id} className="text-decoration-none">
                <div className="card-container mb-3" style={{cursor:'pointer',transition:'transform 0.2s'}}
                  onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform='none'}>
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                      <strong>{order.order_number}</strong>
                      <br /><small className="text-muted">{formatDate(order.created_at)}</small>
                    </div>
                    <span className={`badge-status ${si.cls}`}>{si.label}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted">{order.items?.length || 0} item &bull; {order.payment_method || '-'}</small>
                      <br /><span className={`badge-status ${pi.cls}`} style={{fontSize:'0.7rem'}}>{pi.label}</span>
                    </div>
                    <strong style={{color:'#C77986',fontSize:'1.1rem'}}>{formatRupiah(order.total_amount)}</strong>
                  </div>
                </div>
              </Link>
            );
          })}
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
