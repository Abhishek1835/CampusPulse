import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import {
  CalendarDays,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Users,
  Copy,
  QrCode,
  Award
} from 'lucide-react';

export const OrganizerEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [deleteEventTarget, setDeleteEventTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventService.getOrganizerEvents();
      if (res?.data) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error('Error fetching organizer events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async () => {
    if (!deleteEventTarget) return;
    setDeleting(true);
    try {
      await eventService.deleteEvent(deleteEventTarget._id);
      toast.success('Event and associated registrations deleted');
      setDeleteEventTarget(null);
      fetchEvents();
    } catch (err) {
      toast.error(err.message || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async (event) => {
    const newStatus = event.status === 'published' ? 'draft' : 'published';
    try {
      await eventService.updateEvent(event._id, { status: newStatus });
      toast.success(`Event status changed to ${newStatus}`);
      fetchEvents();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleDuplicate = async (event) => {
    try {
      const duplicateData = {
        title: `${event.title} (Copy)`,
        description: event.description,
        shortDescription: event.shortDescription,
        poster: event.poster,
        category: event.category,
        tags: event.tags,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        startTime: event.startTime,
        endTime: event.endTime,
        venue: event.venue,
        mode: event.mode,
        meetingLink: event.meetingLink,
        registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        capacity: event.capacity,
        fee: event.fee,
        isTeamEvent: event.isTeamEvent,
        teamSizeMin: event.teamSizeMin,
        teamSizeMax: event.teamSizeMax,
        rules: event.rules,
        prizes: event.prizes,
        eligibility: event.eligibility,
        contactPersons: event.contactPersons,
        status: 'draft'
      };
      await eventService.createEvent(duplicateData);
      toast.success('Event duplicated as draft! ✨');
      fetchEvents();
    } catch (err) {
      toast.error(err.message || 'Failed to duplicate event');
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesStatus =
      statusFilter === 'all' || ev.status === statusFilter;
    const matchesSearch =
      !search.trim() ||
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.venue.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-main">
            Manage Club Events
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1.5">
            Create, update, inspect attendance, and manage student registrations.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={PlusCircle}
          onClick={() => navigate('/organizer/events/new')}
        >
          Create New Event
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-3xl border border-[var(--border-glass)] shadow-warm-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by event title or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input pl-10 pr-4 py-2 text-sm rounded-xl font-medium"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'published', 'draft', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-primary text-[#F6F0E4] shadow-warm-xs'
                  : 'glass-panel text-text-muted hover:text-text-main hover:bg-primary-soft/50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table */}
      {loading ? (
        <div className="glass-panel h-64 rounded-3xl animate-pulse bg-bg-soft/50 border border-[var(--border-glass)]" />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events found"
          description="You haven't created any events matching this filter yet."
          actionLabel="Create an Event"
          onAction={() => navigate('/organizer/events/new')}
        />
      ) : (
        <div className="glass-panel rounded-3xl border border-[var(--border-glass)] shadow-warm-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-glass)] text-text-muted uppercase tracking-wider text-[10px] bg-bg-soft/40">
                  <th className="py-3 px-4">Event Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Capacity & Registrations</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-glass)]">
                {filteredEvents.map((ev) => {
                  const percent =
                    ev.capacity > 0
                      ? Math.min(100, Math.round((ev.registeredCount / ev.capacity) * 100))
                      : null;

                  return (
                    <tr
                      key={ev._id}
                      className="hover:bg-primary-soft/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              ev.poster ||
                              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&auto=format&fit=crop&q=80'
                            }
                            alt={ev.title}
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                          />
                          <div>
                            <Link
                              to={`/events/${ev._id}`}
                              className="font-serif font-bold text-text-main hover:text-primary truncate block max-w-xs"
                            >
                              {ev.title}
                            </Link>
                            <span className="text-[11px] text-text-muted truncate block">
                              Venue: {ev.venue}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant={ev.category} size="xs">
                          {ev.category}
                        </Badge>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-text-main block">
                          {new Date(ev.date).toLocaleDateString()}
                        </span>
                        <span className="text-[11px] text-text-muted">
                          {ev.startTime}
                        </span>
                      </td>

                      <td className="py-3 px-4 min-w-[160px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-semibold">
                            <span className="text-primary font-bold">
                              {ev.registeredCount} registered
                            </span>
                            <span className="text-text-muted">
                              {ev.capacity > 0 ? `/ ${ev.capacity}` : 'Unlimited'}
                            </span>
                          </div>
                          {ev.capacity > 0 && (
                            <div className="w-full h-1.5 bg-bg-soft rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  percent >= 90
                                    ? 'bg-danger'
                                    : percent >= 70
                                    ? 'bg-gold'
                                    : 'bg-primary'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(ev)}
                          title="Click to toggle publish status"
                          className="cursor-pointer"
                        >
                          <Badge
                            variant={
                              ev.status === 'published'
                                ? 'success'
                                : ev.status === 'draft'
                                ? 'warning'
                                : 'default'
                            }
                            size="xs"
                          >
                            {ev.status}
                          </Badge>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live Attendance */}
                          <Link
                            to={`/organizer/events/${ev._id}/attendance`}
                            className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary-soft/50 transition-colors"
                            title="Live Projector Attendance Screen"
                          >
                            <QrCode className="w-4 h-4 text-primary" />
                          </Link>

                          {/* Certificates */}
                          <Link
                            to={`/organizer/events/${ev._id}/certificates`}
                            className="p-1.5 rounded-lg text-text-muted hover:text-gold hover:bg-gold/15 transition-colors"
                            title="Automated Certificates & ZIP Export"
                          >
                            <Award className="w-4 h-4 text-accent" />
                          </Link>

                          {/* View Participants */}
                          <Link
                            to={`/organizer/events/${ev._id}/participants`}
                            className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary-soft/50 transition-colors"
                            title="View registered students & attendance"
                          >
                            <Users className="w-4 h-4" />
                          </Link>

                          {/* Edit */}
                          <Link
                            to={`/organizer/events/${ev._id}/edit`}
                            className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent-soft/50 transition-colors"
                            title="Edit event"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => handleDuplicate(ev)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary-soft/50 transition-colors"
                            title="Duplicate event"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteEventTarget(ev)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                            title="Delete event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteEventTarget && (
        <Modal
          isOpen={!!deleteEventTarget}
          onClose={() => setDeleteEventTarget(null)}
          title="Delete Event"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-text-muted">
              Are you sure you want to delete{' '}
              <strong className="text-text-main">"{deleteEventTarget.title}"</strong>?
            </p>
            <p className="text-danger font-medium">
              ⚠️ Warning: This action cannot be undone. All registrations associated
              with this event will also be removed.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-glass)]">
              <Button
                variant="ghost"
                onClick={() => setDeleteEventTarget(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={deleting}
              >
                Delete Event
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
