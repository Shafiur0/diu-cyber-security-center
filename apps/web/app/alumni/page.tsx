'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Award, Shield, Briefcase, GraduationCap, ChevronRight } from 'lucide-react';

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/profiles')
      .then((data) => {
        if (data && Array.isArray(data.profiles)) {
          // Filter to show only alumni
          setAlumni(data.profiles.filter((p: any) => p.isAlumni));
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to retrieve alumni database.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative cyber-grid">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex p-3 bg-primary/10 border border-primary/30 rounded-full text-primary">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-accent-white uppercase tracking-wider">
            CSC Alumni Hall of Fame
          </h1>
          <p className="text-text-primary/70 text-sm">
            Honoring DIU Cyber Security Center graduates who are now leading the security industry across top global tech organizations.
          </p>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="text-center py-24 font-mono text-xs text-text-muted animate-pulse">
            LOADING SECURE ALUMNI REGISTER...
          </div>
        ) : error ? (
          <div className="text-center py-24 font-mono text-xs text-danger">
            ERROR: {error}
          </div>
        ) : alumni.length === 0 ? (
          <div className="text-center py-24 font-mono text-xs text-text-muted">
            NO ALUMNI TRACK RECORDS DETECTED IN THE ACTIVE DATABASE.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {alumni.map((alum) => (
              <div key={alum.id} className="glass-card p-6 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-1 transition-all duration-500 group-hover:scale-125" />

                <div className="space-y-6">
                  {/* Bio block */}
                  <div className="flex items-center space-x-4">
                    <img
                      src={alum.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                      alt={alum.fullName}
                      className="w-16 h-16 rounded-full border border-primary/20 object-cover shadow-[0_0_10px_rgba(255,75,75,0.1)]"
                    />
                    <div>
                      <h3 className="font-display font-extrabold text-lg text-accent-white">{alum.fullName}</h3>
                      <div className="flex items-center space-x-2 text-[10px] text-text-muted font-mono mt-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Graduated Batch: {alum.graduationBatch || alum.batch || 'TBA'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Position details */}
                  <div className="p-4 border border-white/5 bg-white/2 rounded-lg space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <Briefcase className="w-4 h-4 text-primary" />
                      <span className="text-accent-white font-bold">{alum.currentPosition || 'Security Engineer'}</span>
                    </div>
                    <div className="text-[10px] font-mono text-text-primary/70 pl-6">
                      Corporate Network: <span className="text-primary font-bold">{alum.currentCompany || 'DIU Partner'}</span>
                    </div>
                  </div>

                  {/* Quote or Bio summary */}
                  <p className="text-xs text-text-primary/80 leading-relaxed italic">
                    &ldquo;{alum.successStory || alum.bio || 'DIU Cyber Security Center equipped me with the baseline methodology and practical wargames required to enter the threat prevention workforce.'}&rdquo;
                  </p>
                </div>

                {/* Footer skills */}
                <div className="mt-8 pt-4 border-t border-white/5 flex flex-wrap gap-1">
                  {alum.skills && alum.skills.length > 0 ? (
                    alum.skills.slice(0, 3).map((s: string) => (
                      <span key={s} className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-accent-white font-mono">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-[9px] text-text-muted font-mono italic">No skills listed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
