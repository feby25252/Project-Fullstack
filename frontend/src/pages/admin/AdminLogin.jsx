import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import api from '../../services/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;
      if (!data.success) { setError(data.message || 'Login gagal'); return; }
      if (!data.data?.user || data.data.user.role_id !== 1) { setError('Akses ditolak. Hanya admin yang dapat masuk.'); return; }
      login(data.data.token, data.data.user);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg, var(--soft-pink), var(--baby-blue))'}}>
      <div className="auth-card">
        <div className="auth-logo"><i className="bi bi-eyeglasses"></i></div>
        <h2>Admin Lensique</h2>
        <p className="auth-subtitle">Masuk ke panel admin</p>
        {error && <div className="alert alert-danger rounded-3 mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="form-lensique">
          <div className="form-group mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="admin@lensique.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" placeholder="********" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-lensique w-100 py-2" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
