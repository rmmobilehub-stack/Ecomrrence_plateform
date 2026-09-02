'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Pencil, Plus, Store as StoreIcon } from 'lucide-react';
import { storefrontPath } from '@/lib/storefront-paths';
import { formatMoney } from '@/lib/currency';

type Store = {
  id: string; name: string; slug: string; logo: string; isActive: boolean; contactEmail: string; currency: string;
  productCount: number; activeProductCount: number; orderCount: number; revenue: number;
  admins: { id: string; name: string; email: string; status: string }[];
};
const emptyForm = { name: '', slug: '', contactEmail: '', currency: 'PKR' };

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const load = () => fetch('/api/super-admin/stores').then((response) => response.json()).then((data) => setStores(data.stores ?? []));
  useEffect(() => { void load(); }, []);

  const createStore = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    const response = await fetch('/api/super-admin/stores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) setError(data.error ?? 'Could not create store.');
    else { setShowModal(false); setForm(emptyForm); await load(); }
    setSaving(false);
  };

  return <><div className="page-header"><div><p className="eyebrow">STORE PORTFOLIO</p><h1 className="page-title">Stores</h1><p className="page-subtitle">Create a store first, then assign one or more administrator logins to it.</p></div><button className="btn btn-primary" onClick={() => { setForm(emptyForm); setError(''); setShowModal(true); }}><Plus size={17}/> Create store</button></div><div className="glass-card table-container"><table className="data-table stores-management-table"><thead><tr><th>Store</th><th>Assigned admins</th><th>Products</th><th>Orders</th><th>Revenue</th><th>Status</th><th>Actions</th></tr></thead><tbody>{stores.length === 0 ? <tr><td colSpan={7}>No stores yet. Create your first store to continue.</td></tr> : stores.map((store) => <tr key={store.id}><td><div className="store-table-identity">{store.logo ? <img src={store.logo} alt=""/> : <span><StoreIcon size={17}/></span>}<div><strong>{store.name}</strong><small>{storefrontPath(store.slug)} · {store.currency}</small></div></div></td><td><strong>{store.admins.length} admin{store.admins.length === 1 ? '' : 's'}</strong>{store.admins.slice(0, 2).map((admin) => <small key={admin.id}>{admin.name} · {admin.email}</small>)}{store.admins.length === 0 && <small>Not assigned yet</small>}<Link href="/super-admin/admins" className="table-inline-link">Manage access</Link></td><td><strong>{store.activeProductCount}</strong><small>{store.productCount} total</small></td><td>{store.orderCount}</td><td className="font-semibold">{formatMoney(store.revenue, store.currency)}</td><td><span className={`badge badge-${store.isActive ? 'success' : 'error'}`}>{store.isActive ? 'live' : 'offline'}</span></td><td><div className="table-actions"><Link href={`/super-admin/stores/${store.id}`} className="btn btn-secondary btn-sm"><Pencil size={14}/> Edit</Link><Link href={storefrontPath(store.slug)} className="btn btn-ghost btn-sm" target="_blank"><ExternalLink size={14}/> View</Link></div></td></tr>)}</tbody></table></div>
  {showModal && <div className="modal-overlay" onClick={() => setShowModal(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><h3 className="modal-title">Create Store</h3><p className="modal-subtitle">The store can be configured now and admins can be assigned afterwards.</p></div><button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>×</button></div><form onSubmit={createStore}><div className="modal-body"><div className="grid-2"><label className="form-group"><span className="form-label">Store name</span><input className="form-input" value={form.name} onChange={(event) => { const name = event.target.value; setForm({ ...form, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') }); }} placeholder="e.g. Urban Bags" required/></label><label className="form-group"><span className="form-label">Store URL</span><input className="form-input" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} placeholder="urban-bags" required/></label></div><label className="form-group"><span className="form-label">Public contact email</span><input type="email" className="form-input" value={form.contactEmail} onChange={(event) => setForm({ ...form, contactEmail: event.target.value })} placeholder="hello@store.com" required/></label><label className="form-group"><span className="form-label">Currency</span><select className="form-select" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })}><option>PKR</option><option>USD</option><option>EUR</option><option>GBP</option></select></label>{error && <p className="form-error">{error}</p>}</div><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create store'}</button></div></form></div></div>}
  </>;
}
