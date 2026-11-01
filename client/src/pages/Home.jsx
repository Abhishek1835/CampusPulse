import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Leaf,
  Calendar,
  Users,
  ArrowRight,
  Search,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EventCard } from '../components/events/EventCard';
import { ClubCard } from '../components/clubs/ClubCard';
import { EventCardSkeleton } from '../components/ui/Skeleton';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { eventService } from '../services/eventService';
import { clubService } from '../services/clubService';
import { CATEGORIES } from '../utils/constants';

export const Home = () => {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, clubsRes] = await Promise.all([
          eventService.getEvents({ limit: 6, sort: 'date_asc' }),
          clubService.getClubs({ limit: 4 })
        ]);
        if (eventsRes?.data?.events) {
          setFeaturedEvents(eventsRes.data.events);
        }
        if (clubsRes?.data) {
          setClubs(clubsRes.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/events');
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Nature Emblem Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-primary/25 text-xs sm:text-sm font-semibold text-text-main mb-6 shadow-warm-xs bg-primary-soft/60"
        >
          <Leaf className="w-4 h-4 text-primary" />
          <span>The Nature Glass Sanctuary for College Events & Clubs</span>
        </motion.div>

        {/* Main Headline with Serif Typography */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-text-main leading-[1.15]"
        >
          Discover, Register & <br className="hidden sm:inline" />
          <span className="text-primary italic">
            Lead Campus Events
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-text-muted max-w-3xl mx-auto leading-relaxed"
        >
          A serene space for hackathons, cultural festivals, tech symposiums, and sports meets.
          Seamless one-click registration authenticated with your University Seat Number (USN).
        </motion.p>

        {/* Hero Search Box */}
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleHeroSearch}
          className="mt-8 sm:mt-10 max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl glass-panel-strong border border-[var(--border-glass)] shadow-warm-lg"
        >
          <div className="relative w-full flex items-center">
            <Search className="w-5 h-5 text-text-muted absolute left-4" />
            <input
              type="text"
              placeholder="Search hackathons, workshops, music fests, clubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-transparent text-sm text-text-main placeholder-text-muted/60 focus:outline-none font-medium"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto flex-shrink-0"
          >
            Explore Events
          </Button>
        </motion.form>

        {/* Quick Category Chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto"
        >
          {CATEGORIES.slice(1).map((cat) => (
            <Link
              key={cat.id}
              to={`/events?category=${cat.id}`}
              className="px-3.5 py-1.5 rounded-full glass-panel border border-[var(--border-glass)] text-xs font-semibold text-text-muted hover:text-text-main hover:bg-primary-soft/60 transition-all hover:scale-105 shadow-warm-xs"
            >
              #{cat.label}
            </Link>
          ))}
        </motion.div>
      </section>

      {/* Stats Counter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl glass-panel border border-[var(--border-glass)] shadow-warm-md">
          <div className="text-center p-3">
            <p className="font-serif text-3xl sm:text-4xl font-bold text-primary">
              <AnimatedCounter target={25} suffix="+" />
            </p>
            <p className="text-xs font-semibold text-text-muted mt-1 uppercase tracking-wider">
              Active Events
            </p>
          </div>
          <div className="text-center p-3">
            <p className="font-serif text-3xl sm:text-4xl font-bold text-accent">
              <AnimatedCounter target={10} suffix="+" />
            </p>
            <p className="text-xs font-semibold text-text-muted mt-1 uppercase tracking-wider">
              College Clubs
            </p>
          </div>
          <div className="text-center p-3">
            <p className="font-serif text-3xl sm:text-4xl font-bold text-gold">
              <AnimatedCounter target={2500} suffix="+" />
            </p>
            <p className="text-xs font-semibold text-text-muted mt-1 uppercase tracking-wider">
              Students Registered
            </p>
          </div>
          <div className="text-center p-3">
            <p className="font-serif text-3xl sm:text-4xl font-bold text-[#4C6A49]">
              <AnimatedCounter target={350} prefix="₹" suffix="K+" />
            </p>
            <p className="text-xs font-semibold text-text-muted mt-1 uppercase tracking-wider">
              Prizes & Grants
            </p>
          </div>
        </div>
      </section>

      {/* Featured & Upcoming Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4" />
              <span>Happening Soon</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-main">
              Upcoming Campus Events
            </h2>
          </div>
          <Link
            to="/events"
            className="text-sm font-semibold text-primary hover:text-primary-hover hover:underline flex items-center gap-1"
          >
            View All Events ({featuredEvents.length}) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Clubs Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider mb-1">
              <Users className="w-4 h-4" />
              <span>Campus Communities</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-main">
              Spotlight College Clubs
            </h2>
          </div>
          <Link
            to="/clubs"
            className="text-sm font-semibold text-primary hover:text-primary-hover hover:underline flex items-center gap-1"
          >
            Explore All Clubs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {clubs.map((club) => (
            <ClubCard key={club._id} club={club} />
          ))}
        </div>
      </section>

      {/* Organizer Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl glass-panel-strong p-8 sm:p-12 border border-[var(--border-glass)] shadow-warm-lg">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              For Club Planners & Student Leaders
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl font-bold text-text-main">
              Organizing an event for your club?
            </h3>
            <p className="text-sm sm:text-base text-text-muted leading-relaxed">
              Create professional event listings, monitor live registrations, track
              attendance with barcode/checklist scanning, and export participant
              rosters in seconds.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Button
                variant="accent"
                size="md"
                onClick={() => navigate('/signup?role=organizer')}
              >
                Sign Up as Organizer
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/clubs')}
              >
                View Existing Clubs
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
