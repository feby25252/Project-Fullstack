import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loading from '../components/common/Loading';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ full_name: '', bio: '', phone: '', address: '' });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/profile').then(res => {
      if (res.data?.success) {
        const p = res.data.data;
        setProfile(p);
        setForm({ full_name: p.full_name || '', bio: p.bio || '', phone: p.phone || '', address: p.address || '' });
        setAvatarPreview(p.avatar_url || '');
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const fd = new FormData();
      fd.append('full_name', form.full_name);
      fd.append('bio', form.bio);
      fd.append('phone', form.phone);
      fd.append('address', form.address);
      if (avatar) fd.append('avatar', avatar);

      const res = await api.put('/profile', fd);
      if (res.data?.success) setMessage('Profil berhasil diperbarui!');
      else setMessage(res.data?.message || 'Gagal memperbarui profil');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container py-5">
      <div className="row g-4 justify-content-center">
        <div className="col-lg-8">
          <div className="card-container">
            <h3 className="mb-4"><i className="bi bi-person-circle"></i> Profil Saya</h3>

            {message && (
              <div className={`alert ${message.includes('berhasil') ? 'alert-success' : 'alert-danger'} rounded-3`}>
                {message}
              </div>
            )}

            <div className="row g-4">
              <div className="col-md-4 text-center">
                <img
                  src={avatarPreview || '/img/default-avatar.svg'}
                  alt="Avatar"
                  className="rounded-circle mb-3"
                  style={{width:'120px',height:'120px',objectFit:'cover'}}
                  onError={(e) => { e.target.src = '/img/default-avatar.svg'; }}
                />
                <div>
                  <input type="file" className="form-control form-control-sm" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} />
                  <small className="text-muted">Maks 2MB (JPG, PNG, WEBP)</small>
                </div>
                <div className="mt-2">
                  <span className={`badge ${profile?.role_id === 1 ? 'bg-info' : 'bg-success'} rounded-pill px-3`}>
                    {profile?.role_id === 1 ? 'Admin' : 'User'}
                  </span>
                </div>
              </div>
              <div className="col-md-8">
                <form onSubmit={handleSubmit} className="form-lensique">
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input type="text" className="form-control" value={user?.username || ''} disabled />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nama Lengkap</label>
                    <input type="text" className="form-control" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Bio</label>
                    <textarea className="form-control" rows="2" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">No. Telepon</label>
                    <input type="tel" className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Alamat</label>
                    <textarea className="form-control" rows="2" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                  </div>
                  <button type="submit" className="btn btn-lensique px-4" disabled={saving}>
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
