import React, { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  Building2,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Leaf,
  PenTool,
  Settings
} from 'lucide-react';

export const OrganizerLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinks = [
    {
      to: '/organizer/dashboard',
      label: 'Overview & Analytics',
      icon: LayoutDashboard,
      end: true
    },
    {
      to: '/organizer/events',
      label: 'Club Events',
      icon: CalendarDays,
      end: true
    },
    {
      to: '/organizer/events/new',
      label: 'Create New Event',
      icon: PlusCircle,
      end: true
    },
    {
      to: '/organizer/club',
      label: 'My Club Profile',
      icon: Building2,
      end: true
    },
    {
      to: '/organizer/signatories',
      label: 'Signatories',
      icon: PenTool,
      end: true
    },
    {
      to: '/organizer/settings',
      label: 'College Settings',
      icon: Settings,
      end: true
    }
  ];

  // Breadcrumbs calculation
  const pathParts = location.pathname.split('/').filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col md:flex-row transition-colors duration-300">
      {/* Mobile Sidebar Toggle Header */}
      <div className="md:hidden glass-panel px-4 py-3 flex items-center justify-between border-b border-[var(--border-glass)] sticky top-20 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-xl bg-primary-soft text-text-main border border-primary/20"
            aria-label="Toggle organizer navigation"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-serif text-sm font-bold text-text-main">
            Organizer Console
          </span>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-soft text-text-main font-semibold truncate max-w-[150px] border border-primary/20">
          {user?.club?.name || 'Club Organizer'}
        </span>
      </div>

      {/* Organizer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 md:sticky md:top-20 md:h-[calc(100vh-5.5rem)] glass-panel border-r border-[var(--border-glass)] flex flex-col transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Club Profile Card in Sidebar */}
        <div className="p-5 border-b border-[var(--border-glass)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-soft border border-primary/20 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {user?.club?.logo ? (
                <img
                  src={user.club.logo}
                  alt={user.club.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Leaf className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-serif text-xs font-bold text-text-main truncate">
                {user?.club?.name || 'My Club'}
              </h3>
              <p className="text-[11px] text-primary font-medium truncate">
                {user?.designation || 'Club Organizer'}
              </p>
              <p className="text-[10px] text-text-muted font-mono truncate">
                USN: {user?.usn}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-[#F6F0E4] shadow-warm-sm font-semibold'
                      : 'text-text-muted hover:text-text-main hover:bg-primary-soft/50'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0 stroke-[1.75]" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Switch back to Student View */}
        <div className="p-4 border-t border-[var(--border-glass)]">
          <Link
            to="/events"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-main hover:bg-primary-soft/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Public Event Portal
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-text-muted mb-6">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="capitalize text-text-main font-semibold">
            {pathParts[pathParts.length - 1] || 'Dashboard'}
          </span>
        </div>

        <Outlet />
      </main>
    </div>
  );
};
