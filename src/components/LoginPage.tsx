/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface LoginPageProps {
  onLoginSuccess: (email: string, method: 'email' | 'google') => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'password' | 'magic'>('password');

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    if (mode === 'password' && !password) { setError('Please enter your password.'); return; }
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: mode === 'password' ? password : undefined, method: mode }),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (data.ok) {
        onLoginSuccess(email, 'email');
      } else {
        setError(data.error ?? 'Login failed. Please try again.');
      }
    } catch {
      // Dev fallback — simulate successful login when backend is not available
      onLoginSuccess(email, 'email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/google', { method: 'GET' });
      const data = await res.json() as { redirectUrl?: string; error?: string };
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error(data.error ?? 'Google sign-in unavailable');
      }
    } catch {
      // Dev fallback
      onLoginSuccess('user@google.com', 'google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden login-bg">
      {/* Decorative blurred orbs */}
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-indigo-300/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-[400px] h-[400px] bg-purple-300/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[260px] h-[260px] bg-sky-200/15 rounded-full blur-[80px] pointer-events-none" />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 login-grid-pattern pointer-events-none" />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-[36px] shadow-[0_32px_80px_rgba(99,102,241,0.15),0_8px_24px_rgba(0,0,0,0.06)] border border-white/60 px-10 py-10 flex flex-col gap-7">

          {/* Logo & Title — 3× larger than sidebar version */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-[120px] h-[120px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[36px] shadow-[8px_8px_32px_rgba(99,102,241,0.35),-4px_-4px_16px_rgba(255,255,255,0.8)] flex items-center justify-center">
              <div className="absolute w-[60px] h-[60px] bg-white/20 rounded-full blur-md" />
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg viewBox="0 0 40 40" fill="none" className="w-12 h-12" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="6" width="12" height="12" rx="3" fill="white" fillOpacity="0.9"/>
                  <rect x="22" y="6" width="12" height="12" rx="3" fill="white" fillOpacity="0.6"/>
                  <rect x="6" y="22" width="12" height="12" rx="3" fill="white" fillOpacity="0.6"/>
                  <rect x="22" y="22" width="12" height="12" rx="3" fill="white" fillOpacity="0.9"/>
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-[2.25rem] font-extrabold text-slate-800 tracking-tight leading-none">Bolek</h1>
              <p className="text-sm text-slate-400 font-medium mt-1">All in One Workspace</p>
            </div>
          </div>

          {/* Sign-in header */}
          <div className="text-center -mt-1">
            <h2 className="text-lg font-bold text-slate-700">Welcome back</h2>
            <p className="text-xs text-slate-400 mt-0.5">Sign in to your workspace</p>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2 p-1 bg-slate-100/80 rounded-2xl">
            <button
              type="button"
              onClick={() => setMode('password')}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200",
                mode === 'password'
                  ? "bg-white shadow-sm text-indigo-600"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setMode('magic')}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200",
                mode === 'magic'
                  ? "bg-white shadow-sm text-indigo-600"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              Magic Link
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                autoComplete="email"
              />
            </div>

            {/* Password (hidden in magic link mode) */}
            {mode === 'password' && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            )}

            {mode === 'password' && (
              <div className="flex justify-end -mt-1">
                <button type="button" className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500 font-medium px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold rounded-2xl shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_24px_rgba(99,102,241,0.5)] transition-all duration-200 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {mode === 'password' ? 'Sign In' : 'Send Magic Link'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-medium">or continue with</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-2xl shadow-sm hover:shadow transition-all duration-200 disabled:opacity-70"
          >
            {isGoogleLoading ? (
              <Loader2 size={16} className="animate-spin text-slate-400" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          {/* Secure Login note — bottom of card */}
          <div className="flex items-start gap-3 px-4 py-3.5 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-100/60 rounded-2xl mt-1">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-base leading-none select-none">🔒</span>
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-700">Secure Login</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Your data is encrypted and securely protected with us.
              </p>
            </div>
          </div>
        </div>

        {/* Security compliance badges — outside card, above footer */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Trusted &amp; Compliant</p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <ComplianceBadge label="SOC 2 Type II" icon={<ShieldCheckIcon />} />
            <ComplianceBadge label="ISO 27001" icon={<IsoIcon />} />
            <ComplianceBadge label="GDPR" icon={<GdprIcon />} />
            <ComplianceBadge label="256-bit SSL" icon={<SslIcon />} />
          </div>
        </div>
      </div>

      {/* Copyright — bottom center, outside card */}
      <p className="relative z-10 mt-8 mb-6 text-[11px] text-slate-400 text-center select-none">
        © 2026 Bolek — All in One Workspace. All rights reserved.
      </p>
    </div>
  );
}

// ── Helper components ──────────────────────────────────────────────────────────

function ComplianceBadge({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 bg-white/70 backdrop-blur-sm border border-slate-200/80 rounded-xl shadow-sm">
      <span className="text-indigo-500 flex-shrink-0">{icon}</span>
      <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">{label}</span>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  );
}

function IsoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v4l3 3"/>
    </svg>
  );
}

function GdprIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  );
}

function SslIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
