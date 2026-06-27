import { useState, useEffect } from 'react';
import { formatDate } from '../../utils/format';
import api from '../../services/api';
import Pagination from '../../components/common/Pagination';
import Loading from '../../components/common/Loading';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ username:'', email:'', password:'', full_name:'', role_id:2, bio:'', phone:'', address:'' });
  const [saving, setSaving] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    api.get(`/admin/users?page=${page}&limit=10&search=${encodeURIComponent(search)}`).then(r => {
      if (r.data?.success) { setUsers(r.data.data || []); setTotalPages(r.data.pagination?.totalPages || 1); }
    }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(loadUsers, [page, search]);

  const openAdd = () => { setForm({ username:'', email:'', password:'', full_name:'', role_id:2, bio:'', phone:'', address:'' }); setModal('add'); };
  const openEdit = async (id) => {
    const r = await api.get(`/admin/users/${id}`);
    if (r.data?.success) {
      const u = r.data.data;
      setForm({ username:u.username, email:u.email, password:'', full_name:u.full_name||'', role_id:u.role_id, bio:u.bio||'', phone:u.phone||'', address:u.address||'' });
      setModal(u);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (modal !== 'add' && !payload.password) delete payload.password;
      if (modal === 'add') await api.post('/admin/users', payload);
      else await api.put(`/admin/users/${modal.id}`, payload);
      setModal(null); loadUsers();
    } catch (err) { alert(err.response?.data?.message || 'Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id, isActive) => {
    if (!confirm(isActive ? 'Aktifkan user ini?' : 'Nonaktifkan user ini?')) return;
    await api.put(`/admin/users/${id}/active`, { is_active: isActive });
    loadUsers();
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;
    await api.delete(`/admin/users/${id}`);
    loadUsers();
  };

  return (
    <>
      <div className="page-header"><h1>Users</h1><p>Kelola semua pengguna Lensique</p></div>
      <div className="card" style={{border:'none',borderRadius:'20px',padding:'24px'}}>
        <div className="d-flex justify-content-between mb-3 gap-2">
          <input className="form-control" placeholder="Cari user..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{maxWidth:'300px'}} />
          <button className="btn btn-success rounded-pill" onClick={openAdd}><i className="bi bi-plus-lg"></i> Tambah</button>
        </div>
        {loading ? <Loading /> : (
          <div className="table-responsive">
            <table className="table">
              <thead><tr><th>ID</th><th>Nama</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>Aksi</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td><strong>{u.full_name || u.username}</strong><br/><small className="text-muted">@{u.username}</small></td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role_id===1?'bg-info':'bg-success'} rounded-pill`}>{u.role_id===1?'Admin':'User'}</span></td>
                    <td><span className={`badge ${u.is_active?'bg-success':'bg-danger'} rounded-pill`}>{u.is_active?'Aktif':'Nonaktif'}</span></td>
                    <td><small>{formatDate(u.last_login)}</small></td>
                    <td>
                      <button className="btn btn-sm btn-warning rounded-pill me-1" onClick={() => openEdit(u.id)}>Edit</button>
                      <button className={`btn btn-sm rounded-pill me-1 ${u.is_active?'btn-outline-danger':'btn-outline-success'}`}
                        onClick={() => toggleActive(u.id, u.is_active?0:1)}>{u.is_active?'Nonaktifkan':'Aktifkan'}</button>
                      <button className="btn btn-sm btn-danger rounded-pill" onClick={() => handleDelete(u.id)}>Hapus</button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan="7" className="text-center text-muted">Tidak ada user</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {modal && (
        <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div className="card" style={{maxWidth:'550px',width:'90%',borderRadius:'20px',padding:'32px',maxHeight:'90vh',overflow:'auto'}}>
            <div className="d-flex justify-content-between mb-3"><h4>{modal==='add'?'Tambah User':'Edit User'}</h4>
              <button className="btn" onClick={() => setModal(null)} style={{fontSize:'1.5rem'}}>&times;</button></div>
            <div className="mb-3"><label className="form-label">Username</label><input className="form-control" value={form.username} onChange={e => setForm({...form,username:e.target.value})} /></div>
            <div className="mb-3"><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({...form,email:e.target.value})} /></div>
            <div className="mb-3"><label className="form-label">Password {modal!=='add'&&'(kosongkan jika tidak diubah)'}</label>
              <input type="password" className="form-control" value={form.password} onChange={e => setForm({...form,password:e.target.value})} /></div>
            <div className="mb-3"><label className="form-label">Nama Lengkap</label><input className="form-control" value={form.full_name} onChange={e => setForm({...form,full_name:e.target.value})} /></div>
            <div className="mb-3"><label className="form-label">Role</label>
              <select className="form-select" value={form.role_id} onChange={e => setForm({...form,role_id:parseInt(e.target.value)})}>
                <option value="2">User</option><option value="1">Admin</option></select></div>
            <div className="mb-3"><label className="form-label">Bio</label><textarea className="form-control" rows="2" value={form.bio} onChange={e => setForm({...form,bio:e.target.value})} /></div>
            <div className="mb-3"><label className="form-label">Telepon</label><input className="form-control" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} /></div>
            <div className="mb-3"><label className="form-label">Alamat</label><textarea className="form-control" rows="2" value={form.address} onChange={e => setForm({...form,address:e.target.value})} /></div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary flex-grow-1" onClick={() => setModal(null)}>Batal</button>
              <button className="btn btn-primary flex-grow-1" onClick={handleSave} disabled={saving}>{saving?'Menyimpan...':'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
