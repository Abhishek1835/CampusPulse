import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import {
  Leaf,
  Sun,
  Moon,
  Calendar,
  Users,
  BookmarkCheck,
  LayoutDashboard,
  LogOut,
  User,
  PlusCircle,
  Menu,
  X
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isOrganizer, isStudent, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-3 z-40 w-full px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto rounded-2xl glass-panel-strong border border-[var(--border-glass)] shadow-warm-md h-16 px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo with Botanical Emblem */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-primary text-cream flex items-center justify-center shadow-warm-sm group-hover:scale-105 transition-transform duration-200">
            <Leaf className="w-5 h-5 text-[#F6F0E4]" />
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-tight text-text-main">
              CampusPulse
            </span>
            <span className="hidden sm:inline-block text-[10.5px] uppercase font-bold tracking-wider px-2 py-0.5 ml-2 rounded-full bg-primary-soft text-text-main border border-primary/20">
              BMSCE Hub
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          <Link
            to="/events"
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              isActive('/events')
                ? 'bg-primary-soft text-text-main font-semibold shadow-xs'
                : 'text-text-muted hover:text-text-main hover:bg-primary-soft/50'
            }`}
          >
            Events
          </Link>
          <Link
            to="/clubs"
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              isActive('/clubs')
                ? 'bg-primary-soft text-text-main font-semibold shadow-xs'
                : 'text-text-muted hover:text-text-main hover:bg-primary-soft/50'
            }`}
          >
            Clubs
          </Link>

          {isStudent && (
            <>
              <Link
                to="/my-events"
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive('/my-events')
                    ? 'bg-primary-soft text-text-main font-semibold shadow-xs'
                    : 'text-text-muted hover:text-text-main hover:bg-primary-soft/50'
                }`}
              >
                My Events
              </Link>
              <Link
                to="/checkin"
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive('/checkin')
                    ? 'bg-primary text-cream font-semibold shadow-xs'
                    : 'text-primary font-semibold hover:bg-primary-soft/60'
                }`}
              >
                Scan Check-In
              </Link>
              <Link
                to="/my-certificates"
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive('/my-certificates')
                    ? 'bg-gold/25 text-text-main font-semibold shadow-xs'
                    : 'text-accent font-semibold hover:bg-gold/15'
                }`}
              >
                Certificates
              </Link>
            </>
          )}

          <Link
            to="/verify"
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              location.pathname.startsWith('/verify')
                ? 'bg-primary-soft text-text-main font-semibold shadow-xs'
                : 'text-text-muted hover:text-text-main hover:bg-primary-soft/50'
            }`}
          >
            Verify
          </Link>

          {isOrganizer && (
            <Link
              to="/organizer/dashboard"
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                location.pathname.startsWith('/organizer')
                  ? 'bg-primary-soft text-text-main font-semibold shadow-xs'
                : 'text-text-muted hover:text-text-main hover:bg-primary-soft/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-primary" />
              Organizer Console
            </Link>
          )}
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-bg-soft/70 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-gold hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-5 h-5 text-primary hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-[var(--border-glass)] hover:border-primary/40 bg-surface-glass transition-all"
              >
                <div className="text-left hidden sm:block mr-1">
                  <p className="text-xs font-bold text-text-main leading-tight">
                    {user?.name}
                  </p>
                  <p className="text-[10px] text-text-muted font-mono">
                    {user?.usn}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-primary-soft text-text-main border border-primary/20 flex items-center justify-center text-xs font-bold overflow-hidden shadow-xs">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0) || 'U'
                  )}
                </div>
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel-strong shadow-warm-lg py-2 z-50 border border-[var(--border-glass)]">
                    <div className="px-4 py-2 border-b border-[var(--border-glass)]">
                      <p className="text-xs font-bold text-text-main truncate">
                        {user?.name}
                      </p>
                      <p className="text-[11px] text-text-muted font-mono truncate">
                        {user?.usn} •{' '}
                        <span className="capitalize font-semibold text-primary">
                          {user?.role}
                        </span>
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-text-main hover:bg-primary-soft transition-colors"
                    >
                      <User className="w-4 h-4 text-primary" />
                      My Profile
                    </Link>

                    {isStudent && (
                      <Link
                        to="/my-events"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-text-main hover:bg-primary-soft transition-colors"
                      >
                        <BookmarkCheck className="w-4 h-4 text-primary" />
                        My Registered Events
                      </Link>
                    )}

                    {isOrganizer && (
                      <>
                        <Link
                          to="/organizer/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-text-main hover:bg-primary-soft transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-primary" />
                          Organizer Console
                        </Link>
                        <Link
                          to="/organizer/events/new"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-text-main hover:bg-primary-soft transition-colors"
                        >
                          <PlusCircle className="w-4 h-4 text-primary" />
                          Create New Event
                        </Link>
                      </>
                    )}

                    <div className="border-t border-[var(--border-glass)] my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Log In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </Button>
            </div>
          )}

          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-bg-soft/70 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-7xl mx-auto mt-2 rounded-2xl glass-panel-strong border border-[var(--border-glass)] px-5 py-4 space-y-2 shadow-warm-lg">
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-text-main hover:bg-primary-soft"
          >
            Events Discovery
          </Link>
          <Link
            to="/clubs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-text-main hover:bg-primary-soft"
          >
            College Clubs
          </Link>
          {isStudent && (
            <>
              <Link
                to="/my-events"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-text-main hover:bg-primary-soft"
              >
                My Registered Events
              </Link>
              <Link
                to="/checkin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-primary hover:bg-primary-soft"
              >
                Scan Check-In
              </Link>
              <Link
                to="/my-certificates"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-accent hover:bg-primary-soft"
              >
                My Certificates
              </Link>
            </>
          )}
          <Link
            to="/verify"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-text-muted hover:bg-primary-soft"
          >
            Verify Credential
          </Link>
          {isOrganizer && (
            <Link
              to="/organizer/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-medium text-text-main hover:bg-primary-soft"
            >
              Organizer Console
            </Link>
          )}
          {!isAuthenticated && (
            <div className="pt-3 flex flex-col gap-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
              >
                Log In with USN
              </Button>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/signup');
                }}
              >
                Create Account
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
