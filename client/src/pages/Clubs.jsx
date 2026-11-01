import React, { useState, useEffect } from 'react';
import { clubService } from '../services/clubService';
import { ClubCard } from '../components/clubs/ClubCard';
import { EmptyState } from '../components/ui/EmptyState';
import { CLUB_CATEGORIES } from '../utils/constants';
import { Search, Users, Leaf } from 'lucide-react';

export const Clubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const res = await clubService.getClubs({
        search: search.trim() || undefined,
        category: category !== 'all' ? category : undefined
      });
      if (res?.data) {
        setClubs(res.data);
      }
    } catch (err) {
      console.error('Error fetching clubs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchClubs();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full glass-panel text-xs font-semibold text-text-main border border-primary/20 bg-primary-soft/60">
          <Leaf className="w-3.5 h-3.5 text-primary" />
          <span>Campus Student Chapters</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-main">
          College Clubs & Guilds
        </h1>
        <p className="text-sm text-text-muted">
          Explore technical coding societies, cultural troops, sports teams, and
          entrepreneurship incubators.
        </p>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="glass-panel p-4 rounded-3xl border border-[var(--border-glass)] shadow-warm-sm space-y-4 max-w-3xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search clubs by name, mission or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input pl-10 pr-4 py-2.5 text-sm rounded-xl font-medium"
          />
        </form>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-[var(--border-glass)]">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              category === 'all'
                ? 'bg-primary text-[#F6F0E4] shadow-warm-xs'
                : 'glass-panel text-text-muted hover:text-text-main hover:bg-primary-soft/50'
            }`}
          >
            All Clubs
          </button>
          {CLUB_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                category === cat.id
                  ? 'bg-primary text-[#F6F0E4] shadow-warm-xs'
                  : 'glass-panel text-text-muted hover:text-text-main hover:bg-primary-soft/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clubs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel rounded-3xl p-6 h-64 animate-pulse bg-bg-soft/50 border border-[var(--border-glass)]" />
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clubs found"
          description="We couldn't find any clubs matching your current search."
          actionLabel="View All Clubs"
          onAction={() => {
            setSearch('');
            setCategory('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <ClubCard key={club._id} club={club} />
          ))}
        </div>
      )}
    </div>
  );
};
