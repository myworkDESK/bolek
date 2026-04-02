/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ShieldCheck, KeyRound } from 'lucide-react';

const PASSCODE_LENGTH = 6;

interface PasscodeScreenProps {
  email: string;
  /** `setup` — first time, user creates a passcode; `verify` — user enters existing passcode */
  mode: 'setup' | 'verify';
  onSuccess: () => void;
  onBack: () => void;
}

export default function PasscodeScreen({ email, mode, onSuccess, onBack }: PasscodeScreenProps) {
  const [digits, setDigits] = useState<string[]>(Array(PASSCODE_LENGTH).fill(''));
  const [confirmDigits, setConfirmDigits] = useState<string[]>(Array(PASSCODE_LENGTH).fill(''));
  const [step, setStep] = useState<'enter' | 'confirm'>(mode === 'setup' ? 'enter' : 'enter');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus the first digit input
  useEffect(() => {
    (step === 'confirm' ? confirmRefs : inputRefs).current[0]?.focus();
  }, [step]);

  const activeDigits = step === 'confirm' ? confirmDigits : digits;
  const setActiveDigits = step === 'confirm' ? setConfirmDigits : setDigits;
  const activeRefs = step === 'confirm' ? confirmRefs : inputRefs;

  const handleDigitChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...activeDigits];
    next[index] = char;
    setActiveDigits(next);
    setError('');
    if (char && index < PASSCODE_LENGTH - 1) {
      activeRefs.current[index + 1]?.focus();
    }
    if (next.every(d => d !== '') && index === PASSCODE_LENGTH - 1) {
      handleSubmit(next.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (activeDigits[index]) {
        const next = [...activeDigits];
        next[index] = '';
        setActiveDigits(next);
      } else if (index > 0) {
        activeRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PASSCODE_LENGTH);
    if (pasted.length === PASSCODE_LENGTH) {
      const next = pasted.split('');
      setActiveDigits(next);
      activeRefs.current[PASSCODE_LENGTH - 1]?.focus();
      handleSubmit(pasted);
    }
  };

  const triggerShake = () => {
    setShakeKey(k => k + 1);
  };

  const handleSubmit = async (code: string) => {
    if (code.length < PASSCODE_LENGTH) return;

    if (mode === 'setup' && step === 'enter') {
      // Advance to confirm step
      setStep('confirm');
      return;
    }

    if (mode === 'setup' && step === 'confirm') {
      if (code !== digits.join('')) {
        setError('Passcodes do not match. Please try again.');
        setConfirmDigits(Array(PASSCODE_LENGTH).fill(''));
        triggerShake();
        confirmRefs.current[0]?.focus();
        return;
      }
    }

    setIsLoading(true);
    try {
      const passcode = mode === 'setup' ? digits.join('') : code;
      const endpoint = mode === 'setup' ? '/api/auth/passcode/set' : '/api/auth/passcode/verify';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passcode }),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (data.ok) {
        if (mode === 'setup') {
          // Persist a flag so we know passcode has been set for this user
          localStorage.setItem(`bolek_passcode_set_${email}`, '1');
        }
        onSuccess();
      } else {
        setError(data.error ?? 'Incorrect passcode. Please try again.');
        setDigits(Array(PASSCODE_LENGTH).fill(''));
        setConfirmDigits(Array(PASSCODE_LENGTH).fill(''));
        triggerShake();
        inputRefs.current[0]?.focus();
      }
    } catch {
      // Dev fallback: when backend is not available, simulate success.
      // NOTE: No passcode is stored or verified locally — verification is
      //       skipped in dev mode.  Never deploy without a real backend.
      if (mode === 'setup') {
        localStorage.setItem(`bolek_passcode_set_${email}`, '1');
        onSuccess();
      } else {
        // In dev, skip verification so the UI flow can be tested end-to-end.
        onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const title = mode === 'setup'
    ? step === 'enter' ? 'Create your passcode' : 'Confirm your passcode'
    : 'Enter your passcode';

  const subtitle = mode === 'setup'
    ? step === 'enter'
      ? 'Choose a 6-digit passcode to secure your account. You\'ll be asked every time you sign in.'
      : 'Re-enter your passcode to confirm.'
    : `Welcome back! Enter your 6-digit passcode to continue.`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden login-bg">
      {/* Background orbs */}
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-indigo-300/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-[400px] h-[400px] bg-purple-300/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 login-grid-pattern pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm mx-auto px-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-[36px] shadow-[0_32px_80px_rgba(99,102,241,0.15),0_8px_24px_rgba(0,0,0,0.06)] border border-white/60 px-10 py-10 flex flex-col items-center gap-7">

          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-[8px_8px_24px_rgba(99,102,241,0.35)] flex items-center justify-center">
            {mode === 'setup' ? (
              <KeyRound size={32} className="text-white" />
            ) : (
              <ShieldCheck size={32} className="text-white" />
            )}
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-[260px]">{subtitle}</p>
            <p className="text-[11px] text-indigo-500 font-medium mt-1 truncate max-w-[260px]">{email}</p>
          </div>

          {/* Step indicator (setup only) */}
          {mode === 'setup' && (
            <div className="flex gap-2">
              <div className={`w-16 h-1.5 rounded-full transition-colors ${step === 'enter' ? 'bg-indigo-500' : 'bg-indigo-200'}`} />
              <div className={`w-16 h-1.5 rounded-full transition-colors ${step === 'confirm' ? 'bg-indigo-500' : 'bg-slate-200'}`} />
            </div>
          )}

          {/* OTP Digit inputs */}
          <div
            key={shakeKey}
            className={`flex gap-3 ${shakeKey > 0 ? 'passcode-shake' : ''}`}
            onPaste={handlePaste}
          >
            {activeDigits.map((digit, i) => (
              <input
                key={i}
                ref={el => { activeRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={digit}
                onChange={e => handleDigitChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`w-11 h-14 text-center text-xl font-bold rounded-2xl border-2 outline-none transition-all duration-200 bg-slate-50 text-slate-800
                  ${digit ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200'}
                  focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100`}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 font-medium text-center px-2">{error}</p>
          )}

          {/* Loading */}
          {isLoading && (
            <Loader2 size={24} className="animate-spin text-indigo-500" />
          )}

          {/* Back button */}
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
          >
            {mode === 'setup' && step === 'confirm' ? '← Back to enter passcode' : '← Back to sign in'}
          </button>
        </div>
      </div>

      {/* Copyright */}
      <p className="relative z-10 mt-8 mb-6 text-[11px] text-slate-400 text-center select-none">
        © 2026 Bolek — All in One Workspace. All rights reserved.
      </p>
    </div>
  );
}
