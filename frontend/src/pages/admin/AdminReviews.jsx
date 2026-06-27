import { useState, useEffect } from 'react';
import { formatDate } from '../../utils/format';
import api from '../../services/api';
import Pagination from '../../components/common/Pagination';
import Loading from '../../components/common/Loading';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadReviews = () => {
    setLoading(true);
    api.get(`/admin/reviews?page=${page}&limit=10`).then(r => {
      if (r.data?.success) { setReviews(r.data.data || []); setTotalPages(r.data.pagination?.totalPages || 1); }
    }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(loadReviews, [page]);

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus review ini?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      loadReviews();
    } catch (err) { alert('Gagal menghapus: ' + (err.response?.data?.message || err.message)); }
  };

  return (
    <>
      <div className="page-header"><h1>Reviews</h1><p>Kelola ulasan produk dari pengguna</p></div>
      <div className="card" style={{border:'none',borderRadius:'20px',padding:'24px'}}>
        {loading ? <Loading /> : (
          <div className="table-responsive">
            <table className="table">
              <thead><tr><th>ID</th><th>Produk</th><th>User</th><th>Rating</th><th>Comment</th><th>Tanggal</th><th>Aksi</th></tr></thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.product_name || '-'}</td>
                    <td>{r.username || '-'}</td>
                    <td><span className="badge bg-warning text-dark rounded-pill">{r.rating} / 5</span></td>
                    <td style={{maxWidth:'300px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}} title={r.comment}>{r.comment || '-'}</td>
                    <td><small>{formatDate(r.created_at)}</small></td>
                    <td><button className="btn btn-sm btn-danger rounded-pill" onClick={() => handleDelete(r.id)}>Hapus</button></td>
                  </tr>
                ))}
                {reviews.length === 0 && <tr><td colSpan="7" className="text-center text-muted">Tidak ada review</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </>
  );
}
