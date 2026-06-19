'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, FileText, BookOpen, Clock, Shield } from 'lucide-react';

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      const role = session.user.role;
      if (role !== 'TEACHER' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        router.push('/student');
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      const token = localStorage.getItem('token');
      // Fetch submissions
      fetch('http://localhost:5000/api/achievements', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setSubmissions(data.filter((a) => a.status === 'PENDING'));
          } else {
            setSubmissions([
              { id: '1', title: 'TryHackMe Advent of Cyber', user: { profile: { fullName: 'Tasnim Hasan' } }, points: 20, type: 'ctf' },
            ]);
          }
        });
    }
  }, [status]);

  const handleVerify = async (id: string, statusVal: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`http://localhost:5000/api/achievements/${id}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: statusVal }),
      });
      if (response.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-8">
      <aside className="w-full lg:w-64 glass-card p-4 h-fit">
        <div className="font-display font-black text-xs text-primary uppercase tracking-widest px-4 py-2 border-b border-white/5 mb-4">
          Mentor Panel
        </div>
        <nav className="flex flex-col space-y-1">
          {['Overview', 'Review Queue'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab ? 'bg-primary/10 border-l-2 border-primary text-primary' : 'text-text-primary/70 hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-grow glass-card p-8 min-h-[500px]">
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-black text-2xl text-accent-white">Faculty Mentor Space</h2>
              <p className="text-xs text-text-muted">Review student submissions and manage academic resources</p>
            </div>
            <div className="p-6 border border-white/10 rounded-lg bg-white/2">
              <h3 className="font-display font-bold text-sm text-accent-white uppercase mb-2">Instructions</h3>
              <p className="text-xs text-text-primary/70 leading-relaxed">
                As a verified DIU faculty member, you have clearance to review student certificate uploads, award system leaderboard points, and verify bug bounty disclosures.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'Review Queue' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-black text-2xl text-accent-white">Submissions Awaiting Verification</h2>
              <p className="text-xs text-text-muted">Confirm validity and links of certificates</p>
            </div>

            <div className="space-y-4">
              {submissions.length === 0 ? (
                <div className="text-center py-12 text-text-muted font-mono text-xs">No pending items for audit.</div>
              ) : (
                submissions.map((item) => (
                  <div key={item.id} className="p-4 border border-white/10 bg-white/2 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-accent-white">{item.title}</h4>
                      <span className="text-[10px] text-text-muted block mt-1">Applicant: {item.user?.profile?.fullName || 'Student'}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerify(item.id, 'APPROVED')}
                        className="px-3 py-1 bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30 text-xs rounded hover:bg-[#22C55E]/40"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleVerify(item.id, 'REJECTED')}
                        className="px-3 py-1 bg-danger/20 text-danger border border-danger/30 text-xs rounded hover:bg-danger/40"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
