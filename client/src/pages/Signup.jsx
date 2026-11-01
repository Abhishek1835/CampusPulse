import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { clubService } from '../services/clubService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import toast from 'react-hot-toast';
import {
  Leaf,
  GraduationCap,
  Briefcase,
  AlertCircle,
  Key,
  ShieldCheck
} from 'lucide-react';
import { BRANCHES, YEARS, USN_REGEX, CLUB_CATEGORIES } from '../utils/constants';

export const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Role toggle: 'student' or 'organizer'
  const [role, setRole] = useState(
    searchParams.get('role') === 'organizer' ? 'organizer' : 'student'
  );

  // Common fields
  const [usn, setUsn] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Student specific fields
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [year, setYear] = useState('1');

  // Organizer specific fields
  const [designation, setDesignation] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [clubOption, setClubOption] = useState('existing'); // 'existing' or 'new'
  const [clubId, setClubId] = useState('');
  const [newClubName, setNewClubName] = useState('');
  const [newClubCategory, setNewClubCategory] = useState('technical');
  const [newClubDescription, setNewClubDescription] = useState('');

  // Available clubs list for selection
  const [availableClubs, setAvailableClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await clubService.getClubs();
        if (res?.data) {
          setAvailableClubs(res.data);
          if (res.data.length > 0) {
            setClubId(res.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load clubs:', err);
      }
    };
    fetchClubs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    const cleanUsn = usn.trim().toUpperCase();
    if (!USN_REGEX.test(cleanUsn)) {
      setError('Invalid USN format. Example: 1BM22CS045 (VTU standard)');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (role === 'organizer') {
      if (!accessCode.trim()) {
        setError('Organizer access code is required');
        return;
      }
      if (!designation.trim()) {
        setError('Please specify your designation (e.g. Club President, Secretary)');
        return;
      }
      if (clubOption === 'new' && !newClubName.trim()) {
        setError('Please enter the name of the new club');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        usn: cleanUsn,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        confirmPassword,
        role,
        ...(role === 'student' && {
          branch,
          year: Number(year)
        }),
        ...(role === 'organizer' && {
          designation: designation.trim(),
          accessCode: accessCode.trim(),
          ...(clubOption === 'existing'
            ? { clubId }
            : {
                newClubName: newClubName.trim(),
                newClubCategory,
                newClubDescription: newClubDescription.trim()
              })
        })
      };

      const user = await register(payload);
      toast.success(`Account created! Welcome, ${user.name}`);

      if (user.role === 'organizer') {
        navigate('/organizer/dashboard');
      } else {
        navigate('/events');
      }
    } catch (err) {
      setError(err.message || 'Signup failed');
      toast.error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl glass-panel-strong rounded-3xl p-6 sm:p-8 border border-[var(--border-glass)] shadow-warm-lg relative overflow-hidden"
      >
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-primary text-[#F6F0E4] shadow-warm-sm mb-3">
            <Leaf className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-main">
            Create Your Account
          </h2>
          <p className="text-xs text-text-muted mt-1.5">
            Join CampusPulse with your unique University Seat Number
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-bg-soft border border-[var(--border-glass)] mb-6">
          <button
            type="button"
            onClick={() => {
              setRole('student');
              setError('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              role === 'student'
                ? 'bg-primary text-[#F6F0E4] shadow-warm-xs'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student (Audience)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('organizer');
              setError('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              role === 'organizer'
                ? 'bg-primary text-[#F6F0E4] shadow-warm-xs'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Club Organizer</span>
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-xs text-danger flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identity & Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="USN (University Seat Number)"
              placeholder="e.g. 1BM22CS045"
              value={usn}
              onChange={(e) => setUsn(e.target.value.toUpperCase())}
              required
              helperText="VTU Format: 1BM22CS045"
            />
            <Input
              label="Full Name"
              placeholder="e.g. Rohan Gupta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@bmsce.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          {/* Student Fields */}
          {role === 'student' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-bg-soft/70 border border-[var(--border-glass)]">
              <Select
                label="Department / Branch"
                options={BRANCHES}
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
              />
              <Select
                label="Year of Study"
                options={YEARS.map((y) => ({
                  id: String(y),
                  label: `Year ${y} (${y === 1 ? '1st' : y === 2 ? '2nd' : y === 3 ? '3rd' : '4th'} Year)`
                }))}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>
          )}

          {/* Organizer Safeguard & Fields */}
          {role === 'organizer' && (
            <div className="space-y-4 p-4 rounded-2xl bg-primary-soft/40 border border-primary/20">
              <div className="flex items-center gap-2 text-xs font-bold text-text-main">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Organizer Verification Safeguard</span>
              </div>

              <Input
                label="Organizer Access Code"
                type="password"
                placeholder="Enter college organizer secret code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                required
                icon={Key}
                helperText="Demo Secret Code: COLLEGE_ORG_2025"
              />

              <Input
                label="Your Designation in Club"
                placeholder="e.g. Club President, Secretary, Technical Lead"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
              />

              {/* Club Choice: Join Existing vs Create New */}
              <div className="space-y-2 pt-2 border-t border-[var(--border-glass)]">
                <label className="block text-xs font-semibold text-text-main">
                  Club Affiliation
                </label>
                <div className="flex gap-4 text-xs font-medium text-text-muted">
                  <label className="flex items-center gap-1.5 cursor-pointer text-text-main">
                    <input
                      type="radio"
                      name="clubOption"
                      checked={clubOption === 'existing'}
                      onChange={() => setClubOption('existing')}
                      className="accent-primary"
                    />
                    <span>Select Existing Club</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-text-main">
                    <input
                      type="radio"
                      name="clubOption"
                      checked={clubOption === 'new'}
                      onChange={() => setClubOption('new')}
                      className="accent-primary"
                    />
                    <span>Register New Club</span>
                  </label>
                </div>

                {clubOption === 'existing' ? (
                  <Select
                    options={availableClubs.map((c) => ({
                      id: c._id,
                      label: `${c.name} (${c.category})`
                    }))}
                    value={clubId}
                    onChange={(e) => setClubId(e.target.value)}
                    required
                  />
                ) : (
                  <div className="space-y-3 pt-2">
                    <Input
                      label="New Club Name"
                      placeholder="e.g. AI & Robotics Society"
                      value={newClubName}
                      onChange={(e) => setNewClubName(e.target.value)}
                      required
                    />
                    <Select
                      label="Club Category"
                      options={CLUB_CATEGORIES}
                      value={newClubCategory}
                      onChange={(e) => setNewClubCategory(e.target.value)}
                      required
                    />
                    <Input
                      label="Short Tagline / Description"
                      placeholder="What is this club about?"
                      value={newClubDescription}
                      onChange={(e) => setNewClubDescription(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password (min 8 chars)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-4"
            loading={loading}
          >
            Create {role === 'organizer' ? 'Organizer' : 'Student'} Account
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-text-muted">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-bold text-primary hover:text-primary-hover hover:underline"
          >
            Sign in with USN
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
