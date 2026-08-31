'use client';

import { MessageCircle, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { Lead } from '@/lib/types';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch('/api/admin/leads');
    const data = await response.json();
    setLeads(data.leads ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const changeStatus = async (id: string, status: Lead['status']) => {
    const response = await fetch('/api/admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (response.ok) setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, status } : lead));
  };

  return <>
    <div className="page-header">
      <div><h1 className="page-title">Leads</h1><p className="page-subtitle">Visitors who requested help through the storefront assistant.</p></div>
      <button className="btn btn-secondary" onClick={() => void load()} disabled={loading}><RefreshCw size={15} className={loading ? 'spin' : ''}/> Refresh</button>
    </div>
    <div className="glass-card table-container">
      <table className="data-table leads-table">
        <thead><tr><th>Visitor</th><th>Contact</th><th>Interested in</th><th>Received</th><th>Status</th></tr></thead>
        <tbody>{loading
          ? <tr><td colSpan={5}>Loading leads…</td></tr>
          : leads.length === 0
            ? <tr><td colSpan={5}><div className="leads-empty"><MessageCircle size={24}/><strong>No chatbot leads yet</strong><span>New requests will appear here automatically.</span></div></td></tr>
            : leads.map((lead) => <tr key={lead.id}>
              <td><strong>{lead.name}</strong><small>Via storefront chatbot</small></td>
              <td><a className="lead-contact" href={lead.contact.includes('@') ? `mailto:${lead.contact}` : `tel:${lead.contact.replace(/[^+\d]/g, '')}`}>{lead.contact}</a></td>
              <td><span className="lead-interest">{lead.interest || 'General enquiry'}</span></td>
              <td>{new Date(lead.createdAt).toLocaleDateString()}<small>{new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></td>
              <td><select className={`status-select lead-status-${lead.status}`} value={lead.status} onChange={(event) => void changeStatus(lead.id, event.target.value as Lead['status'])}><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="closed">Closed</option></select></td>
            </tr>)}</tbody>
      </table>
    </div>
  </>;
}

