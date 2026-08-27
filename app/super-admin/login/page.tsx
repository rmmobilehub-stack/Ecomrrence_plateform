'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BrandMark from '@/components/ui/BrandMark';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'super-admin' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        router.push('/super-admin');
        router.refresh();
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>
      <div className="login-container">
        <div className="login-logo">
          <BrandMark size={27} className="login-brand-mark" />
          <div>
            <div className="login-logo-name">ShopSaaS</div>
            <div className="login-logo-sub">Super Admin Portal</div>
          </div>
        </div>

        <div className="glass-card login-card">
          <div className="super-badge">🔐 Super Admin Access</div>
          <h1 className="login-title">Platform Control</h1>
          <p className="login-subtitle">Sign in to manage the entire platform</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Super Admin Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="superadmin@platform.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="login-error">⚠️ {error}</div>
            )}

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? <span className="spin">⟳</span> : null}
              {loading ? 'Signing in...' : 'Access Platform'}
            </button>
          </form>

          <div className="login-divider">
            <a href="/login" className="login-switch-link">
              Store Admin? Login here →
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; position: relative; overflow: hidden; }
        .login-bg-orbs { position: fixed; inset: 0; pointer-events: none; }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.12; }
        .orb-1 { width: 600px; height: 600px; background: #ff4d6d; top: -200px; left: -200px; }
        .orb-2 { width: 400px; height: 400px; background: #ffc53d; bottom: -100px; right: -100px; }
        .login-container { position: relative; z-index: 1; width: 100%; max-width: 440px; }
        .login-logo { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; justify-content: center; }
        .login-logo-icon { width: 52px; height: 52px; background: linear-gradient(135deg, #ff4d6d, #ffc53d); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: 0 4px 24px rgba(255,77,109,0.3); }
        .login-logo-name { font-size: 1.4rem; font-weight: 800; }
        .login-logo-sub { font-size: 0.75rem; color: var(--text-muted); }
        .login-card { padding: 36px; }
        .super-badge { display: inline-block; background: rgba(255,77,109,0.1); border: 1px solid rgba(255,77,109,0.25); border-radius: 100px; padding: 4px 14px; font-size: 0.75rem; font-weight: 600; color: #ff4d6d; margin-bottom: 12px; }
        .login-title { font-size: 1.6rem; font-weight: 800; margin-bottom: 6px; }
        .login-subtitle { color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 28px; }
        .login-form { display: flex; flex-direction: column; gap: 16px; }
        .login-error { background: var(--error-bg); border: 1px solid rgba(255,77,109,0.3); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 0.8rem; color: var(--error); }
        .login-divider { margin-top: 20px; text-align: center; }
        .login-switch-link { font-size: 0.8rem; color: var(--text-muted); }
        .login-switch-link:hover { color: var(--accent-light); }
      `}</style>
    </div>
  );
}
