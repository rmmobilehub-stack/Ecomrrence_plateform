'use client';

import { MessageCircle, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Lead } from '@/lib/types';
import { storefrontPath } from '@/lib/storefront-paths';

type SuperAdminLead = Lead & {
  store: { id: string; name: string; slug: string } | null;
};

export default function SuperAdminLeadsPage() {
  const [leads, setLeads] = useState<SuperAdminLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch('/api/super-admin/leads');
    const data = await response.json();
    setLeads(data.leads ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const stores = useMemo(() => Array.from(new Map(leads.filter((lead) => lead.store).map((lead) => [lead.store!.id, lead.store!])).values()), [leads]);
  const visible = leads.filter((lead) => (!storeId || lead.storeId === storeId) && (!status || lead.status === status));

  const changeStatus = async (id: string, nextStatus: Lead['status']) => {
    const response = await fetch('/api/super-admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: nextStatus }),
    });
    if (response.ok) setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, status: nextStatus } : lead));
  };

  return <>
    <div className="page-header">
      <div><p className="eyebrow">CROSS-STORE CHATS</p><h1 className="page-title">Chats</h1><p className="page-subtitle">Review chatbot leads from every storefront in one place.</p></div>
      <button className="btn btn-secondary" onClick={() => void load()} disabled={loading}><RefreshCw size={15} className={loading ? 'spin' : ''}/> Refresh</button>
    </div>
    <div className="filter-bar super-order-filters">
      <select className="form-select" value={storeId} onChange={(event) => setStoreId(event.target.value)}><option value="">All stores</option>{stores.map((store) => <option value={store.id} key={store.id}>{store.name}</option>)}</select>
      <select className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{['new', 'contacted', 'qualified', 'closed'].map((value) => <option value={value} key={value}>{value}</option>)}</select>
    </div>
    <div className="glass-card table-container">
      <table className="data-table leads-table">
        <thead><tr><th>Visitor</th><th>Store</th><th>Contact</th><th>Interested in</th><th>Received</th><th>Status</th></tr></thead>
        <tbody>{loading
          ? <tr><td colSpan={6}>Loading chats...</td></tr>
          : visible.length === 0
            ? <tr><td colSpan={6}><div className="leads-empty"><MessageCircle size={24}/><strong>No chatbot leads yet</strong><span>New requests will appear here automatically.</span></div></td></tr>
            : visible.map((lead) => <tr key={lead.id}>
              <td><strong>{lead.name}</strong><small>Via storefront chatbot</small></td>
              <td><strong>{lead.store?.name ?? 'Unknown store'}</strong><small>{lead.store ? storefrontPath(lead.store.slug) : 'Store removed'}</small></td>
              <td><a className="lead-contact" href={lead.contact.includes('@') ? `mailto:${lead.contact}` : `tel:${lead.contact.replace(/[^+\d]/g, '')}`}>{lead.contact}</a></td>
              <td><span className="lead-interest">{lead.interest || 'General enquiry'}</span></td>
              <td>{new Date(lead.createdAt).toLocaleDateString()}<small>{new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></td>
              <td><select className={`status-select lead-status-${lead.status}`} value={lead.status} onChange={(event) => void changeStatus(lead.id, event.target.value as Lead['status'])}><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="closed">Closed</option></select></td>
            </tr>)}</tbody>
      </table>
    </div>
  </>;
}
