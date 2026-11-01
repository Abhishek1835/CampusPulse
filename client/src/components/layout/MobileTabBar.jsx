import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Calendar, Users, BookmarkCheck, User, LayoutDashboard } from 'lucide-react';

export const MobileTabBar = () => {
  const { isOrganizer, isAuthenticated } = useAuth();

  const tabItemClasses = ({ isActive }) =>
    `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[11px] font-medium transition-all ${
      isActive
        ? 'text-primary bg-primary-soft/60 font-semibold shadow-xs'
        : 'text-text-muted hover:text-text-main'
    }`;

  return (
    <div className="md:hidden fixed bottom-3 left-4 right-4 z-40">
      <div className="glass-panel-strong backdrop-blur-2xl rounded-2xl shadow-warm-lg border border-[var(--border-glass)] flex items-center justify-around px-2 py-1">
        <NavLink to="/" end className={tabItemClasses}>
          <Home className="w-5 h-5 mb-0.5 stroke-[1.75]" />
          <span>Home</span>
        </NavLink>

        <NavLink to="/events" className={tabItemClasses}>
          <Calendar className="w-5 h-5 mb-0.5 stroke-[1.75]" />
          <span>Events</span>
        </NavLink>

        <NavLink to="/clubs" className={tabItemClasses}>
          <Users className="w-5 h-5 mb-0.5 stroke-[1.75]" />
          <span>Clubs</span>
        </NavLink>

        {isOrganizer ? (
          <NavLink to="/organizer/dashboard" className={tabItemClasses}>
            <LayoutDashboard className="w-5 h-5 mb-0.5 stroke-[1.75]" />
            <span>Console</span>
          </NavLink>
        ) : (
          <NavLink to="/my-events" className={tabItemClasses}>
            <BookmarkCheck className="w-5 h-5 mb-0.5 stroke-[1.75]" />
            <span>My Events</span>
          </NavLink>
        )}

        <NavLink to={isAuthenticated ? '/profile' : '/login'} className={tabItemClasses}>
          <User className="w-5 h-5 mb-0.5 stroke-[1.75]" />
          <span>{isAuthenticated ? 'Profile' : 'Login'}</span>
        </NavLink>
      </div>
    </div>
  );
};
