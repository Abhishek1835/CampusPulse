import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { registrationService } from '../../services/registrationService';
import toast from 'react-hot-toast';
import { Users, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { USN_REGEX } from '../../utils/constants';

export const EventRegistrationModal = ({ isOpen, onClose, event, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [error, setError] = useState('');

  if (!event || !user) return null;

  const handleAddMember = () => {
    if (teamMembers.length + 1 >= event.teamSizeMax) {
      toast.error(`Maximum team size is ${event.teamSizeMax} including you`);
      return;
    }
    setTeamMembers([...teamMembers, { name: '', usn: '' }]);
  };

  const handleRemoveMember = (index) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...teamMembers];
    updated[index][field] = value;
    setTeamMembers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Team validation
    if (event.isTeamEvent) {
      if (!teamName.trim()) {
        setError('Please enter a team name');
        return;
      }

      const totalMembers = teamMembers.length + 1; // student is lead
      if (totalMembers < event.teamSizeMin) {
        setError(
          `This event requires at least ${event.teamSizeMin} members per team. Please add more members.`
        );
        return;
      }

      for (let i = 0; i < teamMembers.length; i++) {
        const m = teamMembers[i];
        if (!m.name.trim()) {
          setError(`Please provide a name for team member #${i + 1}`);
          return;
        }
        if (!m.usn.trim() || !USN_REGEX.test(m.usn.trim())) {
          setError(
            `Invalid USN for team member #${i + 1} (${m.usn}). Example: 1BM22CS045`
          );
          return;
        }
      }
    }

    setLoading(true);
    try {
      const payload = event.isTeamEvent
        ? {
            teamName: teamName.trim(),
            teamMembers: teamMembers.map((m) => ({
              name: m.name.trim(),
              usn: m.usn.trim().toUpperCase()
            }))
          }
        : {};

      await registrationService.registerForEvent(event._id, payload);
      toast.success('Successfully registered for ' + event.title + '! 🎉');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed');
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Register for ${event.title}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Event Quick Summary */}
        <div className="p-4 rounded-2xl bg-primary-soft/60 border border-primary/20 text-xs space-y-1">
          <p className="font-serif font-bold text-text-main text-sm">
            {event.title}
          </p>
          <p className="text-text-muted">
            Date: {new Date(event.date).toLocaleDateString()} at {event.startTime} • Venue: {event.venue}
          </p>
          <p className="text-text-muted">
            Registration Fee:{' '}
            <span className="font-bold text-primary">
              {event.fee === 0 ? 'FREE' : `₹${event.fee}`}
            </span>
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-xs text-danger flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Pre-filled Student Credentials */}
        <div className="space-y-3">
          <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-text-muted">
            Student Identity (Pre-filled from Profile)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl glass-input border border-[var(--border-glass)]">
              <span className="text-text-muted block text-[10px]">USN (Unique Identifier)</span>
              <span className="font-mono font-bold text-text-main">
                {user.usn}
              </span>
            </div>
            <div className="p-3 rounded-xl glass-input border border-[var(--border-glass)]">
              <span className="text-text-muted block text-[10px]">Full Name</span>
              <span className="font-bold text-text-main">
                {user.name}
              </span>
            </div>
            <div className="p-3 rounded-xl glass-input border border-[var(--border-glass)]">
              <span className="text-text-muted block text-[10px]">Department / Branch</span>
              <span className="font-medium text-text-main truncate block">
                {user.branch || 'General'}
              </span>
            </div>
            <div className="p-3 rounded-xl glass-input border border-[var(--border-glass)]">
              <span className="text-text-muted block text-[10px]">Year of Study</span>
              <span className="font-medium text-text-main">
                Year {user.year || 1}
              </span>
            </div>
          </div>
        </div>

        {/* Team Details Section (If team event) */}
        {event.isTeamEvent && (
          <div className="space-y-4 pt-3 border-t border-[var(--border-glass)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-text-main">
                  Team Registration (Required: {event.teamSizeMin} to {event.teamSizeMax} Members)
                </h4>
              </div>
              <button
                type="button"
                onClick={handleAddMember}
                className="text-xs text-primary font-semibold hover:text-primary-hover flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Member
              </button>
            </div>

            <Input
              label="Team Name"
              placeholder="e.g. AlgoWarriors"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />

            {/* Team Members List */}
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-bg-soft text-xs flex justify-between items-center border border-[var(--border-glass)]">
                <span className="text-text-main">
                  Team Lead: <strong>{user.name}</strong> ({user.usn})
                </span>
                <span className="text-[10px] text-primary font-semibold px-2 py-0.5 rounded-full bg-primary-soft border border-primary/20">
                  Leader
                </span>
              </div>

              {teamMembers.map((member, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-[var(--border-glass)] glass-panel space-y-2.5 shadow-warm-xs"
                >
                  <div className="flex justify-between items-center text-xs font-bold text-text-main">
                    <span>Member #{idx + 2}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="text-danger hover:text-danger/80 p-1"
                      aria-label="Remove team member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      placeholder="Full Name"
                      value={member.name}
                      onChange={(e) =>
                        handleMemberChange(idx, 'name', e.target.value)
                      }
                      required
                    />
                    <Input
                      placeholder="USN (e.g. 1BM22CS099)"
                      value={member.usn}
                      onChange={(e) =>
                        handleMemberChange(idx, 'usn', e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="pt-4 border-t border-[var(--border-glass)] flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="accent"
            loading={loading}
            icon={CheckCircle2}
          >
            Confirm Registration
          </Button>
        </div>
      </form>
    </Modal>
  );
};
