'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Shield,
  Award,
  Calendar,
  BookOpen,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState('Overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [pendingAchievements, setPendingAchievements] = useState<any[]>([]);

  // Forms
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeSlug, setNoticeSlug] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeCategory, setNoticeCategory] = useState('GENERAL');
  const [noticeUrgent, setNoticeUrgent] = useState(false);
  const [noticeSuccess, setNoticeSuccess] = useState('');

  const [eventTitle, setEventTitle] = useState('');
  const [eventSlug, setEventSlug] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventType, setEventType] = useState('WORKSHOP');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');
  const [eventSuccess, setEventSuccess] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      const role = session.user.role;
      if (role !== 'ADMIN' && role !== 'SUPER_ADMIN' && role !== 'TEACHER') {
        router.push('/student');
      }
    }
  }, [status, session, router]);

  // Load analytics & submissions
  useEffect(() => {
    if (status === 'authenticated') {
      const token = localStorage.getItem('token');
      // Fetch analytics
      fetch('http://localhost:5000/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setAnalytics(data);
          } else {
            // Fallback mock charts data
            setAnalytics({
              counters: { totalMembers: 547, pendingAchievements: 23, eventsThisMonth: 4, activeToday: 89 },
              charts: {
                membershipGrowth: [
                  { month: 'Jan', members: 400 },
                  { month: 'Feb', members: 420 },
                  { month: 'Mar', members: 450 },
                  { month: 'Apr', members: 480 },
                  { month: 'May', members: 510 },
                  { month: 'Jun', members: 547 },
                ],
                achievementTypes: [
                  { name: 'Certifications', value: 40 },
                  { name: 'CTFs', value: 30 },
                  { name: 'Bug Bounty', value: 15 },
                  { name: 'Research', value: 15 },
                ],
                eventRegistrations: [
                  { name: 'Workshop', registrations: 120 },
                  { name: 'CTF Speed', registrations: 85 },
                  { name: 'Seminar', registrations: 200 },
                ],
              },
            });
          }
        })
        .catch(() => {});

      // Fetch pending achievements for queue review
      fetch('http://localhost:5000/api/achievements', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          // Filter to show pending items or all
          if (Array.isArray(data)) {
            setPendingAchievements(data.filter((a) => a.status === 'PENDING'));
          } else {
            setPendingAchievements([
              { id: '1', title: 'Certified Ethical Hacker v12', user: { email: 'shafim@diu.edu.bd', profile: { fullName: 'Shafiur Rahman Shafim' } }, points: 50, platform: 'EC-Council', type: 'certification' },
              { id: '2', title: 'PortSwigger Web Academy complete', user: { email: 'sajid@diu.edu.bd', profile: { fullName: 'Sajid Al Hasan' } }, points: 30, platform: 'PortSwigger', type: 'certification' },
            ]);
          }
        });
    }
  }, [status, session]);

  // Handle verify achievement action
  const handleVerify = async (id: string, statusVal: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`http://localhost:5000/api/achievements/${id}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          status: statusVal,
          rejectionReason: statusVal === 'REJECTED' ? 'Credential link invalid.' : null,
        }),
      });

      if (response.ok) {
        setPendingAchievements((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {}
  };

  // Submit new notice
  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNoticeSuccess('');
    try {
      const response = await fetch('http://localhost:5000/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: noticeTitle,
          slug: noticeSlug,
          content: noticeContent,
          category: noticeCategory,
          isPublished: true,
          isUrgent: noticeUrgent,
        }),
      });
      if (response.ok) {
        setNoticeSuccess('Notice published and broadcasted to active student alerts!');
        setNoticeTitle('');
        setNoticeSlug('');
        setNoticeContent('');
      }
    } catch (err) {}
  };

  // Submit new event
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEventSuccess('');
    try {
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: eventTitle,
          slug: eventSlug,
          description: eventDesc,
          type: eventType,
          startDate: eventStart,
          endDate: eventEnd,
          isPublished: true,
        }),
      });
      if (response.ok) {
        setEventSuccess('New operational bootcamp / event scheduled successfully!');
        setEventTitle('');
        setEventSlug('');
        setEventDesc('');
      }
    } catch (err) {}
  };

  if (!analytics) {
    return <div className="text-center py-24 font-mono text-text-muted">OPENING SECURE MENTOR CONSOLE...</div>;
  }

  const COLORS = ['#FF4B4B', '#FF7F7F', '#CC2E2E', '#E5E4E2'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-8">
      {/* Sidebar Nav */}
      <aside className="w-full lg:w-64 glass-card p-4 h-fit flex-shrink-0">
        <div className="font-display font-black text-xs text-primary uppercase tracking-widest px-4 py-2 border-b border-white/5 mb-4">
          Control Matrix
        </div>
        <nav className="flex flex-col space-y-1">
          {['Overview', 'Review Queue', 'Publish Notice', 'Create Event'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab ? 'bg-primary/10 border-l-2 border-primary text-primary' : 'text-text-primary/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow glass-card p-8 min-h-[500px]">
        {/* TAB 1: Overview */}
        {activeTab === 'Overview' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="font-display font-black text-2xl text-accent-white">Auditor Control Console</h2>
              <p className="text-xs text-text-muted mt-1">Aggregated threat index, registrations, and growth</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 border border-white/10 bg-white/2 rounded-lg text-center">
                <span className="font-display font-black text-2xl text-primary block">{analytics.counters.totalMembers}</span>
                <span className="text-[10px] text-text-muted uppercase tracking-wider block mt-2">Total Members</span>
              </div>
              <div className="p-5 border border-white/10 bg-white/2 rounded-lg text-center">
                <span className="font-display font-black text-2xl text-primary block">{analytics.counters.pendingAchievements}</span>
                <span className="text-[10px] text-text-muted uppercase tracking-wider block mt-2">Pending Audits</span>
              </div>
              <div className="p-5 border border-white/10 bg-white/2 rounded-lg text-center">
                <span className="font-display font-black text-2xl text-primary block">{analytics.counters.eventsThisMonth}</span>
                <span className="text-[10px] text-text-muted uppercase tracking-wider block mt-2">Monthly Events</span>
              </div>
              <div className="p-5 border border-white/10 bg-white/2 rounded-lg text-center">
                <span className="font-display font-black text-2xl text-primary block">{analytics.counters.activeToday}</span>
                <span className="text-[10px] text-text-muted uppercase tracking-wider block mt-2">Active Today</span>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Line Chart */}
              <div className="p-6 border border-white/10 rounded-lg bg-black/20">
                <h3 className="text-xs font-display font-bold text-accent-white uppercase mb-4 tracking-wider">Membership Growth</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.charts.membershipGrowth}>
                      <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: 10 }} />
                      <YAxis stroke="#6B7280" style={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: '#141414', border: '1px solid rgba(255,75,75,0.2)' }} />
                      <Line type="monotone" dataKey="members" stroke="#FF4B4B" strokeWidth={2.5} dot={{ fill: '#FF4B4B' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="p-6 border border-white/10 rounded-lg bg-black/20">
                <h3 className="text-xs font-display font-bold text-accent-white uppercase mb-4 tracking-wider">Event Registrations</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.charts.eventRegistrations}>
                      <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: 10 }} />
                      <YAxis stroke="#6B7280" style={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: '#141414', border: '1px solid rgba(255,75,75,0.2)' }} />
                      <Bar dataKey="registrations" fill="#FF4B4B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="p-6 border border-white/10 rounded-lg bg-black/20 lg:col-span-2">
                <h3 className="text-xs font-display font-bold text-accent-white uppercase mb-4 tracking-wider text-center">Achievement Types Breakdown</h3>
                <div className="h-64 flex justify-center">
                  <ResponsiveContainer width="50%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.charts.achievementTypes}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analytics.charts.achievementTypes.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Review Queue */}
        {activeTab === 'Review Queue' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display font-black text-2xl text-accent-white">Verification Submissions Queue</h2>
              <p className="text-xs text-text-muted mt-1">Pending audit reviews for DIU student credentials</p>
            </div>

            <div className="space-y-4">
              {pendingAchievements.length === 0 ? (
                <div className="text-center py-12 text-text-muted font-mono text-xs">No pending verification items found.</div>
              ) : (
                pendingAchievements.map((item) => (
                  <div key={item.id} className="p-6 border border-white/10 bg-white/2 rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display font-bold text-base text-accent-white">{item.title}</h4>
                        <span className="text-[10px] text-text-muted font-mono block mt-1">
                          Applicant: {item.user?.profile?.fullName || item.user?.email || 'Student'}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono block">Platform: {item.platform || 'General'}</span>
                      </div>
                      <span className="text-xs font-bold text-primary font-mono">+{item.points} Pts</span>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => handleVerify(item.id, 'APPROVED')}
                        className="px-4 py-2 bg-[#22C55E]/20 hover:bg-[#22C55E]/40 border border-[#22C55E]/40 rounded text-xs font-bold text-[#22C55E] flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Verify & Approve</span>
                      </button>
                      <button
                        onClick={() => handleVerify(item.id, 'REJECTED')}
                        className="px-4 py-2 bg-danger/20 hover:bg-danger/40 border border-danger/40 rounded text-xs font-bold text-danger flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject Submission</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Publish Notice */}
        {activeTab === 'Publish Notice' && (
          <form onSubmit={handleNoticeSubmit} className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display font-black text-2xl text-accent-white">Broadcast New Notice</h2>
              <p className="text-xs text-text-muted mt-1">Publish notifications instantly to notice board feeds</p>
            </div>

            {noticeSuccess && <div className="text-xs bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] p-3 rounded">{noticeSuccess}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">Notice Title</label>
                <input
                  type="text"
                  required
                  value={noticeTitle}
                  onChange={(e) => {
                    setNoticeTitle(e.target.value);
                    setNoticeSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  placeholder="e.g. Speed-Run CTF Registration Extended"
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">URL Slug</label>
                <input
                  type="text"
                  required
                  value={noticeSlug}
                  onChange={(e) => setNoticeSlug(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">Category</label>
                <select
                  value={noticeCategory}
                  onChange={(e) => setNoticeCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none"
                >
                  <option value="GENERAL">General Notice</option>
                  <option value="ACADEMIC">Academic Schedule</option>
                  <option value="EVENT">Event Announcement</option>
                  <option value="ACHIEVEMENT">Achievement Registry</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="noticeUrgent"
                  checked={noticeUrgent}
                  onChange={(e) => setNoticeUrgent(e.target.checked)}
                  className="rounded border-white/10 bg-[#0D0D0D] text-primary focus:ring-0 focus:ring-offset-0"
                />
                <label htmlFor="noticeUrgent" className="text-xs font-mono text-text-primary/70 cursor-pointer">
                  Mark as URGENT (Broadcast alert red pill)
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">Notice content body</label>
                <textarea
                  required
                  rows={6}
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="Markdowns or details..."
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-primary hover:bg-primary-dim text-white text-xs font-display font-extrabold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Publish Notice Board
            </button>
          </form>
        )}

        {/* TAB 4: Create Event */}
        {activeTab === 'Create Event' && (
          <form onSubmit={handleEventSubmit} className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display font-black text-2xl text-accent-white">Schedule New Operation Event</h2>
              <p className="text-xs text-text-muted mt-1">Insert entries into public upcoming event schedules</p>
            </div>

            {eventSuccess && <div className="text-xs bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] p-3 rounded">{eventSuccess}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">Event Title</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => {
                    setEventTitle(e.target.value);
                    setEventSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  placeholder="e.g. Savar Campus Hacking Bootcamp"
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">URL Slug</label>
                <input
                  type="text"
                  required
                  value={eventSlug}
                  onChange={(e) => setEventSlug(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none"
                >
                  <option value="WORKSHOP">Workshop / training lab</option>
                  <option value="CTF">CTF competition</option>
                  <option value="SEMINAR">Academic Seminar</option>
                  <option value="TRAINING">Career training</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-text-primary/70 mb-2 block">Start Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0D0D0D] border border-white/10 rounded text-xs text-accent-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-text-primary/70 mb-2 block">End Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventEnd}
                    onChange={(e) => setEventEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0D0D0D] border border-white/10 rounded text-xs text-accent-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-mono text-text-primary/70 mb-2 block">Description</label>
                <textarea
                  required
                  rows={4}
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="Detailed guidelines, syllabus, and platforms tools required..."
                  className="w-full px-4 py-2 bg-[#0D0D0D] border border-white/10 rounded-lg text-sm text-accent-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-primary hover:bg-primary-dim text-white text-xs font-display font-extrabold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Publish Scheduled Event
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
