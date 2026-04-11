'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Mail, Lock, User, Phone, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

export default function AuthForms() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { fetchCurrentUser } = useAppStore();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error);
      } else {
        await fetchCurrentUser();
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (regPassword !== regConfirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          phone: regPhone,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error);
      } else {
        setSuccess(data.data.message);
        setTimeout(() => {
          setMode('login');
          setSuccess('');
        }, 3000);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[10%] left-[15%] w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)' }} />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1), transparent 70%)' }} />
        <div className="absolute top-[50%] left-[60%] w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08), transparent 70%)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8 fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 pulse-glow"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <span className="text-white font-black text-2xl">AS</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Amader Shomobay</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Group Fund Management System
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex mb-6 p-1 rounded-xl fade-in-up"
          style={{
            background: 'rgba(17, 24, 39, 0.6)',
            border: '1px solid rgba(99, 102, 241, 0.1)',
          }}
        >
          <button
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300"
            style={{
              background: mode === 'login' ? 'var(--gradient-primary)' : 'transparent',
              color: mode === 'login' ? 'white' : 'var(--text-muted)',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300"
            style={{
              background: mode === 'register' ? 'var(--gradient-primary)' : 'transparent',
              color: mode === 'register' ? 'white' : 'var(--text-muted)',
            }}
          >
            Register
          </button>
        </div>

        {/* Form Card */}
        <div className="glass-card p-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm font-medium fade-in-up"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171',
              }}
            >
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-4 p-3 rounded-xl text-sm font-medium fade-in-up flex items-center gap-2"
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                color: '#4ade80',
              }}
            >
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}>Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="input-field !pl-10"
                    placeholder="you@example.com"
                    required
                    id="login-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}>Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="input-field !pl-10"
                    placeholder="••••••••"
                    required
                    id="login-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
                id="login-submit"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="text-center mt-6 pt-4 border-t border-white/5">
                <p className="text-xs text-zinc-500">
                  Developed by Md. Emran Hossain
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}>Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <input
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    className="input-field !pl-10"
                    placeholder="Your full name"
                    required
                    id="register-name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}>Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="input-field !pl-10"
                    placeholder="you@example.com"
                    required
                    id="register-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}>Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Phone size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    className="input-field !pl-10"
                    placeholder="+880 1XXX-XXXXXX"
                    required
                    id="register-phone"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}>Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="input-field !pl-10"
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    id="register-password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}>Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <input
                    type="password"
                    value={regConfirm}
                    onChange={e => setRegConfirm(e.target.value)}
                    className="input-field !pl-10"
                    placeholder="Confirm password"
                    required
                    minLength={6}
                    id="register-confirm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
                id="register-submit"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Create Account <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Amader Shomobay — Transparent Group Finance
        </p>
      </div>
    </div>
  );
}
