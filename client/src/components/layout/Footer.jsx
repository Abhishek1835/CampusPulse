import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-[var(--border-glass)] glass-panel py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4 md:col-span-2">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-cream flex items-center justify-center shadow-warm-xs">
              <Leaf className="w-4 h-4 text-[#F6F0E4]" />
            </div>
            <span className="font-serif text-lg font-bold text-text-main">
              CampusPulse
            </span>
          </Link>
          <p className="text-sm text-text-muted max-w-sm leading-relaxed">
            A calm, unified campus event discovery and organization sanctuary.
            Browse workshops, club meets, cultural festivals, and hackathons with ease.
          </p>
        </div>

        <div>
          <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-text-main mb-3">
            Quick Navigation
          </h4>
          <ul className="space-y-2 text-sm text-text-muted">
            <li>
              <Link to="/events" className="hover:text-primary transition-colors">
                Explore Events
              </Link>
            </li>
            <li>
              <Link to="/clubs" className="hover:text-primary transition-colors">
                Campus Clubs
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-primary transition-colors">
                Student & Organizer Login
              </Link>
            </li>
            <li>
              <Link to="/signup" className="hover:text-primary transition-colors">
                Create Account
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-text-main mb-3">
            Categories
          </h4>
          <ul className="space-y-2 text-sm text-text-muted">
            <li>
              <Link to="/events?category=technical" className="hover:text-primary transition-colors">
                Technical & Coding
              </Link>
            </li>
            <li>
              <Link to="/events?category=hackathon" className="hover:text-primary transition-colors">
                Campus Hackathons
              </Link>
            </li>
            <li>
              <Link to="/events?category=cultural" className="hover:text-primary transition-colors">
                Cultural & Performing Arts
              </Link>
            </li>
            <li>
              <Link to="/events?category=sports" className="hover:text-primary transition-colors">
                Sports & Tournaments
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-[var(--border-glass)] flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted">
        <p>© {new Date().getFullYear()} CampusPulse Platform. Designed for BMS College of Engineering (BMSCE).</p>
        <p className="flex items-center gap-1.5 mt-2 sm:mt-0">
          Crafted with care in Warm Cream & Nature Glass
        </p>
      </div>
    </footer>
  );
};
