'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Bell, Menu, X, Shield, Award, Calendar, BookOpen, Users, LogOut, LayoutDashboard, User } from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Monitor scroll for glass blur intensity
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch in-app notifications
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('http://localhost:5000/api/notifications/mine', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setNotifications(data.filter((n) => !n.isRead));
          }
        })
        .catch(() => {});
    }
  }, [status]);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    await signOut({ callbackUrl: '/login' });
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Members', href: '/members' },
    { label: 'Achievements', href: '/achievements' },
    { label: 'Events', href: '/events' },
    { label: 'Resources', href: '/resources' },
    { label: 'Alumni', href: '/alumni' },
    { label: 'Leaderboard', href: '/leaderboard' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-xl bg-black/60 border-b border-primary/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'bg-transparent border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <img
                src="/logo.png"
                alt="CSC DIU Logo"
                className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-display font-extrabold text-xl tracking-wider text-accent-white">
                CSC <span className="text-primary">·</span> DIU
              </span>
            </Link>
          </div>

          {/* Desktop Nav links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`font-sans font-medium text-sm transition-colors relative py-2 ${
                    isActive ? 'text-primary' : 'text-text-primary/70 hover:text-primary'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_8px_#FF4B4B]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right items */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'authenticated' ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    className="p-2 text-text-primary/70 hover:text-primary hover:bg-white/5 rounded-full transition-colors relative"
                  >
                    <Bell className="w-5.5 h-5.5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-[9px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifDropdown && (
                    <div className="absolute right-0 mt-3 w-80 bg-bg-card border border-primary/20 backdrop-blur-md rounded-lg shadow-2xl p-2 z-50">
                      <div className="font-display text-xs font-bold text-primary px-3 py-2 border-b border-white/10 uppercase tracking-widest">
                        Alerts & Logs
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="text-text-muted text-xs text-center py-6">No new threat reports.</div>
                        ) : (
                          notifications.map((notif) => (
                            <div key={notif.id} className="p-3 hover:bg-white/5 rounded-md transition-colors border-b border-white/5 last:border-0">
                              <div className="text-xs font-semibold text-accent-white">{notif.title}</div>
                              <div className="text-[11px] text-text-primary/70 mt-1">{notif.body}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dashboard / User Dropdown */}
                <Link
                  href={
                    session.user.role === 'SUPER_ADMIN'
                      ? '/superadmin'
                      : session.user.role === 'ADMIN'
                      ? '/admin'
                      : session.user.role === 'TEACHER'
                      ? '/teacher'
                      : '/student'
                  }
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-primary/20 hover:border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                  <span className="text-xs font-sans font-semibold text-accent-white">Dashboard</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-text-primary/60 hover:text-primary rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-sans font-medium text-text-primary/70 hover:text-primary transition-colors">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dim text-white text-xs font-display font-extrabold uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(255,75,75,0.3)] hover:shadow-[0_0_25px_rgba(255,75,75,0.5)] transition-all duration-300"
                >
                  Join CSC
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {status === 'authenticated' && (
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 text-text-primary/70 hover:text-primary transition-colors relative"
              >
                <Bell className="w-5.5 h-5.5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-[9px] font-bold text-white rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-text-primary hover:text-primary rounded-md transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-20 bg-black/95 z-40 flex flex-col px-6 py-8 space-y-6 border-t border-primary/10 transition-transform duration-300">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="font-display font-bold text-lg text-text-primary hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col space-y-4">
            {status === 'authenticated' ? (
              <>
                <Link
                  href={
                    session.user.role === 'SUPER_ADMIN'
                      ? '/superadmin'
                      : session.user.role === 'ADMIN'
                      ? '/admin'
                      : session.user.role === 'TEACHER'
                      ? '/teacher'
                      : '/student'
                  }
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center space-x-2 py-3 bg-white/5 border border-primary/20 hover:border-primary/50 rounded-lg text-accent-white font-semibold text-sm"
                >
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                  <span>Go to Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center space-x-2 py-3 bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary rounded-lg font-bold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-3 border border-white/10 text-text-primary rounded-lg text-sm font-semibold hover:bg-white/5"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-3 bg-primary text-white rounded-lg text-sm font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(255,75,75,0.3)]"
                >
                  Join CSC
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
