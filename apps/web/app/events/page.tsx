'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Calendar, Shield, MapPin, ExternalLink, Clock, Award } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function EventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registrationMsg, setRegistrationMsg] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Fetch only published events for directory
    apiRequest('/events?isPublished=true')
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to retrieve operational events.');
        setLoading(false);
      });
  }, []);

  const handleRegister = async (eventId: string) => {
    if (status !== 'authenticated') {
      router.push('/login');
      return;
    }

    try {
      setRegistrationMsg((prev) => ({ ...prev, [eventId]: 'Processing registration...' }));
      const res = await apiRequest(`/events/${eventId}/register`, {
        method: 'POST',
      });
      if (res && !res.error) {
        setRegistrationMsg((prev) => ({ ...prev, [eventId]: 'Registered successfully! 🎟️ Check your dashboard.' }));
        // Refresh event registrations count
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? { ...e, _count: { registrations: (e._count?.registrations || 0) + 1 } }
              : e
          )
        );
      }
    } catch (err: any) {
      setRegistrationMsg((prev) => ({ ...prev, [eventId]: err.message || 'Registration failed' }));
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative cyber-grid">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex p-3 bg-primary/10 border border-primary/30 rounded-full text-primary">
            <Calendar className="w-8 h-8" />
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-accent-white uppercase tracking-wider">
            Operational Events & CTFs
          </h1>
          <p className="text-text-primary/70 text-sm">
            Join DIU Cyber Security Center hacking wargames, practical defense laboratories, career training bootcamps, and academic security seminars.
          </p>
        </div>

        {/* List Grid */}
        {loading ? (
          <div className="text-center py-24 font-mono text-xs text-text-muted animate-pulse">
            COLLECTING MISSION-CRITICAL EVENT FILES...
          </div>
        ) : error ? (
          <div className="text-center py-24 font-mono text-xs text-danger">
            ERROR: {error}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24 font-mono text-xs text-text-muted">
            NO UPCOMING EVENTS SCHEDULED IN SYSTEM DIRECTORY.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const startDate = new Date(event.startDate);
              const formattedDate = startDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={event.id} className="glass-card overflow-hidden flex flex-col justify-between group">
                  <div className="h-44 bg-[#0D0D0D] relative flex items-center justify-center border-b border-primary/10">
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                    <span className="absolute top-4 left-4 px-2 py-0.5 bg-primary/25 border border-primary/40 rounded text-[10px] font-bold text-primary uppercase font-mono tracking-wider">
                      {event.type}
                    </span>
                    <Shield className="w-16 h-16 text-white/5 group-hover:text-primary/20 transition-colors duration-500" />
                  </div>

                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-display font-extrabold text-lg text-accent-white leading-snug group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      
                      <div className="flex items-center space-x-2 text-[10px] text-text-muted font-mono mt-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formattedDate}</span>
                      </div>

                      <p className="text-xs text-text-primary/70 line-clamp-3 leading-relaxed mt-3">
                        {event.description}
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-text-muted flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          <span>{event.venue || (event.isOnline ? 'Online Platform' : 'DIU Campus')}</span>
                        </span>
                        <span className="text-primary font-bold">
                          {event._count?.registrations || 0} Registered
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {event.tags && typeof event.tags === 'object' && event.tags.length > 0 ? (
                          event.tags.map((tag: string) => (
                            <span key={tag} className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-accent-white font-mono">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] text-text-muted font-mono italic">No tags listed</span>
                        )}
                      </div>

                      {/* Register Button */}
                      <div className="pt-2">
                        <button
                          onClick={() => handleRegister(event.id)}
                          className="w-full py-2.5 bg-primary hover:bg-primary-dim text-white font-display text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                        >
                          Register for Operation
                        </button>
                        {registrationMsg[event.id] && (
                          <div className="text-[9px] font-mono text-center text-primary mt-2">
                            &gt; {registrationMsg[event.id]}
                          </div>
                        )}
                      </div>
                    </div>
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
