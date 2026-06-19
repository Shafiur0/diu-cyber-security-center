'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ThreatPulseGrid from '../components/effects/ThreatPulseGrid';
import {
  Shield,
  Award,
  Calendar,
  BookOpen,
  Users,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  MapPin,
  ExternalLink,
  ChevronDown,
  Quote,
  Eye,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  // 1. Typewriter state
  const typewriterRoles = ['Ethical Hackers', 'CTF Champions', 'Security Engineers', 'Incident Responders'];
  const [roleIndex, setRoleIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fullText = typewriterRoles[roleIndex];

    const handleType = () => {
      if (!isDeleting) {
        setCurrentText(fullText.substring(0, currentText.length + 1));
        if (currentText === fullText) {
          timer = setTimeout(() => setIsDeleting(true), 2000);
        } else {
          timer = setTimeout(handleType, 100);
        }
      } else {
        setCurrentText(fullText.substring(0, currentText.length - 1));
        if (currentText === '') {
          setIsDeleting(false);
          setRoleIndex((prev) => (prev + 1) % typewriterRoles.length);
          timer = setTimeout(handleType, 500);
        } else {
          timer = setTimeout(handleType, 50);
        }
      }
    };

    timer = setTimeout(handleType, isDeleting ? 50 : 100);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, roleIndex]);

  // 2. Count-up statistics state
  const [stats, setStats] = useState({ members: 0, certified: 0, ctfWins: 0, alumni: 0 });
  useEffect(() => {
    const duration = 2000;
    const steps = 50;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setStats({
        members: Math.min(500, Math.floor((500 / steps) * step)),
        certified: Math.min(120, Math.floor((120 / steps) * step)),
        ctfWins: Math.min(45, Math.floor((45 / steps) * step)),
        alumni: Math.min(200, Math.floor((200 / steps) * step)),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // 3. Notices filter
  const mockNotices = [
    { id: 1, title: 'Annual National CTF Speed-Run 2026 Registration Open', slug: 'annual-ctf-2026', category: 'URGENT', isPinned: true, date: 'June 18, 2026', views: 320 },
    { id: 2, title: 'Ethical Hacking Workshop: OWASP Top 10 Deep Dive', slug: 'owasp-workshop', category: 'EVENT', isPinned: false, date: 'June 15, 2026', views: 184 },
    { id: 3, title: 'Academic Schedule for Cybersecurity Semester Finals', slug: 'academic-finals', category: 'ACADEMIC', isPinned: false, date: 'June 12, 2026', views: 98 },
  ];

  // 4. Events with Countdowns
  const [eventCountdown, setEventCountdown] = useState({ days: 4, hours: 14, minutes: 32, seconds: 12 });
  useEffect(() => {
    const timer = setInterval(() => {
      setEventCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        clearInterval(timer);
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 5. Achievement Hall filters
  const [achievementFilter, setAchievementFilter] = useState('All');
  const mockAchievements = [
    { id: 1, name: 'Tarek Jamil', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80', title: 'Offensive Security Certified Professional (OSCP)', type: 'Certifications', tier: 'PLATINUM', proof: '#' },
    { id: 2, name: 'Sajid Al Hasan', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=80&q=80', title: '1st Place in CyberSecurity Challenge Bangladesh', type: 'CTF', tier: 'GOLD', proof: '#' },
    { id: 3, name: 'Monir Hossain', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80', title: 'Microsoft Azure Security Engineer (AZ-500)', type: 'Certifications', tier: 'SILVER', proof: '#' },
    { id: 4, name: 'Ferdous Wahid', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80', title: 'Critical RCE bug report accepted on HackerOne', type: 'Bug Bounty', tier: 'GOLD', proof: '#' },
    { id: 5, name: 'Tahmid Rahman', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80', title: 'Research published on AI-driven Malware Analysis', type: 'Research', tier: 'PLATINUM', proof: '#' },
  ];
  const filteredAchievements = achievementFilter === 'All'
    ? mockAchievements
    : mockAchievements.filter((a) => a.type === achievementFilter);

  // 6. Leaderboard Period filter
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('all');
  const mockLeaderboard = [
    { rank: 1, name: 'Shafiur Rahman Shafim', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80', htb: 8900, thm: 14500, ctf: 1200, total: 24600 },
    { rank: 2, name: 'Tarek Jamil', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=80&q=80', htb: 7200, thm: 11000, ctf: 950, total: 19150 },
    { rank: 3, name: 'Ferdous Wahid', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80', htb: 5400, thm: 9800, ctf: 800, total: 16000 },
    { rank: 4, name: 'Sajid Al Hasan', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80', htb: 3400, thm: 8500, ctf: 750, total: 12650 },
    { rank: 5, name: 'Monir Hossain', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80', htb: 4100, thm: 6500, ctf: 600, total: 11200 },
  ];

  // 7. Resource categories
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const resourceCategories = [
    { id: 'paths', label: 'Learning Paths', desc: 'Step-by-step tracks from novice to threat researcher.' },
    { id: 'ctf', label: 'CTF Platforms', desc: 'Direct access links to training platforms.' },
    { id: 'blogs', label: 'Research Blogs', desc: 'Techniques, writeups, and security notifications.' },
    { id: 'roadmaps', label: 'Career Roadmaps', desc: 'Career guides for defensive and offensive paths.' },
    { id: 'tools', label: 'Exploit Tools', desc: 'Core repositories and tools list.' },
    { id: 'videos', label: 'Video Courses', desc: 'Interactive visual training sessions.' },
  ];
  const mockResources: Record<string, string[]> = {
    paths: ['Junior Penetration Tester Syllabus', 'SOC Analyst fundamentals', 'Web Security Suite'],
    ctf: ['TryHackMe Rooms (CSC Room)', 'HackTheBox Battleground', 'CTFTime Schedule List'],
    blogs: ['PortSwigger Web Exploitation Writeups', 'Krebs on Security updates', 'CSC DIU Research Journal'],
    roadmaps: ['Red Team Career Guide 2026', 'Blue Team Infrastructure Roadmap', 'DevSecOps Guide'],
    tools: ['Burp Suite Community Pack', 'Metasploit payloads list', 'Ghidra Decompiler suite'],
    videos: ['CSC DIU Cryptography Lecture 1', 'OWASP Top 10 Demo series', 'Wireshark analysis tutorial'],
  };

  // 8. Gallery Lightbox state
  const [galleryFilter, setGalleryFilter] = useState('All');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const mockGallery = [
    { id: 1, title: 'Ethical Hacking Hackathon 2025', category: 'Competition', src: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80' },
    { id: 2, title: 'Secure Coding Seminar Savar', category: 'Seminar', src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80' },
    { id: 3, title: 'CSC Industry Visit to TechLab', category: 'Industry Visit', src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80' },
    { id: 4, title: 'Wargames CTF Lab Session', category: 'Workshop', src: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80' },
  ];
  const filteredGallery = galleryFilter === 'All'
    ? mockGallery
    : mockGallery.filter((g) => g.category === galleryFilter);

  // 9. Member Directory Search/Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const mockMembers = [
    { id: 1, name: 'Shafiur Rahman Shafim', batch: '58', dept: 'CSE', skills: ['Web Security', 'CTF', 'OSINT'], avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80', rank: 'PLATINUM' },
    { id: 2, name: 'Tarek Jamil', batch: '59', dept: 'CSE', skills: ['Network Pentesting', 'Malware', 'C++'], avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=120&q=80', rank: 'GOLD' },
    { id: 3, name: 'Tasnim Hasan', batch: '57', dept: 'SWE', skills: ['Reverse Engineering', 'Binary', 'Assembly'], avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', rank: 'SILVER' },
    { id: 4, name: 'Ferdous Wahid', batch: '58', dept: 'CSE', skills: ['Bug Bounty', 'Web Security', 'API Exploit'], avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', rank: 'GOLD' },
  ];
  const filteredMembers = mockMembers.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch = batchFilter ? m.batch === batchFilter : true;
    const matchesSkill = skillFilter ? m.skills.includes(skillFilter) : true;
    return matchesSearch && matchesBatch && matchesSkill;
  });

  return (
    <div className="relative w-full">
      {/* 2. Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-24 cyber-scanline">
        <ThreatPulseGrid />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0D0D0D]/60 to-[#0D0D0D] z-1" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-mono tracking-wider uppercase">
            <Shield className="w-3.5 h-3.5" />
            <span>Daffodil International University</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl leading-tight text-accent-white">
            Building The Next Generation Of <br />
            <span className="text-primary tracking-wide neon-glow">
              Cyber Security Professionals
            </span>
          </h1>

          <div className="h-10 text-xl sm:text-3xl font-mono text-text-primary/80">
            &gt; <span className="border-r-2 border-primary pr-1 font-semibold">{currentText}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dim text-white font-display font-extrabold uppercase tracking-wider rounded-lg shadow-[0_0_20px_rgba(255,75,75,0.4)] hover:shadow-[0_0_35px_rgba(255,75,75,0.6)] transition-all duration-300 text-center"
            >
              Join CSC
            </Link>
            <a
              href="#members-preview"
              className="w-full sm:w-auto px-8 py-4 border border-primary/30 hover:border-primary/75 bg-white/5 hover:bg-white/10 text-accent-white font-display font-bold uppercase tracking-wider rounded-lg transition-all duration-300 text-center"
            >
              Explore Members
            </a>
            <a
              href="#achievements"
              className="w-full sm:w-auto px-8 py-4 text-text-primary/70 hover:text-primary font-display font-medium uppercase tracking-wider transition-all duration-300 text-center"
            >
              View Achievements
            </a>
          </div>

          {/* Live Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-4xl mx-auto">
            {[
              { label: 'Active Members', value: stats.members, suffix: '+' },
              { label: 'Certified Professionals', value: stats.certified, suffix: '+' },
              { label: 'CTF Competition Wins', value: stats.ctfWins, suffix: '+' },
              { label: 'Alumni Network', value: stats.alumni, suffix: '+' },
            ].map((stat, idx) => (
              <div key={idx} className="glass-card p-6 flex flex-col items-center justify-center">
                <span className="font-display font-black text-3xl sm:text-4xl text-primary font-extrabold">
                  {stat.value}
                  {stat.suffix}
                </span>
                <span className="text-xs text-text-muted mt-2 text-center uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. About CSC Strip */}
      <section className="py-24 bg-black/40 border-y border-white/5 relative cyber-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Mission', text: 'To train, guide, and prepare students with the practical tools and penetration testing methodologies required to secure commercial systems and organizations.' },
              { title: 'Vision', text: 'To build a elite community of security researchers, ethical hackers, and forensic experts representing DIU globally in cybersecurity frameworks.' },
              { title: 'Objectives', text: 'Run weekly CTF bootcamps, process verification requests for international certifications, and match teams for national cybersecurity challenges.' },
            ].map((card, i) => (
              <div key={i} className="glass-card p-8 border-l-4 border-l-primary relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-1 transition-all duration-500 group-hover:scale-150" />
                <h3 className="font-display font-bold text-xl text-accent-white mb-4">{card.title}</h3>
                <p className="text-sm text-text-primary/70 leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Statistics Bar */}
      <section className="py-12 bg-[#0A0A0A] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-around items-center gap-8">
          {[
            { label: 'Registered Members', count: 547 },
            { label: 'Certs & Badges', count: 189 },
            { label: 'CTF Placements', count: 52 },
            { label: 'Industry Partners', count: 12 },
            { label: 'Faculty Mentors', count: 8 },
          ].map((item, idx) => (
            <div key={idx} className="text-center">
              <span className="font-display font-black text-3xl text-accent-white block border-b-2 border-primary/50 pb-1 px-2">
                {item.count}
              </span>
              <span className="text-[10px] text-text-muted uppercase tracking-wider block mt-2">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Latest Notices */}
      <section id="notices" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs font-mono text-primary uppercase tracking-widest block mb-2">// News & Alerts</span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-accent-white">Latest Activity Notices</h2>
          </div>
          <Link href="/notices" className="text-sm font-semibold text-primary hover:underline flex items-center space-x-1">
            <span>View All Notices</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockNotices.map((notice) => (
            <div
              key={notice.id}
              className={`glass-card p-6 flex flex-col justify-between ${
                notice.isPinned ? 'border-t-4 border-t-primary shadow-[0_0_15px_rgba(255,75,75,0.1)]' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      notice.category === 'URGENT'
                        ? 'bg-red-500/20 text-red-500'
                        : notice.category === 'EVENT'
                        ? 'bg-blue-500/20 text-blue-500'
                        : 'bg-green-500/20 text-green-500'
                    }`}
                  >
                    {notice.category}
                  </span>
                  {notice.isPinned && <span className="text-xs">📌 Pinned</span>}
                </div>
                <h3 className="font-display font-bold text-lg text-accent-white hover:text-primary transition-colors mb-4 line-clamp-2">
                  <Link href={`/notices/${notice.slug}`}>{notice.title}</Link>
                </h3>
              </div>
              <div className="flex items-center justify-between text-xs text-text-muted border-t border-white/5 pt-4 mt-6">
                <span>{notice.date}</span>
                <span className="flex items-center space-x-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{notice.views}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Upcoming Events */}
      <section id="events" className="py-24 bg-black/40 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-mono text-primary uppercase tracking-widest block mb-2">// Scheduled Operations</span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-accent-white">Upcoming Events & Bootcamps</h2>
            </div>
            {/* Live Countdown for Major Event */}
            <div className="flex items-center space-x-2 mt-4 md:mt-0 px-4 py-2 border border-primary/20 bg-primary/5 rounded-lg font-mono text-sm text-primary">
              <Clock className="w-4 h-4" />
              <span>CTF Speed-Run Begins:</span>
              <span className="font-bold">
                {eventCountdown.days}d {eventCountdown.hours}h {eventCountdown.minutes}m {eventCountdown.seconds}s
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              { title: 'National Speed-Run Capture The Flag 2026', type: 'CTF', desc: 'A 24-hour jeopardy-style CTF challenge focusing on crypto, reverse engineering, and web exploitation.' },
              { title: 'Active Directory Infrastructure Hacking', type: 'WORKSHOP', desc: 'Learn corporate network penetration testing, lateral movement, and kerberoasting.' },
              { title: 'AI-Driven Threat Audits Seminar', type: 'SEMINAR', desc: 'Exploring how next-generation LLM platforms can automate threat model building.' },
            ].map((event, idx) => (
              <div key={idx} className="glass-card overflow-hidden flex flex-col justify-between">
                <div className="h-44 bg-white/5 relative flex items-center justify-center border-b border-primary/10">
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                  <span className="absolute top-4 left-4 px-2 py-0.5 bg-primary/25 border border-primary/40 rounded text-[10px] font-bold text-primary uppercase font-mono">
                    {event.type}
                  </span>
                  <Shield className="w-16 h-16 text-white/5 group-hover:text-primary/20 transition-colors" />
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="font-display font-bold text-lg text-accent-white line-clamp-1">{event.title}</h3>
                  <p className="text-sm text-text-primary/70 line-clamp-3 leading-relaxed">{event.desc}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-xs text-text-muted">Register before Jun 24</span>
                    <button className="px-4 py-2 bg-primary hover:bg-primary-dim text-white font-display text-[10px] font-bold uppercase tracking-wider rounded transition-colors">
                      Register Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Achievement Hall */}
      <section id="achievements" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono text-primary uppercase tracking-widest block">// Certified Registry</span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-accent-white">Hall of Verified Achievements</h2>
          <p className="text-text-primary/70 text-sm">
            Profiles of students who have completed verifiable certification bodies, high rankings on CTF platforms, or bug bounty reports accepted.
          </p>

          {/* Filter tabs */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {['All', 'Certifications', 'CTF', 'Bug Bounty', 'Research'].map((tab) => (
              <button
                key={tab}
                onClick={() => setAchievementFilter(tab)}
                className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  achievementFilter === tab
                    ? 'bg-primary border-primary text-white shadow-[0_0_10px_rgba(255,75,75,0.4)]'
                    : 'bg-white/5 border-white/10 text-text-primary/70 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAchievements.map((item) => (
            <div key={item.id} className="glass-card p-6 flex flex-col justify-between relative overflow-hidden group">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full border border-primary/20 object-cover" />
                  <div>
                    <h4 className="text-sm font-bold text-accent-white">{item.name}</h4>
                    <span className="text-[10px] text-text-muted">{item.type}</span>
                  </div>
                </div>
                <h3 className="font-display font-bold text-base text-accent-white line-clamp-2 leading-snug">{item.title}</h3>
              </div>
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5 text-xs">
                <span className="text-[#22C55E] font-semibold flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verified by CSC DIU</span>
                </span>
                <span className="text-text-muted">{item.tier} Tier</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Leaderboard Preview */}
      <section id="leaderboard" className="py-24 bg-black/40 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-mono text-primary uppercase tracking-widest block mb-2">// Rankings</span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-accent-white">Scoreboard Rankings</h2>
            </div>
            {/* Period Filters */}
            <div className="flex border border-white/10 bg-white/5 rounded-lg p-1 mt-4 md:mt-0 font-mono text-xs">
              {['all', 'month', 'semester'].map((p) => (
                <button
                  key={p}
                  onClick={() => setLeaderboardPeriod(p)}
                  className={`px-3 py-1.5 rounded-md uppercase transition-all ${
                    leaderboardPeriod === p ? 'bg-primary text-white font-bold' : 'text-text-primary/70 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

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
                    <th className="p-4 text-right">Total Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm font-mono">
                  {mockLeaderboard.map((user) => {
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
                      <tr key={user.rank} className={`hover:bg-white/2 transition-colors ${isTop3 ? 'bg-primary/2' : ''}`}>
                        <td className="p-4 font-bold">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${glowClass}`}>
                            #{user.rank}
                          </span>
                        </td>
                        <td className="p-4 flex items-center space-x-3">
                          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-white/10 object-cover" />
                          <span className="font-sans font-bold text-accent-white">{user.name}</span>
                        </td>
                        <td className="p-4 text-text-primary/70">{user.htb} pts</td>
                        <td className="p-4 text-text-primary/70">{user.thm} pts</td>
                        <td className="p-4 text-text-primary/70">{user.ctf} pts</td>
                        <td className="p-4 text-right font-bold text-primary">{user.total} pts</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/leaderboard"
              className="inline-flex items-center space-x-2 text-sm font-bold text-primary hover:underline"
            >
              <span>View Full Leaderboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Faculty Members */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono text-primary uppercase tracking-widest block">// Academic Guides</span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-accent-white">Faculty Advisors & Mentors</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { name: 'Dr. Imran Mahmud', designation: 'Professor & Mentor', tags: ['Cryptography', 'Security Audits'], img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80' },
            { name: 'Ms. Sadia Tasnim', designation: 'Senior Lecturer', tags: ['Network Forensics', 'Incident Audit'], img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80' },
            { name: 'Mr. Rafiqul Islam', designation: 'Lecturer', tags: ['Reverse Engineering', 'Assembly'], img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' },
            { name: 'Dr. Touhid Bhuiyan', designation: 'Professor & Advisor', tags: ['Threat Intelligence', 'IDS'], img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80' },
          ].map((faculty, idx) => (
            <div key={idx} className="glass-card overflow-hidden relative group">
              <img src={faculty.img} alt={faculty.name} className="w-full h-56 object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
              <div className="p-6">
                <h3 className="font-display font-bold text-base text-accent-white">{faculty.name}</h3>
                <span className="text-xs text-primary font-semibold block mt-1">{faculty.designation}</span>

                {/* Hover Slide up overlay for tags */}
                <div className="absolute inset-x-0 bottom-0 bg-[#141414]/95 border-t border-primary/20 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h4 className="text-xs font-bold text-accent-white uppercase mb-3">Expertise Areas</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {faculty.tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-primary/10 border border-primary/30 text-primary px-2 py-0.5 rounded font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Alumni Hall of Fame */}
      <section className="py-24 bg-black/40 border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <span className="text-xs font-mono text-primary uppercase tracking-widest block mb-2">// Corporate Network</span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-accent-white">Alumni Hall of Fame</h2>
        </div>

        {/* Showcase Rail */}
        <div className="flex space-x-6 overflow-x-auto pb-8 px-8 no-scrollbar scroll-smooth">
          {[
            { name: 'Shubho Ahmed', role: 'Security Analyst', company: 'Google', batch: '2021', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80' },
            { name: 'Kazi Farhan', role: 'Penetration Tester', company: 'Microsoft', batch: '2022', img: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=120&q=80' },
            { name: 'Ayesha Akhter', role: 'Security Engineer', company: 'Meta', batch: '2020', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80' },
            { name: 'Mridul Hasan', role: 'SOC Lead', company: 'CrowdStrike', batch: '2023', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80' },
          ].map((alumnus, idx) => (
            <div key={idx} className="glass-card p-6 min-w-[280px] flex items-center space-x-4">
              <img src={alumnus.img} alt={alumnus.name} className="w-14 h-14 rounded-full border border-primary/20 object-cover flex-shrink-0" />
              <div>
                <h4 className="font-display font-bold text-sm text-accent-white">{alumnus.name}</h4>
                <p className="text-xs text-text-primary/70">{alumnus.role}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-accent-white font-mono">
                    {alumnus.company}
                  </span>
                  <span className="text-[10px] text-text-muted font-mono">Batch {alumnus.batch}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11. Cyber Security Resources */}
      <section id="resources" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-mono text-primary uppercase tracking-widest block mb-2">// Repository Vault</span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-accent-white">Cyber Security Resources</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {resourceCategories.map((cat) => {
            const isOpen = activeCategory === cat.id;
            return (
              <div key={cat.id} className="col-span-1 lg:col-span-3">
                <div
                  onClick={() => setActiveCategory(isOpen ? null : cat.id)}
                  className={`glass-card p-6 cursor-pointer select-none transition-all ${
                    isOpen ? 'border-primary shadow-[0_0_15px_rgba(255,75,75,0.15)] bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-extrabold text-base text-accent-white">{cat.label}</h3>
                    <ChevronDown className={`w-4 h-4 text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                  <p className="text-xs text-text-muted mt-2">{cat.desc}</p>

                  {/* Expanded resource list */}
                  {isOpen && (
                    <div className="mt-6 pt-4 border-t border-white/10 space-y-3 animate-fadeIn">
                      {mockResources[cat.id]?.map((res, i) => (
                        <div key={i} className="flex items-center justify-between text-xs text-text-primary/80 hover:text-primary py-1">
                          <span className="font-mono">{res}</span>
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 ml-2" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 12. Success Stories */}
      <section className="py-24 bg-black/40 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Quotation text */}
            <div className="space-y-6">
              <Quote className="w-12 h-12 text-primary/40" />
              <h2 className="font-display font-black text-2xl sm:text-4xl text-accent-white leading-tight">
                &ldquo;Starting at CSC DIU gave me the exact hands-on testing laboratory context needed to pivot from academia to threat hunts.&rdquo;
              </h2>
              <div>
                <h4 className="font-display font-bold text-lg text-accent-white">Farhan Tasnim</h4>
                <p className="text-sm text-primary font-semibold">Incident Responder, Standard Chartered Bank</p>
                <p className="text-xs text-text-muted font-mono mt-1">DIU Batch 56 Alumnus</p>
              </div>
            </div>

            {/* Accompanying image */}
            <div className="glass-card overflow-hidden rounded-xl border border-primary/20 aspect-video relative">
              <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80" alt="Cyber security lab" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* 13. Gallery */}
      <section id="gallery" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-mono text-primary uppercase tracking-widest block mb-2">// Visual Archives</span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-accent-white">CSC Gallery & Wargames</h2>
          </div>
          {/* Category Filters */}
          <div className="flex space-x-2 mt-4 md:mt-0 font-mono text-xs">
            {['All', 'Competition', 'Seminar', 'Workshop'].map((cat) => (
              <button
                key={cat}
                onClick={() => setGalleryFilter(cat)}
                className={`px-3 py-1.5 rounded-md uppercase transition-all ${
                  galleryFilter === cat ? 'bg-primary text-white font-bold' : 'text-text-primary/70 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              onClick={() => setLightboxImage(item.src)}
              className="glass-card overflow-hidden cursor-pointer group relative aspect-square"
            >
              <img src={item.src} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 p-4">
                <span className="text-xs text-white font-display font-bold text-center">{item.title}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {lightboxImage && (
          <div
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
          >
            <img src={lightboxImage} alt="Enlarged gallery view" className="max-w-full max-h-[90vh] object-contain rounded-lg border border-primary/20 shadow-2xl" />
          </div>
        )}
      </section>

      {/* 14. Member Directory Preview */}
      <section id="members-preview" className="py-24 bg-black/40 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-mono text-primary uppercase tracking-widest block">// DIU Cyber Directory</span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-accent-white">Member Directory</h2>
            <p className="text-text-primary/70 text-sm">
              Search and filter active student cybersecurity profiles by batch, department, skills, and ranking tiers.
            </p>

            {/* Live Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 border border-white/10 p-3 rounded-lg mt-8">
              <div className="relative w-full flex-grow">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search members by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-transparent text-sm focus:outline-none border-b border-transparent focus:border-primary/50 text-accent-white placeholder-text-muted font-sans"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="bg-[#141414] border border-white/10 text-xs text-text-primary rounded px-3 py-2 focus:outline-none focus:border-primary"
                >
                  <option value="">All Batches</option>
                  <option value="58">Batch 58</option>
                  <option value="59">Batch 59</option>
                  <option value="57">Batch 57</option>
                </select>
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="bg-[#141414] border border-white/10 text-xs text-text-primary rounded px-3 py-2 focus:outline-none focus:border-primary"
                >
                  <option value="">All Skills</option>
                  <option value="Web Security">Web Security</option>
                  <option value="Network Pentesting">Network Pentesting</option>
                  <option value="Reverse Engineering">Reverse Engineering</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredMembers.length === 0 ? (
              <div className="col-span-full text-center text-text-muted font-mono py-12">No matching threat actors found.</div>
            ) : (
              filteredMembers.map((member) => (
                <div key={member.id} className="glass-card p-6 flex flex-col justify-between items-center text-center">
                  <img src={member.avatar} alt={member.name} className="w-20 h-20 rounded-full border-2 border-primary/20 object-cover mb-4" />
                  <div>
                    <h4 className="font-display font-bold text-base text-accent-white">{member.name}</h4>
                    <span className="text-[10px] text-text-muted font-mono block mt-1">
                      Batch {member.batch} | Dept: {member.dept}
                    </span>
                    <div className="flex flex-wrap justify-center gap-1 mt-3">
                      {member.skills.map((s) => (
                        <span key={s} className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-accent-white">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 w-full flex items-center justify-between text-[10px] font-mono">
                    <span className="text-text-muted">Rank:</span>
                    <span className="text-primary font-bold">{member.rank}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 15. CTA Banner */}
      <section className="py-24 bg-[#0A0A0A] border-b border-white/5 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-primary/2 blur-[80px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
          <h2 className="font-display font-black text-3xl sm:text-5xl text-accent-white leading-tight">
            Ready to secure the future? <br />
            <span className="text-primary">Join the Cyber Security Center.</span>
          </h2>
          <p className="text-text-primary/70 text-sm max-w-lg mx-auto leading-relaxed">
            Gain access to our cybersecurity labs, capture flags with teammates, and kickstart your ethical hacking journey at DIU.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="px-8 py-3.5 bg-primary hover:bg-primary-dim text-white text-xs font-display font-extrabold uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(255,75,75,0.3)] transition-all"
            >
              Join CSC
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3.5 border border-white/10 hover:border-white/20 text-accent-white text-xs font-display font-bold uppercase tracking-wider rounded-lg transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* 16. Location & Headquarters map */}
      <section id="location" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono text-primary uppercase tracking-widest block">// Laboratory Coordinates</span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-accent-white uppercase tracking-wider">
            Visit Our Headquarters
          </h2>
          <p className="text-text-primary/70 text-sm">
            Our state-of-the-art Cyber Security Lab is located at Daffodil Smart City. Stop by for hands-on CTF runs, seminars, or to coordinate with our student mentors.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contact Details Card */}
          <div className="glass-card p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full border-b border-l border-primary/10" />
            <h3 className="font-display font-bold text-xl text-accent-white">CSC Lab Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-lg text-primary mt-1">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-primary uppercase tracking-wider">Location Address</h4>
                  <p className="text-sm text-text-primary/80 mt-1 leading-relaxed">
                    Cyber Security Lab (Room 402, Level 4)<br />
                    Academic Block 2, Daffodil Smart City<br />
                    Birulia, Savar, Dhaka, Bangladesh
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-lg text-primary mt-1">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-primary uppercase tracking-wider">Operational Hours</h4>
                  <p className="text-sm text-text-primary/80 mt-1 leading-relaxed">
                    Sunday - Thursday: 09:00 AM - 05:00 PM<br />
                    Friday - Saturday: Closed (Lab access via prior admin approval only)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-lg text-primary mt-1">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-primary uppercase tracking-wider">Lab Access Security Clearance</h4>
                  <p className="text-sm text-text-primary/80 mt-1 leading-relaxed">
                    Open to all registered DIU students. Trainees must present their digital DIU CSC Identity Card at the entrance scanner.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Google Map iframe container */}
          <div className="glass-card overflow-hidden rounded-2xl border border-primary/20 h-[380px] relative group shadow-[0_0_20px_rgba(255,75,75,0.05)] hover:shadow-[0_0_30px_rgba(255,75,75,0.15)] transition-all duration-500">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3648.37533658514!2d90.31818277591662!3d23.87631317424696!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c23d069d568b%3A0x677ea3eb6cfcf923!2sDaffodil%20International%20University!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd"
              className="w-full h-full border-0 grayscale invert opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
