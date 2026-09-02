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
interface StoreOption { id: string; name: string; slug: string; isActive: boolean }

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const emptyForm = { name: '', email: '', password: '', plan: 'free', status: 'active', storeId: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadAdmins(); }, []);

  async function loadAdmins() {
    const [adminResponse, storeResponse] = await Promise.all([fetch('/api/super-admin/admins'), fetch('/api/super-admin/stores')]);
    const [adminData, storeData] = await Promise.all([adminResponse.json(), storeResponse.json()]);
    setAdmins(adminData.admins || []);
    setStores(storeData.stores || []);
    setLoading(false);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setFormError('');
    const url = editAdmin ? `/api/super-admin/admins/${editAdmin.id}` : '/api/super-admin/admins';
    const method = editAdmin ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      showToast(editAdmin ? 'Store admin login updated!' : 'Admin and store created!');
      setShowModal(false);
      setEditAdmin(null);
      setForm(emptyForm);
      await loadAdmins();
    } else {
      setFormError(data.error || 'Could not save this admin and store.');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this admin login? The assigned store and its data will remain available to its other admins.')) return;
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
    setForm(emptyForm); setFormError('');
    setShowModal(true);
  }

  function openEdit(admin: Admin) {
    setEditAdmin(admin);
    setForm({ ...emptyForm, name: admin.name, email: admin.email, password: '', plan: admin.plan, status: admin.status, storeId: admin.store?.id ?? '' });
    setFormError('');
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
          <p className="page-subtitle">Assign one or more administrator logins to any existing store.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} disabled={stores.length === 0}>+ Create Admin</button>
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
              <div><h3 className="modal-title">{editAdmin ? 'Change Store Admin Login' : 'Create New Admin'}</h3>{editAdmin && <p className="modal-subtitle">These credentials belong only to {editAdmin.store?.name ?? 'this assigned store'}.</p>}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Admin display name</label>
                  <input className="form-input" placeholder="John Smith" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Login email / username</label>
                  <input type="email" className="form-input" placeholder="admin@store.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <section className="admin-store-setup">
                  <div className="admin-store-setup-heading"><strong>Assigned store</strong><span>This login will only manage the selected store. You can assign multiple admins to the same store.</span></div>
                  <label className="form-group"><span className="form-label">Store</span><select className="form-select" value={form.storeId} onChange={(e) => setForm({ ...form, storeId: e.target.value })} required><option value="">Choose a store</option>{stores.map((store) => <option value={store.id} key={store.id}>{store.name} (/{store.slug})</option>)}</select></label>
                </section>
                <div className="form-group">
                  <label className="form-label">{editAdmin ? 'New login password' : 'Login password'}</label>
                  <input type="password" className="form-input" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editAdmin} />
                  {editAdmin && <small className="form-hint">Leave blank to keep the current password. Once changed, the new email and password will be used on the store-admin login page.</small>}
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
              {formError && <p className="form-error modal-form-error">{formError}</p>}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editAdmin ? 'Update admin' : 'Create & assign admin'}</button>
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
