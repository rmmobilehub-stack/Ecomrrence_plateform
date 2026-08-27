'use client';
import { useEffect, useState } from 'react';
type Category = { id: string; name: string; description: string; slug: string };
export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]); const [name, setName] = useState(''); const [description, setDescription] = useState('');
  const load = () => fetch('/api/admin/categories').then(r => r.json()).then(d => setItems(d.categories ?? []));
  useEffect(() => { void load(); }, []);
  const create = async (e: React.FormEvent) => { e.preventDefault(); if (!name.trim()) return; await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description }) }); setName(''); setDescription(''); void load(); };
  return <><div className="page-header"><div><h1 className="page-title">Categories</h1><p className="page-subtitle">Organize products for easier browsing.</p></div></div><form className="glass-card inline-form" onSubmit={create}><input className="form-input" placeholder="Category name" value={name} onChange={e => setName(e.target.value)}/><input className="form-input" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)}/><button className="btn btn-primary">Add category</button></form><div className="stack-list">{items.length === 0 ? <div className="empty-state">No categories yet.</div> : items.map(c => <div className="glass-card list-row" key={c.id}><div><strong>{c.name}</strong><small>/{c.slug}{c.description ? ` · ${c.description}` : ''}</small></div><button className="btn btn-danger btn-sm" onClick={async () => { if (confirm('Delete this category?')) { await fetch(`/api/admin/categories?id=${c.id}`, { method: 'DELETE' }); void load(); } }}>Delete</button></div>)}</div></>;
}
