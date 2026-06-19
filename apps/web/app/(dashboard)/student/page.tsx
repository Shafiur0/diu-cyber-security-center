'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Award,
  Calendar,
  BookOpen,
  User,
  LogOut,
  LayoutDashboard,
  CheckCircle,
  Clock,
  Download,
  AlertCircle,
  FileText,
  UserCheck,
  Zap,
} from 'lucide-react';

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');
  const [profile, setProfile] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Submit achievement form states
  const [achTitle, setAchTitle] = useState('');
  const [achType, setAchType] = useState('certification');
  const [achPlatform, setAchPlatform] = useState('');
  const [achDesc, setAchDesc] = useState('');
  const [achProofUrl, setAchProofUrl] = useState('');
  const [achIssuer, setAchIssuer] = useState('');
  const [achCredId, setAchCredId] = useState('');
  const [achCredUrl, setAchCredUrl] = useState('');
  const [achPoints, setAchPoints] = useState('30');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Profile fields state
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [batch, setBatch] = useState('');
  const [department, setDepartment] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [facebook, setFacebook] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [tryHackMe, setTryHackMe] = useState('');
  const [hackTheBox, setHackTheBox] = useState('');

  // OTP/2FA management states
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [tfaSecret, setTfaSecret] = useState('');
  const [tfaCode, setTfaCode] = useState('');
  const [tfaMessage, setTfaMessage] = useState('');
  const [tfaLoading, setTfaLoading] = useState(false);

  // Verification checks
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Load dashboard data
  useEffect(() => {
    if (status === 'authenticated') {
      const token = localStorage.getItem('token');
      // Fetch profile
      fetch(`http://localhost:5000/api/profiles/${session.user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setProfile(data);
            setFullName(data.fullName || '');
            setStudentId(data.studentId || '');
            setBatch(data.batch || '');
            setDepartment(data.department || '');
            setBio(data.bio || '');
            setSkills((data.skills || []).join(', '));
            setFacebook(data.facebook || '');
            setLinkedin(data.linkedin || '');
            setGithub(data.github || '');
            setTryHackMe(data.tryHackMe || '');
            setHackTheBox(data.hackTheBox || '');
          } else {
            // Setup fallback mocks
            const mock = {
              fullName: 'Shafiur Rahman Shafim',
              studentId: '221-15-472',
              batch: '58',
              department: 'CSE',
              bio: 'Cyber security enthusiast. Active pentester and CTF player.',
              skills: ['Web Security', 'CTF', 'OSINT'],
              github: 'https://github.com/shafim',
              linkedin: 'https://linkedin.com/in/shafim',
              tryHackMe: 'https://tryhackme.com/p/shafim',
              hackTheBox: 'https://hackthebox.com/u/shafim',
              ctfScore: 400,
              totalScore: 520,
            };
            setProfile(mock);
            setFullName(mock.fullName);
            setStudentId(mock.studentId);
            setBatch(mock.batch);
            setDepartment(mock.department);
            setBio(mock.bio);
            setSkills(mock.skills.join(', '));
          }
        })
        .catch(() => {});

      // Fetch achievements
      fetch('http://localhost:5000/api/achievements/mine', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setAchievements(data);
          else {
            setAchievements([
              { id: '1', title: 'Certified Ethical Hacker v12', status: 'APPROVED', type: 'certification', points: 50 },
              { id: '2', title: 'PortSwigger Web Academy complete', status: 'PENDING', type: 'certification', points: 30 },
            ]);
          }
        });

      // Fetch certificates
      fetch('http://localhost:5000/api/certificates/mine', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setCertificates(data);
        });
    }
  }, [status, session]);

  // Generate Digital Membership Card inside Canvas
  useEffect(() => {
    if (activeTab === 'Membership Card' && profile) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw Background
      ctx.fillStyle = '#0D0D0D';
      ctx.fillRect(0, 0, 450, 270);

      // Draw Grid design lines
      ctx.strokeStyle = 'rgba(255, 75, 75, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 450; i += 15) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 270);
        ctx.stroke();
      }
      for (let j = 0; j < 270; j += 15) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(450, j);
        ctx.stroke();
      }

      // Outer Neon Red border glow
      ctx.strokeStyle = '#FF4B4B';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, 446, 266);

      // Header Banner
      ctx.fillStyle = 'rgba(255, 75, 75, 0.05)';
      ctx.fillRect(4, 4, 442, 40);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 12px "Space Grotesk"';
      ctx.fillText('CYBER SECURITY CENTER · DIU', 15, 28);

      // Logo dot
      ctx.fillStyle = '#FF4B4B';
      ctx.beginPath();
      ctx.arc(410, 24, 6, 0, Math.PI * 2);
      ctx.fill();

      // Horizontal line
      ctx.strokeStyle = 'rgba(255, 75, 75, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(15, 55);
      ctx.lineTo(435, 55);
      ctx.stroke();

      // Avatar placeholder
      ctx.fillStyle = '#141414';
      ctx.fillRect(25, 75, 80, 80);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.strokeRect(25, 75, 80, 80);

      ctx.fillStyle = '#FF4B4B';
      ctx.font = '800 8px "JetBrains Mono"';
      ctx.fillText('AVATAR', 50, 115);

      // Details
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 15px "Space Grotesk"';
      ctx.fillText(profile.fullName?.toUpperCase() || 'SHAFIUR RAHMAN SHAFIM', 125, 90);

      ctx.fillStyle = '#6B7280';
      ctx.font = '11px "JetBrains Mono"';
      ctx.fillText(`ID: ${profile.studentId || 'CSC-2026-0472'}`, 125, 110);
      ctx.fillText(`Batch: ${profile.batch || '58'} | Dept: ${profile.department || 'CSE'}`, 125, 125);

      // Skills line
      ctx.strokeStyle = 'rgba(255, 75, 75, 0.15)';
      ctx.beginPath();
      ctx.moveTo(15, 175);
      ctx.lineTo(435, 175);
      ctx.stroke();

      ctx.fillStyle = '#F0F0F0';
      ctx.font = '10px "Inter"';
      const skillString = `Skills: ${(profile.skills || []).slice(0, 3).join(' · ') || 'Web Security · CTF · OSINT'}`;
      ctx.fillText(skillString, 15, 195);

      // Footer divider
      ctx.strokeStyle = 'rgba(255, 75, 75, 0.15)';
      ctx.beginPath();
      ctx.moveTo(15, 215);
      ctx.lineTo(435, 215);
      ctx.stroke();

      // QR Code simulator box
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(370, 75, 65, 65);
      ctx.fillStyle = '#000000';
      // simple fake QR dot layout
      for (let x = 373; x < 430; x += 6) {
        for (let y = 78; y < 135; y += 6) {
          if (Math.random() > 0.4) {
            ctx.fillRect(x, y, 4, 4);
          }
        }
      }

      // Card active seal
      ctx.fillStyle = '#22C55E';
      ctx.font = '800 10px "JetBrains Mono"';
      ctx.fillText('✅ ACTIVE MEMBER', 15, 242);

      ctx.fillStyle = '#6B7280';
      ctx.font = '9px "JetBrains Mono"';
      ctx.fillText('VALID UNTIL: DEC 2026', 285, 242);
    }
  }, [activeTab, profile]);

  const downloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `csc-membership-${profile?.studentId || 'card'}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Submit achievement trigger
  const handleAchievementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    setSubmitLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: achTitle,
          type: achType,
          platform: achPlatform,
          description: achDesc,
          proofUrl: achProofUrl,
          issuer: achIssuer,
          credentialId: achCredId,
          credentialUrl: achCredUrl,
          points: achPoints,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setSubmitError(data.error || 'Failed to submit achievement');
      } else {
        setSubmitSuccess('Achievement submitted for administrative review!');
        setAchievements((prev) => [data, ...prev]);
        setAchTitle('');
        setAchDesc('');
        setAchPlatform('');
        setAchProofUrl('');
        setAchIssuer('');
        setAchCredId('');
        setAchCredUrl('');
      }
    } catch (err: any) {
      setSubmitError('Connection error occurred.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Save profile updates
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/profiles/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          fullName,
          studentId,
          batch,
          department,
          bio,
          skills: skills.split(',').map((s) => s.trim()),
          facebook,
          linkedin,
          github,
          tryHackMe,
          hackTheBox,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setSubmitError(data.error || 'Failed to update profile');
      } else {
        setSubmitSuccess('Your analyst profile has been updated!');
        setProfile(data);
      }
    } catch (err) {
      setSubmitError('Connection error occurred.');
    }
  };

  // Setup 2FA TOTP QR
  const setup2FA = async () => {
    setTfaMessage('');
    setTfaLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.qrCode) {
        setQrCodeUrl(data.qrCode);
        setTfaSecret(data.secret);
      } else {
        setTfaMessage(data.error || 'Could not set up 2FA.');
      }
    } catch (err) {
      setTfaMessage('Network error occurred.');
    } finally {
      setTfaLoading(false);
    }
  };

  // Confirm and activate 2FA
  const confirm2FA = async () => {
    if (!tfaCode) return;
    setTfaLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ code: tfaCode }),
      });
      const data = await response.json();
      if (response.ok) {
        setTfaMessage('Two-Factor Authentication is now enabled on your account!');
        setQrCodeUrl('');
      } else {
        setTfaMessage(data.error || 'Invalid verification code.');
      }
    } catch (err) {
      setTfaMessage('Network error.');
    } finally {
      setTfaLoading(false);
    }
  };

  if (status === 'loading' || !profile) {
    return <div className="text-center py-24 font-mono text-text-muted">LOADING SECURE USER SPACE...</div>;
  }

  // Sidebar navigation options
  const sidebarItems = [
    'Overview',
    'My Profile',
    'My Achievements',
    'Submit Achievement',
    'My Certificates',
    'Event Registrations',
    'Membership Card',
    'Settings',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-8">
      {/* Sidebar Nav */}
      <aside className="w-full lg:w-64 glass-card p-4 h-fit flex-shrink-0">
        <div className="font-display font-black text-xs text-primary uppercase tracking-widest px-4 py-2 border-b border-white/5 mb-4">
          Nav Clearances
        </div>
        <nav className="flex flex-col space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item}
              onClick={() => {
                setActiveTab(item);
                setSubmitError('');
                setSubmitSuccess('');
              }}
              className={`text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === item ? 'bg-primary/10 border-l-2 border-primary text-primary' : 'text-text-primary/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow glass-card p-8 min-h-[500px]">
        {/* TAB 1: Overview */}
        {activeTab === 'Overview' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="font-display font-black text-2xl text-accent-white">Systems Console Overview</h2>
              <p className="text-xs text-text-muted mt-1">Hacker name: {profile.fullName}</p>
            </div>

            {/* Quick status cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 border border-white/10 bg-white/2 rounded-lg text-center">
                <span className="font-display font-black text-2xl text-primary block">{achievements.length}</span>
                <span className="text-[10px] text-text-muted uppercase tracking-wider block mt-2">Achievements</span>
              </div>
              <div className="p-5 border border-white/10 bg-white/2 rounded-lg text-center">
                <span className="font-display font-black text-2xl text-primary block">
                  {achievements.filter((a) => a.status === 'PENDING').length}
                </span>
                <span className="text-[10px] text-text-muted uppercase tracking-wider block mt-2">Pending Verify</span>
              </div>
              <div className="p-5 border border-white/10 bg-white/2 rounded-lg text-center">
                <span className="font-display font-black text-2xl text-primary block">{profile.totalScore || 0}</span>
                <span className="text-[10px] text-text-muted uppercase tracking-wider block mt-2">System Points</span>
              </div>
              <div className="p-5 border border-white/10 bg-white/2 rounded-lg text-center">
                <span className="text-xs text-[#22C55E] font-bold block py-1.5">ACTIVE</span>
                <span className="text-[10px] text-text-muted uppercase tracking-wider block mt-1">Membership</span>
              </div>
            </div>

            {/* Profile completeness progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-text-primary/70">Profile Completeness Profile Matrix</span>
                <span className="text-primary font-bold">100%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary/50 to-primary w-full" />
              </div>
            </div>

            {/* Action timeline / notification logs */}
            <div className="space-y-4">
              <h3 className="text-sm font-display font-bold text-accent-white uppercase tracking-widest border-b border-white/5 pb-2">
                Recent Activity Signals
              </h3>
              <div className="space-y-3 font-mono text-xs text-text-primary/80">
                <div className="flex items-start space-x-2">
                  <span className="text-primary">&gt;</span>
                  <span>System token authenticated. (IP: 192.168.1.1)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-primary">&gt;</span>
                  <span>Analyst Profile details saved successfully.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: My Profile */}
        {activeTab === 'My Profile' && (
          <form onSubmit={handleProfileSave} className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display font-black text-2xl text-accent-white">Edit Profile Matrix</h2>
              <p className="text-xs text-text-muted mt-1">Personal identity logs and references</p>
            </div>

            {submitSuccess && <div className="text-xs bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] p-3 rounded">{submitSuccess}</div>}
            {submitError && <div className="text-xs bg-danger/10 border border-danger/30 text-danger p-3 rounded">{submitError}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">Student ID</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">Batch</label>
                <input
                  type="text"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Web Exploitation, Cryptography, OSINT"
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">GitHub Link</label>
                <input
                  type="text"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">LinkedIn Link</label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">TryHackMe Profile URL</label>
                <input
                  type="text"
                  value={tryHackMe}
                  onChange={(e) => setTryHackMe(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">HackTheBox Profile URL</label>
                <input
                  type="text"
                  value={hackTheBox}
                  onChange={(e) => setHackTheBox(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-primary hover:bg-primary-dim text-white text-xs font-display font-extrabold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Save Profile Log
            </button>
          </form>
        )}

        {/* TAB 3: My Achievements */}
        {activeTab === 'My Achievements' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display font-black text-2xl text-accent-white">My Verifications List</h2>
              <p className="text-xs text-text-muted mt-1">Pending and approved certification logs</p>
            </div>

            <div className="space-y-4">
              {achievements.length === 0 ? (
                <div className="text-center py-12 text-text-muted font-mono text-xs">No certification logs found.</div>
              ) : (
                achievements.map((ach) => (
                  <div key={ach.id} className="p-4 border border-white/10 bg-white/2 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-accent-white">{ach.title}</h4>
                      <span className="text-[10px] text-text-muted font-mono uppercase block mt-1">Type: {ach.type}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs font-bold text-primary font-mono">+{ach.points} Pts</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          ach.status === 'APPROVED'
                            ? 'bg-[#22C55E]/20 text-[#22C55E]'
                            : ach.status === 'REJECTED'
                            ? 'bg-danger/20 text-danger'
                            : 'bg-warning/20 text-warning animate-pulse'
                        }`}
                      >
                        {ach.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Submit Achievement */}
        {activeTab === 'Submit Achievement' && (
          <form onSubmit={handleAchievementSubmit} className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display font-black text-2xl text-accent-white">Submit New Achievement</h2>
              <p className="text-xs text-text-muted mt-1">Initiate administrative audit verification</p>
            </div>

            {submitSuccess && <div className="text-xs bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] p-3 rounded">{submitSuccess}</div>}
            {submitError && <div className="text-xs bg-danger/10 border border-danger/30 text-danger p-3 rounded">{submitError}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">Achievement Title</label>
                <input
                  type="text"
                  required
                  value={achTitle}
                  onChange={(e) => setAchTitle(e.target.value)}
                  placeholder="e.g. eLearnSecurity Junior Penetration Tester"
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">Type</label>
                <select
                  value={achType}
                  onChange={(e) => setAchType(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none focus:border-primary"
                >
                  <option value="certification">Certification</option>
                  <option value="ctf">CTF Platform Rank</option>
                  <option value="bug_bounty">Bug Bounty Exploit Report</option>
                  <option value="research">Published Research</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">Platform / Issuer</label>
                <input
                  type="text"
                  value={achPlatform}
                  onChange={(e) => setAchPlatform(e.target.value)}
                  placeholder="e.g. OffSec, TCM Academy, HackerOne"
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">Estimated Value (Points: 10–100)</label>
                <input
                  type="number"
                  value={achPoints}
                  onChange={(e) => setAchPoints(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">Explaining Description</label>
                <textarea
                  required
                  value={achDesc}
                  onChange={(e) => setAchDesc(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">Proof Document URL (Cloudinary/Drive Link)</label>
                <input
                  type="text"
                  value={achProofUrl}
                  onChange={(e) => setAchProofUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">Credential URL Reference (Optional)</label>
                <input
                  type="text"
                  value={achCredUrl}
                  onChange={(e) => setAchCredUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className="px-6 py-2.5 bg-primary hover:bg-primary-dim disabled:bg-primary/50 text-white text-xs font-display font-extrabold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              {submitLoading ? 'Transmitting log...' : 'Request Validation'}
            </button>
          </form>
        )}

        {/* TAB 5: My Certificates */}
        {activeTab === 'My Certificates' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display font-black text-2xl text-accent-white">Event Certificates</h2>
              <p className="text-xs text-text-muted mt-1">Official certificates issued for event attendances</p>
            </div>

            <div className="space-y-4">
              {certificates.length === 0 ? (
                <div className="text-center py-12 text-text-muted font-mono text-xs">No event certificates issued.</div>
              ) : (
                certificates.map((cert) => (
                  <div key={cert.id} className="p-4 border border-white/10 bg-white/2 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-accent-white">{cert.title}</h4>
                      <span className="text-[10px] text-text-muted font-mono block mt-1">Code: {cert.verificationCode}</span>
                    </div>
                    <a
                      href={`http://localhost:5000/api/certificates/verify/${cert.verificationCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 border border-primary/30 hover:border-primary text-xs font-bold text-primary rounded transition-colors"
                    >
                      Verify Link
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 6: Event Registrations */}
        {activeTab === 'Event Registrations' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display font-black text-2xl text-accent-white">My Registrations</h2>
              <p className="text-xs text-text-muted mt-1">Upcoming events you are registered to attend</p>
            </div>

            <div className="text-center py-12 text-text-muted font-mono text-xs">
              No active event registrations. Explore the home page to register.
            </div>
          </div>
        )}

        {/* TAB 7: Membership Card */}
        {activeTab === 'Membership Card' && (
          <div className="space-y-8 animate-fadeIn flex flex-col items-center">
            <div className="w-full text-left">
              <h2 className="font-display font-black text-2xl text-accent-white">Digital Membership Card</h2>
              <p className="text-xs text-text-muted mt-1">Canvas dynamic membership card rendering engine</p>
            </div>

            <div className="p-4 border border-primary/20 bg-black/40 rounded-xl relative shadow-2xl">
              <canvas ref={canvasRef} width={450} height={270} className="rounded-lg shadow-[0_0_25px_rgba(255,75,75,0.15)]" />
            </div>

            <button
              onClick={downloadCard}
              className="px-6 py-3 bg-primary hover:bg-primary-dim text-white text-xs font-display font-extrabold uppercase tracking-wider rounded-lg flex items-center space-x-2 shadow-[0_0_15px_rgba(255,75,75,0.3)] transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Digital Card</span>
            </button>
          </div>
        )}

        {/* TAB 8: Settings */}
        {activeTab === 'Settings' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="font-display font-black text-2xl text-accent-white">Security & Authorization Settings</h2>
              <p className="text-xs text-text-muted mt-1">Configure MFA locks and verification codes</p>
            </div>

            {tfaMessage && <div className="text-xs bg-primary/10 border border-primary/30 text-primary p-3 rounded">{tfaMessage}</div>}

            <div className="p-6 border border-white/10 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-accent-white">Two-Factor Authentication (TOTP)</h3>
                  <p className="text-xs text-text-muted mt-1">Lock down credentials authentication using Google Authenticator.</p>
                </div>
                {!qrCodeUrl && (
                  <button
                    onClick={setup2FA}
                    disabled={tfaLoading}
                    className="px-4 py-2 bg-primary hover:bg-primary-dim text-white text-xs font-display font-bold uppercase rounded transition-colors"
                  >
                    Setup 2FA
                  </button>
                )}
              </div>

              {qrCodeUrl && (
                <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center gap-8 animate-fadeIn">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-40 h-40 border-2 border-white/10 rounded-lg p-2 bg-white" />
                  <div className="space-y-4 flex-grow">
                    <p className="text-xs text-text-primary/70 leading-relaxed">
                      1. Scan this QR code in Google Authenticator or Microsoft Authenticator.<br />
                      2. Input the generated 6-digit code below to confirm setup.<br />
                      <span className="font-mono text-primary text-[10px]">Secret Key: {tfaSecret}</span>
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        value={tfaCode}
                        onChange={(e) => setTfaCode(e.target.value.replace(/\D/g, ''))}
                        className="px-3 py-2 bg-[#0D0D0D] border border-white/10 rounded text-sm text-accent-white text-center tracking-widest w-32 focus:outline-none"
                      />
                      <button
                        onClick={confirm2FA}
                        disabled={tfaLoading}
                        className="px-4 py-2 bg-[#22C55E] hover:bg-[#22C55E]/80 text-white text-xs font-display font-bold uppercase rounded transition-all"
                      >
                        Confirm Code
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
