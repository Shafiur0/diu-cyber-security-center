'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Users, Search, Filter, Shield, Award, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function MembersPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    // Build query params
    const params = new URLSearchParams();
    if (batchFilter) params.append('batch', batchFilter);
    if (deptFilter) params.append('department', deptFilter);
    if (searchQuery) params.append('q', searchQuery);

    apiRequest(`/profiles?${params.toString()}`)
      .then((data) => {
        if (data && Array.isArray(data.profiles)) {
          setProfiles(data.profiles);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to retrieve directory logs.');
        setLoading(false);
      });
  }, [searchQuery, batchFilter, deptFilter]);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative cyber-grid">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex p-3 bg-primary/10 border border-primary/30 rounded-full text-primary">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-accent-white uppercase tracking-wider">
            CSC Member Directory
          </h1>
          <p className="text-text-primary/70 text-sm">
            Search and explore profiles of active Daffodil International University security student analysts, researchers, and trainees.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-bg-card/80 border border-primary/10 p-4 rounded-xl backdrop-blur-md">
          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search members by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-accent-white placeholder-text-muted focus:outline-none focus:border-primary font-sans"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="bg-[#141414] border border-white/10 text-xs text-text-primary rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary"
            >
              <option value="">All Batches</option>
              <option value="58">Batch 58</option>
              <option value="59">Batch 59</option>
              <option value="57">Batch 57</option>
              <option value="60">Batch 60</option>
            </select>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-[#141414] border border-white/10 text-xs text-text-primary rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary"
            >
              <option value="">All Departments</option>
              <option value="CSE">CSE Dept</option>
              <option value="SWE">Software Engineering</option>
              <option value="Computer Science">Computer Science</option>
            </select>
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="text-center py-24 font-mono text-xs text-text-muted animate-pulse">
            COMMUNICATING WITH USER SPACE CORE ENGINES...
          </div>
        ) : error ? (
          <div className="text-center py-24 font-mono text-xs text-danger">
            ERROR: {error}
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-24 font-mono text-xs text-text-muted">
            NO ANALYST RECORDS REGISTERED OR DETECTED MATCHING FILTERS.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {profiles.map((profile) => {
              const totalScore = profile.totalScore || 0;
              let badgeColor = 'text-primary';
              let badgeTier = 'BRONZE';
              if (totalScore >= 700) {
                badgeColor = 'text-[#E5E4E2]';
                badgeTier = 'PLATINUM';
              } else if (totalScore >= 300) {
                badgeColor = 'text-[#FFD700]';
                badgeTier = 'GOLD';
              } else if (totalScore >= 100) {
                badgeColor = 'text-[#C0C0C0]';
                badgeTier = 'SILVER';
              }

              return (
                <div key={profile.id} className="glass-card p-6 flex flex-col justify-between items-center text-center relative group">
                  <div className="absolute top-4 right-4 flex items-center space-x-1">
                    <span className={`text-[9px] font-mono font-bold ${badgeColor}`}>
                      {badgeTier}
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <img
                      src={profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                      alt={profile.fullName}
                      className="w-20 h-20 rounded-full border border-primary/20 object-cover mb-4 shadow-[0_0_10px_rgba(255,75,75,0.1)] group-hover:shadow-[0_0_15px_rgba(255,75,75,0.3)] transition-all duration-300"
                    />
                    <h3 className="font-display font-extrabold text-base text-accent-white leading-snug">
                      {profile.fullName}
                    </h3>
                    <span className="text-[10px] text-text-muted font-mono block mt-1">
                      {profile.studentId || 'ID UNASSIGNED'}
                    </span>
                    <span className="text-[10px] text-text-primary/70 font-mono mt-0.5 block">
                      Batch {profile.batch || 'TBA'} | {profile.department || 'TBA'}
                    </span>
                    <p className="text-xs text-text-primary/60 line-clamp-2 mt-4 leading-relaxed font-sans">
                      {profile.bio || 'DIU Cyber Security Center student trainee analyst.'}
                    </p>
                  </div>

                  {/* Skills badges */}
                  <div className="w-full mt-4">
                    <div className="flex flex-wrap justify-center gap-1">
                      {profile.skills && profile.skills.length > 0 ? (
                        profile.skills.slice(0, 3).map((s: string) => (
                          <span key={s} className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-accent-white font-mono">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-text-muted font-mono italic">No skills listed</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom score and profile view */}
                  <div className="w-full mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-text-muted">Total Score:</span>
                    <span className="text-primary font-bold">{totalScore} Pts</span>
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
