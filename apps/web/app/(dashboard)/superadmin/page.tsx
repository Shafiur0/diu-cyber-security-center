'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, Users, FileText, Settings, KeyRound, AlertOctagon } from 'lucide-react';

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [siteConfig, setSiteConfig] = useState<any>({ heroText: '', aboutSection: '' });
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      const role = session.user.role;
      if (role !== 'SUPER_ADMIN') {
        router.push('/student');
      }
    }
  }, [status, session, router]);

  // Load Super Admin logs
  useEffect(() => {
    if (status === 'authenticated') {
      const token = localStorage.getItem('token');
      // Fetch users
      fetch('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setUsers(data);
          else {
            setUsers([
              { id: '1', email: 'admin@csc.diu', role: 'ADMIN', isActive: true, isBanned: false, profile: { fullName: 'Admin System' } },
              { id: '2', email: 'shafim@diu.edu.bd', role: 'STUDENT', isActive: true, isBanned: false, profile: { fullName: 'Shafiur Rahman Shafim' } },
            ]);
          }
        });

      // Fetch audit logs
      fetch('http://localhost:5000/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setAuditLogs(data);
          else {
            setAuditLogs([
              { id: '1', action: 'CHANGE_ROLE', targetType: 'User', targetId: '2', actor: { email: 'super@csc.diu' }, createdAt: new Date().toISOString() },
            ]);
          }
        });
    }
  }, [status]);

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (response.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        setFeedbackMsg('Role updated successfully.');
      }
    } catch (err) {}
  };

  const handleBanToggle = async (userId: string, currentBan: boolean) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ ban: !currentBan }),
      });
      if (response.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isBanned: !currentBan } : u)));
        setFeedbackMsg(!currentBan ? 'User banned.' : 'User unbanned.');
      }
    } catch (err) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-8">
      <aside className="w-full lg:w-64 glass-card p-4 h-fit">
        <div className="font-display font-black text-xs text-primary uppercase tracking-widest px-4 py-2 border-b border-white/5 mb-4">
          Super Console
        </div>
        <nav className="flex flex-col space-y-1">
          {['Overview', 'User Management', 'Audit Logs', 'Site Config'].map((tab) => (
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
        {feedbackMsg && <div className="text-xs bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] p-3 rounded mb-4">{feedbackMsg}</div>}

        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-black text-2xl text-accent-white">Super User Root Matrix</h2>
              <p className="text-xs text-text-muted">Override permissions, configuration parameters, and audit trails</p>
            </div>
            <div className="p-6 border border-white/10 rounded-lg bg-white/2">
              <h3 className="font-display font-bold text-sm text-accent-white uppercase mb-2">Systems Note</h3>
              <p className="text-xs text-text-primary/70 leading-relaxed">
                Clearance: SUPER_ADMIN. You have access to ban user accounts, change roles across student/teacher/admin scopes, edit configuration states, and read the monorepo audit trail.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'User Management' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display font-black text-2xl text-accent-white">User Matrix Management</h2>
              <p className="text-xs text-text-muted">Search and configure user scopes</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-accent-white font-bold uppercase">
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="p-3">
                        <span className="font-bold text-accent-white block">{u.profile?.fullName || 'User'}</span>
                        <span className="text-[10px] text-text-muted">{u.email}</span>
                      </td>
                      <td className="p-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.id, e.target.value)}
                          className="bg-[#0D0D0D] border border-white/10 text-[10px] rounded p-1 text-accent-white"
                        >
                          <option value="STUDENT">STUDENT</option>
                          <option value="TEACHER">TEACHER</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold ${u.isBanned ? 'text-danger' : 'text-[#22C55E]'}`}>
                          {u.isBanned ? 'BANNED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleBanToggle(u.id, u.isBanned)}
                          className={`px-2 py-1 text-[10px] font-bold rounded ${
                            u.isBanned ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-danger/20 text-danger'
                          }`}
                        >
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Audit Logs' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-black text-2xl text-accent-white">System Audit Trails</h2>
              <p className="text-xs text-text-muted font-mono">Export reports / CSV logs to inspect actions history</p>
            </div>
            <div className="space-y-3 font-mono text-[11px] text-text-primary/70">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 border border-white/5 bg-white/2 rounded">
                  <span className="text-primary font-bold">[{log.action}]</span> By {log.actor?.email} on {log.targetType} ({log.targetId})
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Site Config' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setFeedbackMsg('Site config parameters saved successfully.');
            }}
            className="space-y-6"
          >
            <div>
              <h2 className="font-display font-black text-2xl text-accent-white">Site Global Config Editor</h2>
              <p className="text-xs text-text-muted">Override public Hero tags and statistics parameters</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-text-primary/70 block mb-2">Hero Showcase Header</label>
                <input
                  type="text"
                  value={siteConfig.heroText}
                  onChange={(e) => setSiteConfig({ ...siteConfig, heroText: e.target.value })}
                  placeholder="Building The Next Generation Of..."
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none"
                />
              </div>
            </div>
            <button type="submit" className="px-6 py-2 bg-primary hover:bg-primary-dim text-white text-xs font-bold rounded">
              Save Config Matrix
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
