import React from 'react';
import Link from 'next/link';
import { Github, Linkedin, Twitter, Mail, MapPin, Phone, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black/90 border-t border-primary/10 relative overflow-hidden">
      {/* Decorative Cyber Scanline */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-primary animate-pulse shadow-[0_0_8px_#FF4B4B]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              <img
                src="/logo.png"
                alt="CSC DIU Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="font-display font-extrabold text-lg text-accent-white">CSC · DIU</span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed">
              Empowering student cybersecurity enthusiasts at Daffodil International University to build skills, capture flags, and secure the future.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-white/5 hover:bg-primary/20 rounded-md transition-colors text-text-primary/70 hover:text-white">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/5 hover:bg-primary/20 rounded-md transition-colors text-text-primary/70 hover:text-white">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/5 hover:bg-primary/20 rounded-md transition-colors text-text-primary/70 hover:text-white">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-display text-sm font-extrabold text-accent-white uppercase tracking-widest mb-6 border-l-2 border-primary pl-3">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {['Home', 'Members', 'Blogs', 'Achievements', 'Events', 'Resources', 'Alumni'].map((item) => (
                <li key={item}>
                  <Link
                    href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                    className="text-sm text-text-primary/70 hover:text-primary transition-colors block"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Platform Links */}
          <div>
            <h4 className="font-display text-sm font-extrabold text-accent-white uppercase tracking-widest mb-6 border-l-2 border-primary pl-3">
              Competitions
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Hack The Box', href: 'https://hackthebox.com' },
                { label: 'TryHackMe', href: 'https://tryhackme.com' },
                { label: 'CTFTime Profile', href: 'https://ctftime.org' },
                { label: 'HackerOne', href: 'https://hackerone.com' },
                { label: 'Bugcrowd', href: 'https://bugcrowd.com' },
              ].map((platform) => (
                <li key={platform.label}>
                  <a
                    href={platform.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-text-primary/70 hover:text-primary transition-colors block"
                  >
                    {platform.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-extrabold text-accent-white uppercase tracking-widest mb-6 border-l-2 border-primary pl-3">
              Contact Center
            </h4>
            <div className="flex items-start space-x-3 text-sm text-text-primary/70">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Cyber Security Lab, Daffodil Smart City, Birulia, Savar, Dhaka</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-text-primary/70">
              <Phone className="w-5 h-5 text-primary flex-shrink-0" />
              <span>+880 1234 567890</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-text-primary/70">
              <Mail className="w-5 h-5 text-primary flex-shrink-0" />
              <span>csc@daffodilvarsity.edu.bd</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-text-muted space-y-4 md:space-y-0">
          <div>
            &copy; 2026 Cyber Security Center, Daffodil International University. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* Subtle animated red scanline at very bottom */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary/10 via-primary to-primary/10 relative">
        <div className="absolute inset-0 bg-primary/20 blur-[2px] animate-pulse" />
      </div>
    </footer>
  );
}
