'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Shield, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Sign in using standard credentials
      const res = await signIn('credentials', {
        identifier,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid identifier or password. Please verify OTP or credentials.');
      } else {
        // Fetch user from DB to see where to redirect, or retrieve from local token
        // In local development, we call our API /api/auth/login directly to retrieve local JWT and role
        const backendRes = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password }),
        });

        const data = await backendRes.json();
        if (data.token) {
          localStorage.setItem('token', data.token);

          // Route to role dashboard
          const role = data.user.role;
          if (role === 'SUPER_ADMIN') router.push('/superadmin');
          else if (role === 'ADMIN') router.push('/admin');
          else if (role === 'TEACHER') router.push('/teacher');
          else router.push('/student');
        } else {
          // If login required 2FA
          if (data.twoFactorRequired) {
            router.push(`/verify?2fa=true&userId=${data.userId}`);
          } else {
            setError(data.error || 'Authentication failed');
          }
        }
      }
    } catch (err: any) {
      setError('Server connection error. Please try again.');
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
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="font-display font-black text-3xl text-accent-white uppercase tracking-wider">
            Identity Authorization
          </h2>
          <p className="text-xs text-text-muted font-mono uppercase tracking-widest">
            &gt; Access restricted DIU laboratory systems
          </p>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger p-3 rounded-lg flex items-center space-x-2 text-xs font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Identifier input */}
            <div>
              <label className="text-xs font-mono text-text-primary/70 uppercase mb-2 block">
                Email or Phone number
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4.5 h-4.5 text-text-muted" />
                <input
                  type="text"
                  placeholder="identity@daffodilvarsity.edu.bd"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0D0D0D]/60 border border-white/10 rounded-lg text-sm text-accent-white placeholder-text-muted focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="text-xs font-mono text-text-primary/70 uppercase mb-2 block">
                Access Encryption Key
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4.5 h-4.5 text-text-muted" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0D0D0D]/60 border border-white/10 rounded-lg text-sm text-accent-white placeholder-text-muted focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <Link href="/forgot-password" className="text-primary hover:underline">
              Forgot Access Key?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary hover:bg-primary-dim disabled:bg-primary/50 text-white text-xs font-display font-extrabold uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(255,75,75,0.3)] transition-colors cursor-pointer"
          >
            {loading ? 'Decrypting credentials...' : 'Authenticate Identity'}
          </button>
        </form>

        <div className="relative flex py-2 items-center text-xs font-mono">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-4 text-text-muted">OR</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* OAuth Buttons */}
        <button
          onClick={() => signIn('google')}
          className="w-full py-3 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-lg flex items-center justify-center space-x-2 text-xs font-semibold text-accent-white transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.478 0-6.3-2.822-6.3-6.3s2.822-6.3 6.3-6.3c1.706 0 3.199.687 4.3 1.787l3.185-3.185C19.107 2.372 15.924 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.895 0 10.865-4.224 10.865-11.24 0-.768-.068-1.514-.2-2.254H12.24z" />
          </svg>
          Authorize with Google
        </button>

        <div className="text-center text-xs font-sans text-text-primary/70">
          New student analyst?{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Register Profile &gt;
          </Link>
        </div>
      </div>
    </div>
  );
}
