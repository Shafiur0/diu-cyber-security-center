'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Award, Shield, Trophy, Zap, Search } from 'lucide-react';

export default function LeaderboardPage() {
  const [period, setPeriod] = useState('all');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    apiRequest(`/leaderboard?period=${period}`)
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch leaderboard');
        setLoading(false);
      });
  }, [period]);

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative cyber-grid">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex p-3 bg-primary/10 border border-primary/30 rounded-full text-primary">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-accent-white uppercase tracking-wider">
            CSC Scoreboard Rankings
          </h1>
          <p className="text-text-primary/70 text-sm">
            Live rankings of Daffodil International University cybersecurity student analysts based on active CTF scores, certificates, and platform challenges.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-bg-card/80 border border-primary/10 p-4 rounded-xl backdrop-blur-md">
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search hackers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-accent-white placeholder-text-muted focus:outline-none focus:border-primary font-mono"
            />
          </div>

          {/* Period Filter */}
          <div className="flex border border-white/10 bg-black/20 rounded-lg p-1 font-mono text-[10px]">
            {[
              { id: 'all', label: 'All-Time' },
              { id: 'month', label: 'Monthly' },
              { id: 'semester', label: 'Semester' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-md uppercase font-bold transition-all ${
                  period === p.id ? 'bg-primary text-white' : 'text-text-primary/70 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table / Grid */}
        {loading ? (
          <div className="text-center py-24 font-mono text-xs text-text-muted animate-pulse">
            RETRIEVING ENCRYPTED SCORE DATA...
          </div>
        ) : error ? (
          <div className="text-center py-24 font-mono text-xs text-danger">
            ERROR: {error}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-24 font-mono text-xs text-text-muted">
            NO THREAT ACTORS DETECTED MATCHING SEARCH CRITERIA.
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/2 text-xs font-display font-bold text-accent-white uppercase tracking-wider">
                    <th className="p-4">Rank</th>
                    <th className="p-4">Hacker</th>
                    <th className="p-4">HTB Score</th>
                    <th className="p-4">THM Score</th>
                    <th className="p-4">CTF Score</th>
                    <th className="p-4">Tier Badge</th>
                    <th className="p-4 text-right">Total Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-mono">
                  {filteredUsers.map((user) => {
                    const isTop3 = user.rank <= 3;
                    const glowClass =
                      user.rank === 1
                        ? 'text-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.2)]'
                        : user.rank === 2
                        ? 'text-[#C0C0C0]'
                        : user.rank === 3
                        ? 'text-[#CD7F32]'
                        : 'text-text-primary/70';

                    return (
                      <tr key={user.studentId} className={`hover:bg-white/2 transition-colors ${isTop3 ? 'bg-primary/2' : ''}`}>
                        <td className="p-4 font-bold">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${glowClass}`}>
                            #{user.rank}
                          </span>
                        </td>
                        <td className="p-4 flex items-center space-x-3">
                          <img
                            src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                            alt={user.fullName}
                            className="w-8 h-8 rounded-full border border-white/10 object-cover"
                          />
                          <div>
                            <span className="font-sans font-bold text-accent-white block">{user.fullName}</span>
                            <span className="text-[9px] text-text-muted">{user.studentId || 'STUDENT'}</span>
                          </div>
                        </td>
                        <td className="p-4 text-text-primary/70">{user.htbPoints || 0} pts</td>
                        <td className="p-4 text-text-primary/70">{user.thmPoints || 0} pts</td>
                        <td className="p-4 text-text-primary/70">{user.ctfScore || 0} pts</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            user.badgeTier === 'PLATINUM' ? 'bg-[#E5E4E2]/25 text-[#E5E4E2] border border-[#E5E4E2]/40' :
                            user.badgeTier === 'GOLD' ? 'bg-[#FFD700]/25 text-[#FFD700] border border-[#FFD700]/40' :
                            user.badgeTier === 'SILVER' ? 'bg-[#C0C0C0]/25 text-[#C0C0C0] border border-[#C0C0C0]/40' :
                            'bg-[#CD7F32]/25 text-[#CD7F32] border border-[#CD7F32]/40'
                          }`}>
                            {user.badgeTier}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-primary">{user.totalScore || 0} pts</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
