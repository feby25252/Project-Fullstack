import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;
      if (!data.success) {
        setError(data.message || 'Login gagal');
        return;
      }
      login(data.data.token, data.data.user);
      if (data.data.user.role_id === 1) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-logo"><i className="bi bi-eyeglasses"></i> Lensique</div>
      <h2>Masuk</h2>
      <p className="auth-subtitle">Masuk ke akun Lensique kamu</p>

      {error && <div className="alert alert-danger rounded-3 mb-3">{error}</div>}

      <form onSubmit={handleSubmit} className="form-lensique">
        <div className="form-group mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" placeholder="email@contoh.com" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group mb-3">
          <label className="form-label">Password</label>
          <div className="input-group">
            <input type={showPw ? 'text' : 'password'} className="form-control" placeholder="********" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPw(!showPw)}>
              <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn-lensique w-100 py-2" disabled={loading}>
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>
      <p className="text-center mt-3 text-muted">
        Belum punya akun? <Link to="/register" style={{color:'#C77986',fontWeight:600}}>Daftar sekarang</Link>
      </p>
    </div>
  );
}
