'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Award, Shield, CheckCircle, Search, Filter } from 'lucide-react';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    apiRequest('/achievements')
      .then((data) => {
        if (Array.isArray(data)) {
          // Show only APPROVED achievements on public board
          setAchievements(data.filter((a: any) => a.status === 'APPROVED'));
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to retrieve achievements board.');
        setLoading(false);
      });
  }, []);

  const filteredAchievements = achievements.filter((ach) => {
    const matchesSearch = ach.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (ach.user?.profile?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Mapping tabs
    let matchesTab = true;
    if (filter === 'Certifications') matchesTab = ach.type === 'certification';
    else if (filter === 'CTF') matchesTab = ach.type === 'ctf';
    else if (filter === 'Bug Bounty') matchesTab = ach.type === 'bug_bounty';
    else if (filter === 'Research') matchesTab = ach.type === 'research';

    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative cyber-grid">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex p-3 bg-primary/10 border border-primary/30 rounded-full text-primary">
            <Award className="w-8 h-8" />
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-accent-white uppercase tracking-wider">
            Verified Achievements Board
          </h1>
          <p className="text-text-primary/70 text-sm">
            Registry of verified student achievements including professional security credentials, CTF podium positions, and bug bounty advisories.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-bg-card/80 border border-primary/10 p-4 rounded-xl backdrop-blur-md">
          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by title or hacker name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-accent-white placeholder-text-muted focus:outline-none focus:border-primary font-sans"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-1 border border-white/10 bg-black/20 rounded-lg p-1 font-mono text-[10px]">
            {['All', 'Certifications', 'CTF', 'Bug Bounty', 'Research'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-md uppercase font-bold transition-all ${
                  filter === tab ? 'bg-primary text-white shadow-[0_0_10px_rgba(255,75,75,0.4)]' : 'text-text-primary/70 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Grid List */}
        {loading ? (
          <div className="text-center py-24 font-mono text-xs text-text-muted animate-pulse">
            ACCESSING CYBER VERIFICATION LOGS...
          </div>
        ) : error ? (
          <div className="text-center py-24 font-mono text-xs text-danger">
            ERROR: {error}
          </div>
        ) : filteredAchievements.length === 0 ? (
          <div className="text-center py-24 font-mono text-xs text-text-muted">
            NO CREDENTIAL LOGS REGISTERED OR DETECTED MATCHING FILTERS.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAchievements.map((item) => {
              let tierColor = 'text-primary';
              if (item.badgeTier === 'PLATINUM') tierColor = 'text-[#E5E4E2]';
              else if (item.badgeTier === 'GOLD') tierColor = 'text-[#FFD700]';
              else if (item.badgeTier === 'SILVER') tierColor = 'text-[#C0C0C0]';

              return (
                <div key={item.id} className="glass-card p-6 flex flex-col justify-between relative overflow-hidden group">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.user?.profile?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                        alt={item.user?.profile?.fullName || 'Hacker'}
                        className="w-10 h-10 rounded-full border border-primary/20 object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-accent-white">
                          {item.user?.profile?.fullName || 'DIU Trainee'}
                        </h4>
                        <span className="text-[9px] text-text-muted uppercase font-mono tracking-wider block">
                          Type: {item.type} {item.platform ? `· ${item.platform}` : ''}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-display font-extrabold text-base text-accent-white line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-xs text-text-primary/70 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5 text-[10px] font-mono">
                    <span className="text-[#22C55E] font-bold flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Verified (+{item.points || 0} Pts)</span>
                    </span>
                    {item.badgeTier && (
                      <span className={`font-bold ${tierColor}`}>{item.badgeTier} TIER</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
