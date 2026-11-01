import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registrationService } from '../services/registrationService';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import toast from 'react-hot-toast';
import {
  Ticket,
  Clock,
  MapPin,
  QrCode,
  ArrowRight,
  Award,
  CheckCircle2
} from 'lucide-react';

export const MyEvents = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', 'cancelled'
  const [selectedForCancel, setSelectedForCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await registrationService.getMyRegistrations();
      if (res?.data) {
        setRegistrations(res.data);
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleConfirmCancel = async () => {
    if (!selectedForCancel) return;
    setCancelling(true);
    try {
      await registrationService.cancelRegistration(selectedForCancel.event._id);
      toast.success('Registration cancelled successfully');
      setSelectedForCancel(null);
      fetchRegistrations();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel registration');
    } finally {
      setCancelling(false);
    }
  };

  const now = new Date();

  // Filter registrations by status and date
  const upcomingRegistrations = registrations.filter(
    (r) =>
      r.status === 'registered' &&
      r.event &&
      new Date(r.event.date) >= now
  );

  const pastRegistrations = registrations.filter(
    (r) =>
      (r.status === 'attended' ||
        (r.status === 'registered' && r.event && new Date(r.event.date) < now))
  );

  const cancelledRegistrations = registrations.filter(
    (r) => r.status === 'cancelled'
  );

  let currentList = [];
  if (activeTab === 'upcoming') currentList = upcomingRegistrations;
  else if (activeTab === 'past') currentList = pastRegistrations;
  else if (activeTab === 'cancelled') currentList = cancelledRegistrations;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-bold text-text-main flex items-center gap-2.5">
          <Ticket className="w-8 h-8 text-primary" /> My Event Registrations
        </h1>
        <p className="text-sm text-text-muted">
          Access your digital admission passes, event schedules, and team roster.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[var(--border-glass)] pb-2">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`text-xs sm:text-sm font-bold pb-2 transition-all ${
            activeTab === 'upcoming'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          Upcoming ({upcomingRegistrations.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`text-xs sm:text-sm font-bold pb-2 transition-all ${
            activeTab === 'past'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          Past & Attended ({pastRegistrations.length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`text-xs sm:text-sm font-bold pb-2 transition-all ${
            activeTab === 'cancelled'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          Cancelled ({cancelledRegistrations.length})
        </button>
      </div>

      {/* Registrations List (Ticket Cards) */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="glass-panel h-40 rounded-3xl animate-pulse bg-bg-soft/50 border border-[var(--border-glass)]" />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title={`No ${activeTab} registrations`}
          description={
            activeTab === 'upcoming'
              ? "You haven't registered for any upcoming events yet. Browse events and grab your ticket!"
              : `No registrations found under ${activeTab}.`
          }
          actionLabel={activeTab === 'upcoming' ? 'Browse Events' : undefined}
          onAction={() => window.location.assign('/events')}
        />
      ) : (
        <div className="space-y-6">
          {currentList.map((reg) => {
            if (!reg.event) return null;
            const eventDate = new Date(reg.event.date);
            const isDeadlinePassed =
              new Date() > new Date(reg.event.registrationDeadline);
            const regIdShort = reg._id.slice(-6).toUpperCase();

            return (
              <div
                key={reg._id}
                className="glass-panel rounded-3xl overflow-hidden border border-[var(--border-glass)] shadow-warm-sm hover:shadow-warm-md flex flex-col md:flex-row transition-all"
              >
                {/* Left Ticket Stub (Date & Category) */}
                <div className="p-6 md:w-56 bg-primary-soft/40 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[var(--border-glass)]">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-primary font-bold">
                      Ticket Pass
                    </span>
                    <p className="font-serif text-3xl font-bold text-text-main mt-1">
                      {eventDate.toLocaleDateString('en-US', { day: '2-digit' })}
                    </p>
                    <p className="text-xs uppercase font-bold text-text-muted">
                      {eventDate.toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="pt-4 md:pt-0">
                    <Badge variant={reg.event.category} size="xs">
                      {reg.event.category}
                    </Badge>
                  </div>
                </div>

                {/* Center Content */}
                <div className="p-6 flex-1 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link to={`/events/${reg.event._id}`}>
                        <h3 className="font-serif text-lg font-bold text-text-main hover:text-primary transition-colors">
                          {reg.event.title}
                        </h3>
                      </Link>
                      <Badge
                        variant={
                          reg.status === 'attended'
                            ? 'success'
                            : reg.status === 'cancelled'
                            ? 'danger'
                            : 'primary'
                        }
                        size="xs"
                      >
                        {reg.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {reg.event.startTime} - {reg.event.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-accent" />
                        {reg.event.venue}
                      </span>
                    </div>

                    {/* Team Details if team event */}
                    {reg.teamName && (
                      <div className="p-2.5 rounded-xl bg-bg-soft/70 border border-[var(--border-glass)] text-xs text-text-main">
                        <p className="font-semibold text-primary">
                          Team: {reg.teamName}
                        </p>
                        {reg.teamMembers && reg.teamMembers.length > 0 && (
                          <p className="text-[11px] text-text-muted mt-0.5">
                            Members:{' '}
                            {reg.teamMembers.map((m) => `${m.name} (${m.usn})`).join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom bar: Registration ID & Cancellation */}
                  <div className="pt-3 border-t border-[var(--border-glass)] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-text-muted" />
                      <span className="text-text-muted font-mono">
                        Pass ID: <strong className="text-text-main">#{regIdShort}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {reg.status === 'registered' && (
                        <Link
                          to="/checkin"
                          className="px-2.5 py-1 rounded-xl bg-primary hover:bg-primary-hover text-cream text-[11px] font-semibold flex items-center gap-1 shadow-warm-xs"
                        >
                          <QrCode className="w-3 h-3" /> Check-In
                        </Link>
                      )}

                      {reg.status === 'attended' && (
                        <Link
                          to="/my-certificates"
                          className="px-2.5 py-1 rounded-xl bg-gold/20 text-text-main border border-gold/40 text-[11px] font-semibold hover:bg-gold/30 flex items-center gap-1"
                        >
                          <Award className="w-3 h-3 text-accent" /> Certificate
                        </Link>
                      )}

                      {reg.status === 'registered' && !isDeadlinePassed && (
                        <button
                          type="button"
                          onClick={() => setSelectedForCancel(reg)}
                          className="text-xs text-danger hover:text-danger/80 font-semibold"
                        >
                          Cancel Registration
                        </button>
                      )}
                      <Link
                        to={`/events/${reg.event._id}`}
                        className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
                      >
                        View Details <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {selectedForCancel && (
        <Modal
          isOpen={!!selectedForCancel}
          onClose={() => setSelectedForCancel(null)}
          title="Cancel Event Registration"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-text-muted">
              Are you sure you want to cancel your seat for{' '}
              <strong className="text-text-main">{selectedForCancel.event?.title}</strong>? Your registration will be
              marked as cancelled.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-glass)]">
              <Button
                variant="ghost"
                onClick={() => setSelectedForCancel(null)}
                disabled={cancelling}
              >
                Keep Registration
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmCancel}
                loading={cancelling}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
