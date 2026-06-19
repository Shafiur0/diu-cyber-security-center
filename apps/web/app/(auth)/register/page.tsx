'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, User, Mail, Phone, BookOpen, Lock, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studentId, setStudentId] = useState('');
  const [batch, setBatch] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const nextStep = () => {
    if (step === 1 && (!name || !email || !phone)) {
      setError('Please fill in all basic info fields.');
      return;
    }
    if (step === 2 && (!studentId || !batch || !department)) {
      setError('Please fill in all academic details.');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          studentId,
          batch,
          department,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Registration failed');
      } else {
        // Redirect to OTP verification page
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      }
    } catch (err: any) {
      setError('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative cyber-grid">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-md w-full space-y-8 glass-card p-10 border border-primary/25 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_10px_#FF4B4B]" />

        <div className="text-center space-y-2">
          <div className="inline-flex p-2.5 bg-primary/10 border border-primary/30 rounded-full text-primary">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="font-display font-black text-2xl text-accent-white uppercase tracking-wider">
            Analyst Registration
          </h2>
          {/* Progress dots */}
          <div className="flex justify-center space-x-2 pt-2">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  step === s ? 'w-6 bg-primary' : 'w-2 bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger p-3 rounded-lg flex items-center space-x-2 text-xs font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-sm font-display font-bold text-primary uppercase tracking-widest border-b border-white/5 pb-2">
                Step 1: Identity Profile
              </h3>
              <div>
                <label className="text-[10px] font-mono text-text-primary/70 uppercase mb-2 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    required
                    placeholder="Shafiur Rahman Shafim"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#0D0D0D]/60 border border-white/10 rounded-lg text-sm text-accent-white placeholder-text-muted focus:outline-none focus:border-primary font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-text-primary/70 uppercase mb-2 block">DIU Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                  <input
                    type="email"
                    required
                    placeholder="shafiur58@diu.edu.bd"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#0D0D0D]/60 border border-white/10 rounded-lg text-sm text-accent-white placeholder-text-muted focus:outline-none focus:border-primary font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-text-primary/70 uppercase mb-2 block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                  <input
                    type="tel"
                    required
                    placeholder="+880 17XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#0D0D0D]/60 border border-white/10 rounded-lg text-sm text-accent-white placeholder-text-muted focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full py-3 bg-white/5 border border-white/10 hover:border-primary/50 text-accent-white text-xs font-display font-bold uppercase tracking-wider rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>Academic Credentials</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Academic Details */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-sm font-display font-bold text-primary uppercase tracking-widest border-b border-white/5 pb-2">
                Step 2: Academic Verification
              </h3>
              <div>
                <label className="text-[10px] font-mono text-text-primary/70 uppercase mb-2 block">Student ID</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    required
                    placeholder="221-15-XXX"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#0D0D0D]/60 border border-white/10 rounded-lg text-sm text-accent-white placeholder-text-muted focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-text-primary/70 uppercase mb-2 block">Batch</label>
                  <input
                    type="text"
                    required
                    placeholder="58"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0D0D0D]/60 border border-white/10 rounded-lg text-sm text-accent-white placeholder-text-muted focus:outline-none focus:border-primary font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-text-primary/70 uppercase mb-2 block">Department</label>
                  <input
                    type="text"
                    required
                    placeholder="CSE"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0D0D0D]/60 border border-white/10 rounded-lg text-sm text-accent-white placeholder-text-muted focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-1/2 py-3 bg-white/2 border border-white/10 hover:bg-white/5 rounded-lg flex items-center justify-center space-x-2 text-xs text-text-primary transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-1/2 py-3 bg-white/5 border border-white/10 hover:border-primary/50 text-accent-white text-xs font-display font-bold uppercase tracking-wider rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <span>Key Settings</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Passwords */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-sm font-display font-bold text-primary uppercase tracking-widest border-b border-white/5 pb-2">
                Step 3: Security Key Configuration
              </h3>
              <div>
                <label className="text-[10px] font-mono text-text-primary/70 uppercase mb-2 block">Access Key (Password)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#0D0D0D]/60 border border-white/10 rounded-lg text-sm text-accent-white placeholder-text-muted focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-text-primary/70 uppercase mb-2 block">Confirm Access Key</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#0D0D0D]/60 border border-white/10 rounded-lg text-sm text-accent-white placeholder-text-muted focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-1/3 py-3 bg-white/2 border border-white/10 hover:bg-white/5 rounded-lg flex items-center justify-center space-x-2 text-xs text-text-primary transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3.5 bg-primary hover:bg-primary-dim disabled:bg-primary/50 text-white text-xs font-display font-extrabold uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(255,75,75,0.3)] transition-colors cursor-pointer"
                >
                  {loading ? 'Transmitting Key...' : 'Register Profile'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="text-center text-xs font-sans text-text-primary/70 pt-4 border-t border-white/5">
          Already registered?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Authenticate &gt;
          </Link>
        </div>
      </div>
    </div>
  );
}
