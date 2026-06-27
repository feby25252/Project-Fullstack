import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ full_name: '', username: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password minimal 6 karakter.'); return; }
    if (form.password !== form.confirmPassword) { setError('Konfirmasi password tidak cocok.'); return; }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        full_name: form.full_name,
        username: form.username,
        email: form.email,
        password: form.password,
      });
      if (!res.data.success) { setError(res.data.message || 'Registrasi gagal'); return; }
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-logo"><i className="bi bi-eyeglasses"></i> Lensique</div>
      <h2>Daftar Akun</h2>
      <p className="auth-subtitle">Buat akun Lensique untuk mulai berbelanja</p>

      {error && <div className="alert alert-danger rounded-3 mb-3">{error}</div>}

      <form onSubmit={handleSubmit} className="form-lensique">
        <div className="form-group mb-3">
          <label className="form-label">Nama Lengkap</label>
          <input type="text" className="form-control" value={form.full_name} onChange={set('full_name')} required />
        </div>
        <div className="form-group mb-3">
          <label className="form-label">Username</label>
          <input type="text" className="form-control" value={form.username} onChange={set('username')} required />
        </div>
        <div className="form-group mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" value={form.email} onChange={set('email')} required />
        </div>
        <div className="form-group mb-3">
          <label className="form-label">Password</label>
          <div className="input-group">
            <input type={showPw ? 'text' : 'password'} className="form-control" value={form.password} onChange={set('password')} required />
            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPw(!showPw)}>
              <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </button>
          </div>
          <small className="text-muted">Minimal 6 karakter</small>
        </div>
        <div className="form-group mb-3">
          <label className="form-label">Konfirmasi Password</label>
          <input type="password" className="form-control" value={form.confirmPassword} onChange={set('confirmPassword')} required />
        </div>
        <button type="submit" className="btn btn-lensique w-100 py-2" disabled={loading}>
          {loading ? 'Memproses...' : 'Daftar'}
        </button>
      </form>
      <p className="text-center mt-3 text-muted">
        Sudah punya akun? <Link to="/login" style={{color:'#C77986',fontWeight:600}}>Masuk di sini</Link>
      </p>
    </div>
  );
}
