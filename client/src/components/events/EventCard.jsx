import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const EventCard = ({ event, onRegisterClick }) => {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const isFree = !event.fee || event.fee === 0;
  const isPast = new Date() > eventDate;
  const isDeadlinePassed = new Date() > new Date(event.registrationDeadline);
  const isFull = event.capacity > 0 && event.registeredCount >= event.capacity;

  const capacityPercentage =
    event.capacity > 0
      ? Math.min(100, Math.round((event.registeredCount / event.capacity) * 100))
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="glass-panel rounded-3xl overflow-hidden flex flex-col h-full border border-[var(--border-glass)] shadow-warm-sm hover:shadow-warm-md hover:border-primary/40 transition-all duration-300"
    >
      {/* Poster Image with Warm Overlay Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-bg-soft">
        <img
          src={
            event.poster ||
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'
          }
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/15" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge variant={event.category} size="xs">
            {event.category}
          </Badge>
          {event.mode && (
            <Badge variant="default" size="xs" className="backdrop-blur-md bg-white/70 text-text-main border-white/50">
              {event.mode}
            </Badge>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <Badge variant={isFree ? 'free' : 'paid'} size="xs">
            {isFree ? 'FREE' : `₹${event.fee}`}
          </Badge>
        </div>

        {/* Club Mini Badge on bottom of poster */}
        {event.club && (
          <Link
            to={`/clubs/${event.club.slug}`}
            className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs text-text-main backdrop-blur-md bg-[#FFFDF5]/85 border border-white/60 hover:bg-[#FFFDF5] transition-colors shadow-warm-xs"
          >
            {event.club.logo ? (
              <img
                src={event.club.logo}
                alt={event.club.name}
                className="w-4 h-4 rounded-full object-cover"
              />
            ) : null}
            <span className="font-semibold truncate max-w-[150px]">
              {event.club.name}
            </span>
          </Link>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <Link to={`/events/${event._id}`}>
            <h3 className="font-serif text-base sm:text-lg font-bold text-text-main line-clamp-2 hover:text-primary transition-colors">
              {event.title}
            </h3>
          </Link>
          <p className="text-xs text-text-muted line-clamp-2 mt-1 leading-relaxed">
            {event.shortDescription || event.description}
          </p>
        </div>

        {/* Meta Info: Date, Time, Venue */}
        <div className="space-y-1.5 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span>{formattedDate} • {event.startTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Capacity Progress Bar in Sage to Honey */}
        {event.capacity > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-medium text-text-muted">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-primary" />
                Capacity
              </span>
              <span>
                {event.registeredCount || 0} / {event.capacity} seats
              </span>
            </div>
            <div className="w-full h-1.5 bg-bg-soft rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  capacityPercentage >= 90
                    ? 'bg-danger'
                    : capacityPercentage >= 70
                    ? 'bg-gold'
                    : 'bg-primary'
                }`}
                style={{ width: `${capacityPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 border-t border-[var(--border-glass)] flex items-center justify-between gap-2">
          <Link
            to={`/events/${event._id}`}
            className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
          >
            Details <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {isPast ? (
            <span className="text-xs font-semibold text-text-muted">Event Ended</span>
          ) : isFull ? (
            <span className="text-xs font-semibold text-danger bg-danger/10 px-2 py-1 rounded-lg">
              Full House
            </span>
          ) : isDeadlinePassed ? (
            <span className="text-xs font-semibold text-warning bg-warning/10 px-2 py-1 rounded-lg">
              Registration Closed
            </span>
          ) : (
            <Button
              variant="accent"
              size="sm"
              onClick={() => (onRegisterClick ? onRegisterClick(event) : null)}
            >
              <Link to={`/events/${event._id}`}>Register</Link>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
