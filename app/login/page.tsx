'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
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
        body: JSON.stringify({ email, password, role: 'admin' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        router.push('/admin');
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
          <div className="login-logo-icon">🛍️</div>
          <div>
            <div className="login-logo-name">ShopSaaS</div>
            <div className="login-logo-sub">Store Admin Portal</div>
          </div>
        </div>

        <div className="glass-card login-card">
          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to manage your store</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="admin@yourstore.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
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
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="login-error">
                ⚠️ {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? <span className="spin">⟳</span> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-divider">
            <a href="/super-admin/login" className="login-switch-link">
              Super Admin? Login here →
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .login-bg-orbs { position: fixed; inset: 0; pointer-events: none; }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.15; }
        .orb-1 { width: 600px; height: 600px; background: var(--accent); top: -200px; right: -200px; }
        .orb-2 { width: 400px; height: 400px; background: var(--cyan); bottom: -100px; left: -100px; }
        .login-container { position: relative; z-index: 1; width: 100%; max-width: 440px; }
        .login-logo { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; justify-content: center; }
        .login-logo-icon { width: 52px; height: 52px; background: linear-gradient(135deg, var(--accent), var(--cyan)); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: 0 4px 24px var(--accent-glow); }
        .login-logo-name { font-size: 1.4rem; font-weight: 800; color: var(--text); }
        .login-logo-sub { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }
        .login-card { padding: 36px; }
        .login-title { font-size: 1.6rem; font-weight: 800; text-align: center; margin-bottom: 6px; }
        .login-subtitle { text-align: center; color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 28px; }
        .login-form { display: flex; flex-direction: column; gap: 16px; }
        .login-error { background: var(--error-bg); border: 1px solid rgba(255,77,109,0.3); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 0.8rem; color: var(--error); }
        .login-divider { margin-top: 20px; text-align: center; }
        .login-switch-link { font-size: 0.8rem; color: var(--text-muted); transition: var(--transition); }
        .login-switch-link:hover { color: var(--accent-light); }
      `}</style>
    </div>
  );
}
