'use client';

import { useEffect, useState } from 'react';

interface Admin {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended';
  plan: string;
  createdAt: string;
  store: { id: string; name: string; slug: string; isActive: boolean } | null;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const [form, setForm] = useState({ name: '', email: '', password: '', plan: 'free', status: 'active' });

  useEffect(() => { loadAdmins(); }, []);

  async function loadAdmins() {
    const res = await fetch('/api/super-admin/admins');
    const data = await res.json();
    setAdmins(data.admins || []);
    setLoading(false);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = editAdmin ? `/api/super-admin/admins/${editAdmin.id}` : '/api/super-admin/admins';
    const method = editAdmin ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      showToast(editAdmin ? 'Admin updated!' : 'Admin created!');
      setShowModal(false);
      setEditAdmin(null);
      setForm({ name: '', email: '', password: '', plan: 'free', status: 'active' });
      loadAdmins();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this admin? Their store will remain.')) return;
    await fetch(`/api/super-admin/admins/${id}`, { method: 'DELETE' });
    showToast('Admin deleted');
    loadAdmins();
  }

  async function toggleStatus(admin: Admin) {
    const newStatus = admin.status === 'active' ? 'suspended' : 'active';
    await fetch(`/api/super-admin/admins/${admin.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    showToast(`Admin ${newStatus}`);
    loadAdmins();
  }

  function openCreate() {
    setEditAdmin(null);
    setForm({ name: '', email: '', password: '', plan: 'free', status: 'active' });
    setShowModal(true);
  }

  function openEdit(admin: Admin) {
    setEditAdmin(admin);
    setForm({ name: admin.name, email: admin.email, password: '', plan: admin.plan, status: admin.status });
    setShowModal(true);
  }

  const filtered = admins.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Management</h1>
          <p className="page-subtitle">Manage store admins across the platform</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Create Admin</button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            className="form-input search-input"
            placeholder="Search admins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="badge badge-accent">{filtered.length} admins</div>
      </div>

      <div className="glass-card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Admin</th>
              <th>Email</th>
              <th>Store</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No admins found</td></tr>
            ) : filtered.map((admin) => (
              <tr key={admin.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar">{admin.name[0]?.toUpperCase()}</div>
                    <span style={{ fontWeight: 600 }}>{admin.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{admin.email}</td>
                <td>
                  {admin.store ? (
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{admin.store.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/{admin.store.slug}</div>
                    </div>
                  ) : <span style={{ color: 'var(--text-muted)' }}>No store</span>}
                </td>
                <td><span className="badge badge-accent">{admin.plan}</span></td>
                <td>
                  <span className={`badge ${admin.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                    {admin.status}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {new Date(admin.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(admin)}>Edit</button>
                    <button
                      className={`btn btn-sm ${admin.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => toggleStatus(admin)}
                    >
                      {admin.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(admin.id)}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editAdmin ? 'Edit Admin' : 'Create New Admin'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" placeholder="John Smith" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" placeholder="admin@store.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{editAdmin ? 'New Password (leave blank to keep)' : 'Password'}</label>
                  <input type="password" className="form-input" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editAdmin} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Plan</label>
                    <select className="form-select" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  {editAdmin && (
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editAdmin ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-container">
          <div className="toast success">✅ {toast}</div>
        </div>
      )}
    </div>
  );
}
