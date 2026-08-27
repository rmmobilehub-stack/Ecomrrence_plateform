'use client';

import { Bell, CheckCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Notice = { id: string; title: string; message: string; orderId: string; isRead: boolean; createdAt: string };

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notice[]>([]);
  const [unread, setUnread] = useState(0);
  const router = useRouter();
  const load = useCallback(async () => {
    const response = await fetch('/api/admin/notifications');
    if (!response.ok) return;
    const data = await response.json();
    setItems(data.notifications ?? []); setUnread(data.unreadCount ?? 0);
  }, []);
  useEffect(() => {
    void load();
    const refreshIfVisible = () => { if (document.visibilityState === 'visible') void load(); };
    const timer = window.setInterval(refreshIfVisible, 60000);
    window.addEventListener('focus', refreshIfVisible);
    document.addEventListener('visibilitychange', refreshIfVisible);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refreshIfVisible); document.removeEventListener('visibilitychange', refreshIfVisible); };
  }, [load]);
  const read = async (item: Notice) => {
    if (!item.isRead) await fetch('/api/admin/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'read', id: item.id }) });
    setOpen(false); router.push(`/admin/orders/${item.orderId}`); router.refresh();
  };
  return <div className="notif-bell-wrapper">
    <button className="notif-bell-btn" aria-label="Notifications" onClick={() => { setOpen(!open); load(); }}><Bell size={18}/>{unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}</button>
    {open && <div className="notif-dropdown">
      <div className="notif-dropdown-header"><span>Notifications</span>{unread > 0 && <button className="btn btn-ghost btn-sm" onClick={async () => { await fetch('/api/admin/notifications', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'read-all'}) }); load(); }}><CheckCheck size={14}/> Read all</button>}</div>
      {items.length === 0 ? <div className="empty-note">No notifications yet.</div> : items.map((item) => <button className={`notif-item ${item.isRead ? '' : 'unread'}`} key={item.id} onClick={() => read(item)}>{!item.isRead && <span className="notif-dot"/>}<div><div className="notif-item-title">{item.title}</div><div className="notif-item-msg">{item.message}</div><div className="notif-item-time">{new Date(item.createdAt).toLocaleString()}</div></div></button>)}
    </div>}
  </div>;
}
