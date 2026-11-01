import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { eventService } from '../services/eventService';
import { registrationService } from '../services/registrationService';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Countdown } from '../components/ui/Countdown';
import { EventRegistrationModal } from '../components/events/EventRegistrationModal';
import { Modal } from '../components/ui/Modal';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Share2,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Tag,
  Video
} from 'lucide-react';

export const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStudent, isAuthenticated } = useAuth();

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchEvent = async () => {
    try {
      const res = await eventService.getEventById(id);
      if (res?.data) {
        setEventData(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Event not found');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Event link copied to clipboard! 📋');
  };

  const handleCancelRegistration = async () => {
    setCancelling(true);
    try {
      await registrationService.cancelRegistration(id);
      toast.success('Your registration has been cancelled');
      setCancelModalOpen(false);
      fetchEvent();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel registration');
    } finally {
      setCancelling(false);
    }
  };

  if (loading || !eventData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { event, registeredCount, seatsLeft, isFull, isPastDeadline, userRegistration } =
    eventData;

  const eventDate = new Date(event.date);
  const isPast = new Date() > eventDate;
  const isRegistered = !!userRegistration;
  const capacityPercent =
    event.capacity > 0
      ? Math.min(100, Math.round((registeredCount / event.capacity) * 100))
      : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <Link
        to="/events"
        className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all events
      </Link>

      {/* Hero Poster Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-[var(--border-glass)] shadow-warm-lg">
        <div className="relative h-64 sm:h-96 w-full bg-bg-soft">
          <img
            src={
              event.poster ||
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80'
            }
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          {/* Top Floating Actions */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-2xl glass-panel-strong backdrop-blur-md bg-white/70 text-text-main hover:bg-white/90 border border-white/50 shadow-warm-sm transition-all"
              title="Share event link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Banner bottom title and tags */}
          <div className="absolute bottom-6 left-6 right-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={event.category} size="sm">
                {event.category}
              </Badge>
              <Badge variant={event.fee === 0 ? 'free' : 'paid'} size="sm">
                {event.fee === 0 ? 'Free Entry' : `Fee: ₹${event.fee}`}
              </Badge>
              <Badge variant="default" size="sm" className="bg-white/80 text-text-main border-white/60">
                Mode: {event.mode}
              </Badge>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-cream leading-tight">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Action Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Key Quick Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-5 rounded-3xl glass-panel border border-[var(--border-glass)] shadow-warm-xs">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Date
              </span>
              <p className="text-sm font-bold text-text-main">
                {eventDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-accent" /> Timing
              </span>
              <p className="text-sm font-bold text-text-main">
                {event.startTime} - {event.endTime}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gold" /> Venue
              </span>
              <p className="text-sm font-bold text-text-main truncate">
                {event.venue}
              </p>
            </div>

            {event.mode !== 'offline' && event.meetingLink && (
              <div className="col-span-2 sm:col-span-3 pt-3 border-t border-[var(--border-glass)] flex items-center gap-2 text-xs">
                <Video className="w-4 h-4 text-primary" />
                <span className="font-semibold text-text-main">
                  Virtual Meeting Link:
                </span>
                <a
                  href={event.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary font-mono underline truncate"
                >
                  {event.meetingLink}
                </a>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-glass)] shadow-warm-xs space-y-4">
            <h2 className="font-serif text-xl font-bold text-text-main">
              About This Event
            </h2>
            <div className="text-sm text-text-main leading-relaxed whitespace-pre-line space-y-3 font-normal">
              {event.description}
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="pt-4 border-t border-[var(--border-glass)] flex flex-wrap gap-2 items-center">
                <Tag className="w-3.5 h-3.5 text-text-muted mr-1" />
                {event.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-xl bg-bg-soft text-text-muted border border-[var(--border-glass)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Rules & Guidelines */}
          {event.rules && event.rules.length > 0 && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-glass)] shadow-warm-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-text-main flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> Rules & Guidelines
              </h3>
              <ul className="space-y-2.5 text-sm text-text-muted list-disc list-inside">
                {event.rules.map((rule, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prizes & Incentives */}
          {event.prizes && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-glass)] space-y-3 bg-gold/10">
              <h3 className="font-serif text-lg font-bold text-gold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-gold" /> Prizes & Recognition
              </h3>
              <p className="text-sm text-text-main font-medium">
                {event.prizes}
              </p>
            </div>
          )}

          {/* Eligibility */}
          {event.eligibility && (
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-[var(--border-glass)] space-y-2">
              <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-text-muted">
                Eligibility
              </h4>
              <p className="text-sm text-text-main font-medium">
                {event.eligibility}
              </p>
            </div>
          )}

          {/* Contact Persons */}
          {event.contactPersons && event.contactPersons.length > 0 && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-glass)] space-y-4 shadow-warm-xs">
              <h3 className="font-serif text-base font-bold text-text-main">
                Event Coordinators & Helpdesk
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {event.contactPersons.map((person, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-bg-soft/70 border border-[var(--border-glass)] space-y-2 text-xs"
                  >
                    <p className="font-serif font-bold text-text-main text-sm">
                      {person.name}
                    </p>
                    <a
                      href={`tel:${person.phone}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" /> {person.phone}
                    </a>
                    <a
                      href={`mailto:${person.email}`}
                      className="flex items-center gap-2 text-text-muted hover:text-text-main truncate"
                    >
                      <Mail className="w-3.5 h-3.5" /> {person.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Host Club Card & Registration Box */}
        <div className="space-y-6">
          {/* Registration Action Card */}
          <div className="glass-panel-strong p-6 rounded-3xl border border-[var(--border-glass)] shadow-warm-lg space-y-5">
            {/* Event Countdown */}
            <div className="space-y-2 text-center">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Event Starts In
              </span>
              <div className="flex justify-center">
                <Countdown targetDate={event.date} />
              </div>
            </div>

            {/* Capacity Status */}
            {event.capacity > 0 && (
              <div className="space-y-1.5 pt-4 border-t border-[var(--border-glass)]">
                <div className="flex justify-between text-xs font-semibold text-text-main">
                  <span>Seats Booked</span>
                  <span>
                    {registeredCount} / {event.capacity} ({capacityPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-bg-soft rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      capacityPercent >= 90
                        ? 'bg-danger'
                        : capacityPercent >= 70
                        ? 'bg-gold'
                        : 'bg-primary'
                    }`}
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-text-muted text-right">
                  {seatsLeft > 0 ? `${seatsLeft} seats left` : 'Sold Out'}
                </p>
              </div>
            )}

            {/* Registration Deadline Warning */}
            <div className="text-xs text-text-muted pt-2 border-t border-[var(--border-glass)]">
              <p>
                Registration Deadline:{' '}
                <strong className="text-text-main">
                  {new Date(event.registrationDeadline).toLocaleDateString()}
                </strong>
              </p>
            </div>

            {/* Action Buttons based on User & Event Status */}
            {isRegistered ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-primary-soft/80 border border-primary/30 text-text-main text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-bold text-text-main">You are registered for this event!</p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Registration ID: #{userRegistration._id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>

                {!isPastDeadline && (
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full"
                    onClick={() => setCancelModalOpen(true)}
                  >
                    Cancel Registration
                  </Button>
                )}
              </div>
            ) : isPast ? (
              <div className="p-4 rounded-2xl bg-bg-soft text-center text-xs text-text-muted font-semibold">
                This event has already concluded.
              </div>
            ) : isFull ? (
              <div className="p-4 rounded-2xl bg-danger/10 border border-danger/20 text-center text-xs text-danger font-semibold">
                Event has reached maximum seat capacity.
              </div>
            ) : isPastDeadline ? (
              <div className="p-4 rounded-2xl bg-gold/15 border border-gold/30 text-center text-xs text-text-main font-semibold">
                Registration deadline has expired.
              </div>
            ) : !isAuthenticated ? (
              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  Sign In with USN to Register
                </Button>
                <p className="text-[11px] text-text-muted text-center">
                  Students can register in one click
                </p>
              </div>
            ) : isStudent ? (
              <Button
                variant="accent"
                size="lg"
                className="w-full"
                onClick={() => setRegistrationModalOpen(true)}
              >
                Register Now
              </Button>
            ) : (
              <div className="p-3 rounded-2xl bg-primary-soft/50 text-center text-xs text-text-main font-medium">
                Organizer accounts manage events via Dashboard
              </div>
            )}
          </div>

          {/* Hosting Club Info Card */}
          {event.club && (
            <div className="glass-panel p-6 rounded-3xl border border-[var(--border-glass)] space-y-4 shadow-warm-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Organized By
              </span>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden glass-panel border border-[var(--border-glass)] bg-bg-soft flex-shrink-0">
                  <img
                    src={event.club.logo}
                    alt={event.club.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-text-main">
                    {event.club.name}
                  </h4>
                  <p className="text-xs text-primary capitalize font-medium">
                    {event.club.category} Club
                  </p>
                </div>
              </div>

              {event.club.tagline && (
                <p className="text-xs italic text-text-muted">
                  "{event.club.tagline}"
                </p>
              )}

              <Link
                to={`/clubs/${event.club.slug}`}
                className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-semibold text-text-main bg-primary-soft hover:bg-primary-soft/80 border border-primary/20 transition-colors"
              >
                View Club Profile & All Events
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      {registrationModalOpen && (
        <EventRegistrationModal
          isOpen={registrationModalOpen}
          onClose={() => setRegistrationModalOpen(false)}
          event={event}
          onSuccess={() => fetchEvent()}
        />
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Registration"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted">
            Are you sure you want to cancel your registration for{' '}
            <strong className="text-text-main">{event.title}</strong>? Your seat will be freed up for other students.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-glass)]">
            <Button
              variant="ghost"
              onClick={() => setCancelModalOpen(false)}
              disabled={cancelling}
            >
              Keep My Seat
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelRegistration}
              loading={cancelling}
            >
              Confirm Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
