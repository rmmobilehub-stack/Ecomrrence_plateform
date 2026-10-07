'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { storefrontPath } from '@/lib/storefront-paths';
import { clearCustomerSessionCache } from '@/components/store/ensureCustomerLogin';

export default function CustomerLoginPanel({
  storeSlug,
  storeName,
  returnTo,
  error: initialError,
}: {
  storeSlug: string;
  storeName: string;
  returnTo?: string;
  error?: string;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(initialError || '');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (mode === 'register' && password !== confirmPassword) {
        throw new Error('Password and confirm password do not match');
      }
      const endpoint = mode === 'login' ? '/api/customer/login' : '/api/customer/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          storeSlug,
          email,
          password,
          ...(mode === 'register' ? { name, phone, confirmPassword } : {}),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');

      clearCustomerSessionCache();
      const next =
        returnTo && returnTo.startsWith('/')
          ? returnTo
          : storefrontPath(storeSlug, 'account');
      // Full navigation so the auth cookie is applied before protected pages load.
      window.location.assign(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSaving(false);
    }
  };

  return (
    <div className="customer-login-card">
      <p className="customer-login-kicker">
        <ShieldCheck size={14} /> Track your purchases
      </p>
      <h1>{mode === 'login' ? 'Login' : 'Create account'}</h1>
      <p className="customer-login-lead">
        {mode === 'login'
          ? `Sign in to ${storeName} to continue buying, phone check, or repair. Your login stays saved.`
          : `Create an account once — then Buy now, Phone Check and Repair stay trackable under your login.`}
      </p>

      <div className="customer-auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          className={mode === 'login' ? 'is-active' : undefined}
          aria-selected={mode === 'login'}
          onClick={() => {
            setMode('login');
            setError('');
          }}
        >
          Login
        </button>
        <button
          type="button"
          role="tab"
          className={mode === 'register' ? 'is-active' : undefined}
          aria-selected={mode === 'register'}
          onClick={() => {
            setMode('register');
            setError('');
          }}
        >
          Register
        </button>
      </div>

      {error ? <p className="form-error customer-login-error">{error}</p> : null}

      <form className="customer-auth-form" onSubmit={(event) => void submit(event)}>
        {mode === 'register' ? (
          <>
            <label className="form-group">
              <span className="form-label">Full name</span>
              <input
                className="form-input"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
            <label className="form-group">
              <span className="form-label">Phone (optional)</span>
              <input
                className="form-input"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="03XXXXXXXXX"
                autoComplete="tel"
              />
            </label>
          </>
        ) : null}

        <label className="form-group">
          <span className="form-label">Email</span>
          <input
            className="form-input"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
          />
        </label>
        <label className="form-group">
          <span className="form-label">Password</span>
          <input
            className="form-input"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={mode === 'register' ? 'At least 6 characters' : 'Your password'}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>
        {mode === 'register' ? (
          <label className="form-group">
            <span className="form-label">Confirm password</span>
            <input
              className="form-input"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter password"
              autoComplete="new-password"
            />
          </label>
        ) : null}

        <button type="submit" className="btn btn-primary btn-lg customer-auth-submit" disabled={saving}>
          {saving ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
        </button>
      </form>

      <p className="customer-login-hint">
        After login, open <strong>My account</strong> anytime to see what you bought, when, and repair status.
      </p>
    </div>
  );
}
