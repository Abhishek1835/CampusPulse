import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import toast from 'react-hot-toast';
import {
  Lock,
  Save,
  CheckCircle2,
  Leaf
} from 'lucide-react';
import { BRANCHES, YEARS } from '../utils/constants';

export const Profile = () => {
  const { user, updateProfile, isOrganizer, isStudent } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [branch, setBranch] = useState(user?.branch || BRANCHES[0]);
  const [year, setYear] = useState(String(user?.year || 1));
  const [designation, setDesignation] = useState(user?.designation || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        branch,
        year: Number(year),
        designation: designation.trim(),
        avatar: avatar.trim()
      });
      toast.success('Profile updated successfully! ✨');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-text-main">
          My Account Profile
        </h1>
        <p className="text-sm text-text-muted mt-1.5">
          Manage your student or organizer details and contact information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & USN Badge */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-[var(--border-glass)] text-center space-y-4 shadow-warm-sm">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-primary text-[#F6F0E4] p-1 flex items-center justify-center shadow-warm-sm overflow-hidden">
              {avatar ? (
                <img
                  src={avatar}
                  alt={user?.name}
                  className="w-full h-full object-cover rounded-2xl"
                  onError={() => setAvatar('')}
                />
              ) : (
                <span className="font-serif text-3xl font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              )}
            </div>

            <div>
              <h3 className="font-serif text-lg font-bold text-text-main">
                {user?.name}
              </h3>
              <p className="text-xs text-primary font-semibold uppercase tracking-wider mt-0.5">
                {user?.role} Account
              </p>
            </div>

            {/* Read-only USN Badge */}
            <div className="p-3 rounded-2xl bg-bg-soft border border-[var(--border-glass)] text-xs">
              <span className="text-[10px] text-text-muted uppercase tracking-wider block font-bold">
                Unique Student Identifier
              </span>
              <span className="font-mono font-bold text-base text-text-main">
                {user?.usn}
              </span>
              <span className="text-[10px] text-text-muted block mt-1 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-text-muted" /> USN is permanent & read-only
              </span>
            </div>

            {/* Club affiliation if organizer */}
            {isOrganizer && user?.club && (
              <div className="p-3 rounded-2xl bg-primary-soft/50 border border-primary/20 text-xs text-left">
                <span className="text-[10px] text-text-muted uppercase tracking-wider block font-bold">
                  Associated Club
                </span>
                <p className="font-serif font-bold text-text-main text-sm mt-0.5">
                  {user.club.name}
                </p>
                <p className="text-text-muted text-[11px] mt-0.5">
                  Role: {user.designation || 'Club Organizer'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-glass)] shadow-warm-sm space-y-6"
          >
            <h2 className="font-serif text-lg font-bold text-text-main pb-3 border-b border-[var(--border-glass)]">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address (Login Identity Reference)"
                value={user?.email || ''}
                disabled
                helperText="Email is bound to your account"
              />

              <Input
                label="Avatar URL (Optional)"
                placeholder="https://..."
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
              />
            </div>

            {/* Student Specific Fields */}
            {isStudent && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Select
                  label="Department / Branch"
                  options={BRANCHES}
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                />

                <Select
                  label="Year of Study"
                  options={YEARS.map((y) => ({
                    id: String(y),
                    label: `Year ${y}`
                  }))}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
            )}

            {/* Organizer Specific Fields */}
            {isOrganizer && (
              <div className="pt-2">
                <Input
                  label="Club Designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Lead Coordinator, President"
                />
              </div>
            )}

            <div className="pt-4 border-t border-[var(--border-glass)] flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                icon={Save}
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
