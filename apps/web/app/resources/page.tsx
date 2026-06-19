'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { BookOpen, Shield, ExternalLink, Search, ChevronRight } from 'lucide-react';

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch resources
    apiRequest('/resources')
      .then((data) => {
        if (Array.isArray(data)) {
          setResources(data.filter((r: any) => r.isPublished));
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to retrieve resources.');
        setLoading(false);
      });
  }, []);

  const categories = [
    { id: 'learning_path', label: 'Learning Paths', desc: 'Syllabi and guides for various security concentrations.' },
    { id: 'ctf_platform', label: 'CTF Platforms', desc: 'Direct links and challenges for offensive laboratories.' },
    { id: 'blog', label: 'Research Journals', desc: 'Articles and advisories published by DIU CSC research team.' },
    { id: 'roadmap', label: 'Career Roadmaps', desc: 'Strategic career tracks and preparation methodologies.' },
    { id: 'video', label: 'Video Courses', desc: 'Official video lectures and wargame walk-throughs.' },
    { id: 'tool', label: 'Exploit Tools', desc: 'Baseline tools and repositories approved for audits.' },
  ];

  const filteredResources = (catId: string) => {
    return resources.filter((res) => {
      const matchesCategory = res.type === catId;
      const matchesSearch = searchQuery
        ? res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          res.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative cyber-grid">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex p-3 bg-primary/10 border border-primary/30 rounded-full text-primary">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-accent-white uppercase tracking-wider">
            CSC Resource Repository
          </h1>
          <p className="text-text-primary/70 text-sm">
            Access compiled security tools, verified research journals, automated roadmaps, and target platforms curated by DIU mentors.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto bg-bg-card/80 border border-primary/10 p-3 rounded-xl backdrop-blur-md">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search resource files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-accent-white placeholder-text-muted focus:outline-none focus:border-primary font-sans"
            />
          </div>
        </div>

        {/* Accordions */}
        {loading ? (
          <div className="text-center py-24 font-mono text-xs text-text-muted animate-pulse">
            RETRIEVING ENCRYPTED RESOURCE FILES...
          </div>
        ) : error ? (
          <div className="text-center py-24 font-mono text-xs text-danger">
            ERROR: {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat) => {
              const isOpen = activeCategory === cat.id;
              const matches = filteredResources(cat.id);

              return (
                <div key={cat.id} className="glass-card overflow-hidden">
                  <div
                    onClick={() => setActiveCategory(isOpen ? null : cat.id)}
                    className={`p-6 cursor-pointer select-none transition-all flex items-center justify-between hover:bg-white/2 ${
                      isOpen ? 'border-b border-primary/10 bg-primary/5' : ''
                    }`}
                  >
                    <div>
                      <h3 className="font-display font-extrabold text-base text-accent-white">{cat.label}</h3>
                      <p className="text-xs text-text-muted mt-1">{cat.desc}</p>
                    </div>
                    <ChevronRight className={`w-4.5 h-4.5 text-primary transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </div>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className="p-6 bg-black/20 space-y-4 divide-y divide-white/5 animate-fadeIn">
                      {matches.length === 0 ? (
                        <div className="text-center py-6 text-xs text-text-muted font-mono italic">
                          No resource keys matching.
                        </div>
                      ) : (
                        matches.map((res) => (
                          <div key={res.id} className="pt-4 first:pt-0 flex flex-col justify-between space-y-2">
                            <div className="flex justify-between items-start">
                              <h4 className="text-xs font-bold text-accent-white">{res.title}</h4>
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-primary hover:underline font-bold flex items-center space-x-1"
                              >
                                <span>Access</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <p className="text-[11px] text-text-primary/70">{res.description}</p>
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1 pt-1">
                              {res.tags && typeof res.tags === 'object' && res.tags.length > 0 ? (
                                res.tags.map((tag: string) => (
                                  <span key={tag} className="text-[8px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-accent-white font-mono">
                                    {tag}
                                  </span>
                                ))
                              ) : null}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
