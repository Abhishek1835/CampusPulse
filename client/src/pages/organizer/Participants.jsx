import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { registrationService } from '../../services/registrationService';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import {
  Users,
  Download,
  Search,
  CheckSquare,
  Square,
  Trash2,
  ArrowLeft,
  QrCode,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { BRANCHES, YEARS } from '../../utils/constants';

export const Participants = () => {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [removing, setRemoving] = useState(false);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const res = await registrationService.getEventRegistrations(id, {
        search: search.trim() || undefined,
        branch: branchFilter !== 'all' ? branchFilter : undefined,
        year: yearFilter !== 'all' ? yearFilter : undefined
      });
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [id, branchFilter, yearFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchParticipants();
  };

  const handleToggleAttendance = async (reg) => {
    const nextStatus = reg.status === 'attended' ? 'registered' : 'attended';
    try {
      await registrationService.toggleAttendance(reg._id, nextStatus);
      toast.success(
        nextStatus === 'attended'
          ? `Marked ${reg.name} as Attended`
          : `Marked ${reg.name} as Registered`
      );
      fetchParticipants();
    } catch (err) {
      toast.error('Failed to update attendance');
    }
  };

  const handleRemove = async () => {
    if (!deleteTarget) return;
    setRemoving(true);
    try {
      await registrationService.removeParticipant(deleteTarget._id);
      toast.success(`Removed ${deleteTarget.name} from event`);
      setDeleteTarget(null);
      fetchParticipants();
    } catch (err) {
      toast.error('Failed to remove participant');
    } finally {
      setRemoving(false);
    }
  };

  const handleExportCSV = () => {
    registrationService.exportRegistrationsCSV(id);
    toast.success('Downloading participant CSV report...');
  };

  const event = data?.event || {};
  const registrations = data?.registrations || [];
  const totalRegistered = data?.totalRegistered ?? 0;
  const totalAttended = data?.totalAttended ?? 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Back Link & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-glass)]">
        <div className="space-y-1">
          <Link
            to="/organizer/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Events
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-main">
            {event.title || 'Event'} Participants
          </h1>
          <p className="text-xs text-text-muted">
            Venue: {event.venue || 'Campus Venue'} • Capacity:{' '}
            {event.capacity > 0 ? event.capacity : 'Unlimited'}
          </p>
        </div>

        {/* Hub Action Links */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/organizer/events/${id}/attendance`}
            className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-cream text-xs font-semibold shadow-warm-xs flex items-center gap-1.5 transition-all"
          >
            <QrCode className="w-4 h-4" /> Live Projector Screen
          </Link>

          <Link
            to={`/organizer/events/${id}/certificates`}
            className="px-3.5 py-2 rounded-xl glass-button text-text-main text-xs font-semibold border border-[var(--border-glass)] hover:bg-sand/40 flex items-center gap-1.5 transition-all shadow-warm-xs"
          >
            <Award className="w-4 h-4 text-accent" /> Event Certificates
          </Link>

          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export Enriched CSV
          </Button>
        </div>
      </div>

      {/* Live Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-[var(--border-glass)] text-center shadow-warm-xs">
          <span className="text-[10px] uppercase font-bold text-text-muted">
            Total Registered
          </span>
          <p className="font-serif text-2xl font-bold text-primary mt-0.5">
            {totalRegistered}
          </p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-[var(--border-glass)] text-center shadow-warm-xs">
          <span className="text-[10px] uppercase font-bold text-text-muted">
            Attended (Present)
          </span>
          <p className="font-serif text-2xl font-bold text-primary mt-0.5">
            {totalAttended}
          </p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-[var(--border-glass)] text-center shadow-warm-xs">
          <span className="text-[10px] uppercase font-bold text-text-muted">
            Attendance Rate
          </span>
          <p className="font-serif text-2xl font-bold text-gold mt-0.5">
            {totalRegistered > 0
              ? Math.round((totalAttended / totalRegistered) * 100)
              : 0}
            %
          </p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-[var(--border-glass)] text-center shadow-warm-xs">
          <span className="text-[10px] uppercase font-bold text-text-muted">
            Seats Capacity
          </span>
          <p className="font-serif text-2xl font-bold text-text-main mt-0.5">
            {event.capacity > 0 ? `${totalRegistered}/${event.capacity}` : 'Unlimited'}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel p-4 rounded-3xl border border-[var(--border-glass)] shadow-warm-sm flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search student by name, USN, email, or team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input pl-10 pr-4 py-2 text-xs rounded-xl font-medium"
          />
        </form>

        <div className="w-full sm:w-56">
          <Select
            options={[{ id: 'all', label: 'All Branches' }, ...BRANCHES]}
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-36">
          <Select
            options={[
              { id: 'all', label: 'All Years' },
              ...YEARS.map((y) => ({ id: String(y), label: `Year ${y}` }))
            ]}
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Participants Table */}
      {loading ? (
        <div className="glass-panel h-64 rounded-3xl animate-pulse bg-bg-soft/50 border border-[var(--border-glass)]" />
      ) : registrations.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No registered students found"
          description="No students matching your search criteria have registered for this event yet."
        />
      ) : (
        <div className="glass-panel-strong rounded-3xl border border-[var(--border-glass)] shadow-warm-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-glass)] text-text-muted uppercase tracking-wider text-[10px] bg-bg-soft/40">
                  <th className="py-3.5 px-4 w-12 text-center">Attend</th>
                  <th className="py-3.5 px-4">Student USN & Name</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Branch & Year</th>
                  <th className="py-3.5 px-4">Attendance Status</th>
                  <th className="py-3.5 px-4">Certificate Status</th>
                  <th className="py-3.5 px-4 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-glass)]">
                {registrations.map((reg) => {
                  const isAttended = reg.status === 'attended' || reg.attendanceStatus === 'on-time';
                  const attStatus = reg.attendanceStatus || (isAttended ? 'on-time' : 'absent');
                  const cert = reg.certificateRecord;

                  return (
                    <tr
                      key={reg._id}
                      className="hover:bg-primary-soft/30 transition-colors"
                    >
                      {/* Attendance Toggle Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(reg)}
                          className="p-1 rounded text-primary hover:scale-110 transition-transform"
                          title="Click to toggle attendance"
                        >
                          {isAttended ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : (
                            <Square className="w-5 h-5 text-text-muted" />
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-primary block">
                          {reg.usn}
                        </span>
                        <span className="font-semibold text-text-main">
                          {reg.name}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-text-muted block">
                          {reg.email}
                        </span>
                        <span className="text-text-muted font-mono text-[11px]">
                          {reg.phone}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-text-main block max-w-xs truncate font-medium">
                          {reg.branch || '—'}
                        </span>
                        <span className="text-text-muted text-[11px]">
                          Year {reg.year || '1'}
                        </span>
                      </td>

                      {/* Attendance Status Chip */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            attStatus === 'on-time'
                              ? 'bg-primary-soft text-primary border border-primary/30'
                              : attStatus === 'late'
                              ? 'bg-warning/15 text-warning border border-warning/30'
                              : attStatus === 'manual'
                              ? 'bg-accent/15 text-accent border border-accent/30'
                              : 'bg-sand/60 text-text-muted border border-[var(--border-glass)]'
                          }`}
                        >
                          {attStatus}
                        </span>
                        {reg.checkInTime && (
                          <span className="text-[10px] text-text-muted block mt-0.5 font-mono">
                            {new Date(reg.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </td>

                      {/* Certificate Status Chip */}
                      <td className="py-3.5 px-4">
                        {cert ? (
                          <Link
                            to={`/verify/${cert.certificateId}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/15 text-gold border border-gold/30 hover:underline"
                          >
                            <Award className="w-3 h-3" /> {cert.certificateId}
                          </Link>
                        ) : attStatus === 'late' ? (
                          <span className="text-[10px] text-warning font-semibold">
                            Ineligible (Late)
                          </span>
                        ) : isAttended ? (
                          <span className="text-[10px] text-primary font-semibold">
                            Eligible (Pending)
                          </span>
                        ) : (
                          <span className="text-[10px] text-text-muted">Not Issued</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(reg)}
                          className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition-colors"
                          title="Remove student from event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Remove Participant Modal */}
      {deleteTarget && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Remove Participant"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-text-muted">
              Are you sure you want to remove <strong className="text-text-main">{deleteTarget.name}</strong> ({deleteTarget.usn}) from this event?
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-glass)]">
              <Button
                variant="ghost"
                onClick={() => setDeleteTarget(null)}
                disabled={removing}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleRemove}
                loading={removing}
              >
                Confirm Remove
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Participants;
