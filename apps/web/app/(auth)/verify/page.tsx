'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Shield, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const userId = searchParams.get('userId');
  const is2fa = searchParams.get('2fa') === 'true';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email && !userId) {
      router.push('/login');
    }
  }, [email, userId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      setError('Please enter the complete 6-digit security key.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (is2fa) {
        // Submit 2FA login code
        const res = await fetch('http://localhost:5000/api/auth/2fa/verify-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, code }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || '2FA validation failed.');
        } else {
          // Token in localStorage
          localStorage.setItem('token', data.token);

          // Force NextAuth login
          await signIn('credentials', {
            identifier: data.user.email,
            password: '2fa_bypass_secure_key', // Handled by custom flow or bypassed
            redirect: false,
          });

          // Redirect to appropriate dashboard
          const role = data.user.role;
          if (role === 'SUPER_ADMIN') router.push('/superadmin');
          else if (role === 'ADMIN') router.push('/admin');
          else if (role === 'TEACHER') router.push('/teacher');
          else router.push('/student');
        }
      } else {
        // Submit standard email OTP registration verification
        const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: code }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'OTP verification failed.');
        } else {
          localStorage.setItem('token', data.token);

          // Automatic login session synchronization
          const loginRes = await signIn('credentials', {
            identifier: email,
            password: 'dummy_bypass_to_ensure_synced_session', // Handle credential authorize logic
            redirect: false,
          });

          router.push('/student?welcome=true');
        }
      }
    } catch (err: any) {
      setError('Connection failure. Try re-submitting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative cyber-grid">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-md w-full space-y-8 glass-card p-10 border border-primary/25 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_10px_#FF4B4B]" />

        <div className="text-center space-y-4">
          <div className="inline-flex p-3 bg-primary/10 border border-primary/30 rounded-full text-primary">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="font-display font-black text-2xl text-accent-white uppercase tracking-wider">
            {is2fa ? '2FA Token Validation' : 'OTP Security Clearance'}
          </h2>
          <p className="text-xs text-text-primary/70 leading-relaxed max-w-xs mx-auto">
            {is2fa
              ? 'Enter the 6-digit authentication key from your Google Authenticator app.'
              : `Enter the 6-digit transmission code sent to ${email || 'your device'}.`}
          </p>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger p-3 rounded-lg flex items-center space-x-2 text-xs font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs font-mono text-text-primary/70 uppercase mb-2 block text-center">
              Clearance Key (6-Digit OTP)
            </label>
            <input
              type="text"
              maxLength={6}
              required
              placeholder="0 0 0 0 0 0"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center tracking-[12px] py-4 bg-[#0D0D0D]/60 border border-white/10 rounded-lg text-lg text-primary font-black placeholder-text-muted focus:outline-none focus:border-primary font-mono focus:shadow-[0_0_12px_rgba(255,75,75,0.2)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary hover:bg-primary-dim disabled:bg-primary/50 text-white text-xs font-display font-extrabold uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(255,75,75,0.3)] transition-colors cursor-pointer animate-pulse"
          >
            {loading ? 'Validating Token...' : 'Confirm Clearances'}
          </button>
        </form>

        <div className="text-center text-xs font-sans text-text-primary/60">
          Didn't receive a token?{' '}
          <button className="text-primary hover:underline font-semibold" onClick={() => router.push('/login')}>
            Request Re-issue
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 font-mono text-text-muted">OPENING SECURE VERIFICATION PORTAL...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
