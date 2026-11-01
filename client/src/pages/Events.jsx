import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { eventService } from '../services/eventService';
import { clubService } from '../services/clubService';
import { EventCard } from '../components/events/EventCard';
import { EventRegistrationModal } from '../components/events/EventRegistrationModal';
import { EventCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CATEGORIES, MODES } from '../utils/constants';

export const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State from URL Params
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const clubParam = searchParams.get('club') || 'all';
  const modeParam = searchParams.get('mode') || 'all';
  const feeParam = searchParams.get('fee') || 'all';
  const sortParam = searchParams.get('sort') || 'date_asc';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(searchParam);
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Selected event for registration modal
  const [registeringEvent, setRegisteringEvent] = useState(null);

  // Fetch available clubs for filter dropdown
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await clubService.getClubs();
        if (res?.data) setClubs(res.data);
      } catch (err) {
        console.error('Error fetching clubs:', err);
      }
    };
    fetchClubs();
  }, []);

  // Fetch events when query params change
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params = {
          search: searchParam,
          category: categoryParam,
          club: clubParam,
          mode: modeParam,
          fee: feeParam,
          sort: sortParam,
          page: pageParam,
          limit: 9
        };
        const res = await eventService.getEvents(params);
        if (res?.data) {
          setEvents(res.data.events || []);
          setPagination(res.data.pagination || { total: 0, totalPages: 1, page: 1 });
        }
      } catch (err) {
        console.error('Error loading events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchParam, categoryParam, clubParam, modeParam, feeParam, sortParam, pageParam]);

  // Update query params helper
  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    searchParam ||
    categoryParam !== 'all' ||
    clubParam !== 'all' ||
    modeParam !== 'all' ||
    feeParam !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-main">
            Explore Events
          </h1>
          <p className="text-sm text-text-muted mt-1.5">
            Discover workshops, hackathons, seminars, cultural nights, and athletic championships.
          </p>
        </div>

        {/* Filter Toggle Button on Mobile */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
            icon={SlidersHorizontal}
          >
            Filters {hasActiveFilters && '•'}
          </Button>
        </div>
      </div>

      {/* Search & Filter Controls Panel */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-[var(--border-glass)] shadow-warm-sm space-y-4">
        {/* Search Bar + Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by event title, tags, description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full glass-input pl-10 pr-4 py-2.5 text-sm rounded-xl font-medium"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateParam('search', '');
                }}
                className="absolute right-3 top-3 text-text-muted hover:text-text-main"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          <div className="w-full sm:w-52">
            <Select
              options={[
                { id: 'date_asc', label: 'Date: Upcoming First' },
                { id: 'date_desc', label: 'Date: Furthest First' },
                { id: 'newest', label: 'Recently Added' }
              ]}
              value={sortParam}
              onChange={(e) => updateParam('sort', e.target.value)}
            />
          </div>
        </div>

        {/* Filters Grid */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-[var(--border-glass)] ${
            showFilters ? 'block' : 'hidden md:grid'
          }`}
        >
          {/* Category Filter */}
          <Select
            label="Category"
            options={CATEGORIES}
            value={categoryParam}
            onChange={(e) => updateParam('category', e.target.value)}
          />

          {/* Club Filter */}
          <Select
            label="Club / Organizer"
            options={[
              { id: 'all', label: 'All Clubs' },
              ...clubs.map((c) => ({ id: c._id, label: c.name }))
            ]}
            value={clubParam}
            onChange={(e) => updateParam('club', e.target.value)}
          />

          {/* Mode Filter */}
          <Select
            label="Event Mode"
            options={MODES}
            value={modeParam}
            onChange={(e) => updateParam('mode', e.target.value)}
          />

          {/* Fee Filter */}
          <Select
            label="Pricing"
            options={[
              { id: 'all', label: 'All Pricing' },
              { id: 'free', label: 'Free Events Only' },
              { id: 'paid', label: 'Paid Events' }
            ]}
            value={feeParam}
            onChange={(e) => updateParam('fee', e.target.value)}
          />
        </div>

        {/* Active Filters Clear Strip */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs pt-2 text-text-muted">
            <span>Filtering results</span>
            <button
              onClick={handleClearFilters}
              className="text-primary font-semibold hover:underline"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No events found"
          description="We couldn't find any events matching your selected search or filters. Try adjusting your filters or search keywords."
          actionLabel="Reset All Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onRegisterClick={(ev) => setRegisteringEvent(ev)}
            />
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="secondary"
            size="sm"
            disabled={pageParam <= 1}
            onClick={() => updateParam('page', String(pageParam - 1))}
            icon={ChevronLeft}
          >
            Previous
          </Button>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl glass-panel text-text-main border border-[var(--border-glass)]">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={pageParam >= pagination.totalPages}
            onClick={() => updateParam('page', String(pageParam + 1))}
            icon={ChevronRight}
          >
            Next
          </Button>
        </div>
      )}

      {/* Quick Registration Modal */}
      {registeringEvent && (
        <EventRegistrationModal
          isOpen={!!registeringEvent}
          onClose={() => setRegisteringEvent(null)}
          event={registeringEvent}
          onSuccess={() => {
            // Re-fetch events to update live counts
            const params = {
              search: searchParam,
              category: categoryParam,
              club: clubParam,
              mode: modeParam,
              fee: feeParam,
              sort: sortParam,
              page: pageParam,
              limit: 9
            };
            eventService.getEvents(params).then((res) => {
              if (res?.data?.events) setEvents(res.data.events);
            });
          }}
        />
      )}
    </div>
  );
};
