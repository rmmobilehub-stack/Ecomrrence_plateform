'use client';

import { RefreshCw, UserRound } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type StoreUser = {
  id: string;
  storeId: string;
  email: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string | null;
  hasPassword: boolean;
};

function formatDate(value?: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<StoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [editUser, setEditUser] = useState<StoreUser | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users ?? []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.toLowerCase().includes(query),
    );
  }, [users, search]);

  const openEdit = (user: StoreUser) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, phone: user.phone || '', password: '' });
    setFormError('');
  };

  const saveUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editUser) return;
    setSaving(true);
    setFormError('');
    try {
      const response = await fetch(`/api/admin/users/${editUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFormError(data.error || 'Could not update user');
        return;
      }
      setUsers(current => current.map(entry => (entry.id === editUser.id ? data.user : entry)));
      setEditUser(null);
      showToast('User updated');
    } catch {
      setFormError('Could not update user');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (user: StoreUser) => {
    if (!confirm(`Delete ${user.name || user.email}? Their orders stay, but the account is removed.`)) return;
    const response = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      showToast(data.error || 'Could not delete user');
      return;
    }
    setUsers(current => current.filter(entry => entry.id !== user.id));
    if (editUser?.id === user.id) setEditUser(null);
    showToast('User deleted');
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Registered customer accounts for this store — view, update, or delete.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="form-input search-input"
            placeholder="Search by name, email, or phone…"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>
        <div className="badge badge-accent">{filtered.length} users</div>
      </div>

      <div className="glass-card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Registered</th>
              <th>Last login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>Loading users…</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="leads-empty">
                    <UserRound size={24} />
                    <strong>No registered users yet</strong>
                    <span>Accounts created from the app or website will appear here.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar">{(user.name || user.email || 'U')[0]?.toUpperCase()}</div>
                      <div>
                        <strong>{user.name || 'Unnamed'}</strong>
                        <small>{user.hasPassword ? 'Password account' : 'No password set'}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <a className="lead-contact" href={`mailto:${user.email}`}>
                      {user.email}
                    </a>
                    {user.phone ? (
                      <>
                        <br />
                        <a className="lead-contact" href={`tel:${user.phone.replace(/[^+\d]/g, '')}`}>
                          {user.phone}
                        </a>
                      </>
                    ) : (
                      <small>No phone</small>
                    )}
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>{formatDate(user.lastLoginAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => openEdit(user)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" type="button" onClick={() => void deleteUser(user)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editUser ? (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal" onClick={event => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Update user</h3>
                <p className="modal-subtitle">Change profile details or set a new password for this customer.</p>
              </div>
              <button className="btn btn-ghost btn-icon" type="button" onClick={() => setEditUser(null)}>
                ✕
              </button>
            </div>
            <form onSubmit={event => void saveUser(event)}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <label className="form-group">
                  <span className="form-label">Full name</span>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
                    required
                  />
                </label>
                <label className="form-group">
                  <span className="form-label">Email</span>
                  <input
                    type="email"
                    className="form-input"
                    value={form.email}
                    onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
                    required
                  />
                </label>
                <label className="form-group">
                  <span className="form-label">Phone</span>
                  <input
                    className="form-input"
                    value={form.phone}
                    onChange={event => setForm(current => ({ ...current, phone: event.target.value }))}
                  />
                </label>
                <label className="form-group">
                  <span className="form-label">New password</span>
                  <input
                    type="password"
                    className="form-input"
                    value={form.password}
                    onChange={event => setForm(current => ({ ...current, password: event.target.value }))}
                    placeholder="Leave blank to keep current password"
                  />
                  <small className="form-hint">Optional. Minimum 6 characters if set.</small>
                </label>
              </div>
              {formError ? <p className="form-error modal-form-error">{formError}</p> : null}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="toast-container">
          <div className="toast success">✅ {toast}</div>
        </div>
      ) : null}
    </>
  );
}
