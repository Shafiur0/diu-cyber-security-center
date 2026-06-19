'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, User, Search, Filter, Clock, ArrowRight, Eye } from 'lucide-react';
import Link from 'next/link';

// Mock Blog Data
const DUMMY_BLOGS = [
  {
    id: 1,
    title: 'Unveiling the Secrets of SQL Injection in Modern Web Applications',
    description: 'A deep dive into how SQL injections still bypass advanced WAFs in 2026, and how security analysts can audit source codes to locate vulnerabilities before exploitation.',
    category: 'Web Security',
    author: 'Shafiur Rahman',
    role: 'Lead Security Analyst',
    date: 'June 18, 2026',
    readTime: '6 min read',
    views: '1.2k views',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'How We Secured First Place in the National Cyber CTF 2026',
    description: 'The official write-up of Team CSC-DIU\'s strategies, breakthroughs, and write-ups for the toughest cryptography and binary exploitation challenges of the year.',
    category: 'CTF Writeups',
    author: 'Tamim Al Mahmud',
    role: 'CTF Team Captain',
    date: 'June 12, 2026',
    readTime: '10 min read',
    views: '840 views',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'A Beginner\'s Guide to Malware Reverse Engineering with Ghidra',
    description: 'Learn the foundational concepts of assembly language, static code analysis, and dissecting basic ransomware binaries safely inside isolated sandbox environments.',
    category: 'Malware Analysis',
    author: 'Dr. Munir Hossain',
    role: 'Cybersecurity Mentor',
    date: 'June 05, 2026',
    readTime: '8 min read',
    views: '2.1k views',
    image: 'https://images.unsplash.com/photo-1601597111158-2fceff270190?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    title: 'Analyzing the Latest Zero-Day Vulnerability in Linux Kernel Protocols',
    description: 'An analysis of a privilege escalation vulnerability affecting Linux kernels, detailing exploit mechanics and patch applications for enterprise administrators.',
    category: 'Threat Intel',
    author: 'Fahim Morshed',
    role: 'Senior Researcher',
    date: 'May 28, 2026',
    readTime: '7 min read',
    views: '950 views',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5,
    title: 'Top 10 Essential Cybersecurity Tools Every Trainee Should Master',
    description: 'From Wireshark and Burp Suite to Nmap and Metasploit—discover the core toolkit required to execute network audits and ethical hacking assignments.',
    category: 'Tutorials',
    author: 'Sadia Islam',
    role: 'Student Coordinator',
    date: 'May 20, 2026',
    readTime: '5 min read',
    views: '1.5k views',
    image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 6,
    title: 'Understanding Zero Trust Architecture for Campus Networks',
    description: 'A structural overview of implementing a zero-trust model at Daffodil Smart City network infrastructure to isolate network nodes and monitor user authorizations.',
    category: 'Network Security',
    author: 'Engr. Shafiul Alam',
    role: 'Network Engineer',
    date: 'May 10, 2026',
    readTime: '9 min read',
    views: '630 views',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80',
  },
];

const CATEGORIES = ['All', 'Web Security', 'CTF Writeups', 'Malware Analysis', 'Threat Intel', 'Tutorials', 'Network Security'];

export default function BlogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [filteredBlogs, setFilteredBlogs] = useState(DUMMY_BLOGS);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);

  useEffect(() => {
    let result = DUMMY_BLOGS;

    if (activeCategory !== 'All') {
      result = result.filter((blog) => blog.category === activeCategory);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (blog) =>
          blog.title.toLowerCase().includes(q) ||
          blog.description.toLowerCase().includes(q) ||
          blog.author.toLowerCase().includes(q)
      );
    }

    setFilteredBlogs(result);
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative cyber-grid">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex p-3 bg-primary/10 border border-primary/30 rounded-full text-primary">
            <BookOpen className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-accent-white uppercase tracking-wider">
            CSC Threat Reports & Blogs
          </h1>
          <p className="text-text-primary/70 text-sm">
            Read specialized cybersecurity articles, CTF write-ups, vulnerability analysis, and tech updates compiled by CSC student analysts and mentors.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-bg-card/85 border border-primary/10 p-5 rounded-2xl backdrop-blur-md">
          {/* Search bar */}
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search threat advisories, authors, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/45 border border-white/10 rounded-xl text-xs text-accent-white placeholder-text-muted focus:outline-none focus:border-primary font-sans"
            />
          </div>

          {/* Filters List */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-mono transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-primary text-white border border-primary shadow-[0_0_10px_rgba(255,75,75,0.4)]'
                    : 'bg-[#141414] hover:bg-white/5 text-text-primary/70 border border-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blogs Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-24 font-mono text-xs text-text-muted">
            NO ADVISORY LOGS DETECTED MATCHING FILTERS.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => (
              <div 
                key={blog.id} 
                className="glass-card flex flex-col justify-between overflow-hidden relative group hover:border-primary/30 transition-all duration-300"
              >
                <div>
                  {/* Blog Image */}
                  <div className="relative h-48 w-full overflow-hidden border-b border-white/5">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-primary/95 text-white font-mono text-[9px] font-bold px-2.5 py-1 rounded shadow-md">
                      {blog.category}
                    </div>
                  </div>

                  {/* Blog Details */}
                  <div className="p-6 space-y-4">
                    {/* Meta stats */}
                    <div className="flex items-center space-x-4 text-[10px] text-text-muted font-mono">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-primary" />
                        <span>{blog.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-primary" />
                        <span>{blog.readTime}</span>
                      </div>
                    </div>

                    <h3 className="font-display font-extrabold text-base text-accent-white leading-snug group-hover:text-primary transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-text-primary/60 line-clamp-3 leading-relaxed font-sans">
                      {blog.description}
                    </p>
                  </div>
                </div>

                {/* Author Info & Button */}
                <div className="p-6 pt-0 mt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                      {blog.author.substring(0, 2)}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-accent-white">{blog.author}</div>
                      <div className="text-[9px] text-text-muted font-mono">{blog.role}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedBlog(blog)}
                    className="p-2 text-primary hover:text-white bg-primary/5 hover:bg-primary rounded-lg transition-all duration-300 border border-primary/10 hover:shadow-[0_0_10px_rgba(255,75,75,0.4)]"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Blog Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-primary/30 max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl relative max-h-[85vh] overflow-y-auto">
            {/* Modal Image */}
            <div className="relative h-60 w-full">
              <img
                src={selectedBlog.image}
                alt={selectedBlog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] to-transparent" />
              <button
                onClick={() => setSelectedBlog(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-primary text-white p-2.5 rounded-full transition-colors border border-white/10"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-6 bg-primary/95 text-white font-mono text-[9px] font-bold px-2.5 py-1 rounded">
                {selectedBlog.category}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center space-x-4 text-[10px] text-text-muted font-mono">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>{selectedBlog.date}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>{selectedBlog.readTime}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  <span>{selectedBlog.views}</span>
                </div>
              </div>

              <h2 className="font-display font-black text-xl sm:text-2xl text-accent-white leading-tight uppercase tracking-wider">
                {selectedBlog.title}
              </h2>

              <div className="flex items-center space-x-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-primary font-extrabold text-sm">
                  {selectedBlog.author.substring(0, 2)}
                </div>
                <div>
                  <div className="text-xs font-extrabold text-accent-white">{selectedBlog.author}</div>
                  <div className="text-[10px] text-text-muted font-mono">{selectedBlog.role}</div>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-text-primary/80 space-y-4 leading-relaxed font-sans">
                <p>{selectedBlog.description}</p>
                <p>
                  At the DIU Cyber Security Center (CSC), research and security audits are critical parts of our student analyst curriculum. This report details key exploit mitigation strategies, demonstrating our commitment to maintaining Daffodil International University\'s security posture.
                </p>
                <p className="border-l-2 border-primary pl-4 py-2 font-mono text-xs bg-primary/5 text-primary">
                  RECONNAISSANCE LOG #2026-CSC-091: Audit logs completed. Zero threats undetected.
                </p>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="px-6 py-2.5 bg-white/5 hover:bg-primary border border-white/10 hover:border-primary text-xs font-mono uppercase tracking-wider rounded-xl transition-all duration-300"
                >
                  Close Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
