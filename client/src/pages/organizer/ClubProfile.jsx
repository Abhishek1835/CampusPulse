import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { clubService } from '../../services/clubService';
import { uploadService } from '../../services/uploadService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import toast from 'react-hot-toast';
import {
  Building2,
  Save,
  Globe,
  Instagram,
  Linkedin,
  MessageSquare,
  GraduationCap
} from 'lucide-react';
import { CLUB_CATEGORIES } from '../../utils/constants';

export const ClubProfile = () => {
  const { user, refreshUser } = useAuth();
  const club = user?.club;

  const [name, setName] = useState(club?.name || '');
  const [tagline, setTagline] = useState(club?.tagline || '');
  const [description, setDescription] = useState(club?.description || '');
  const [category, setCategory] = useState(club?.category || 'technical');
  const [foundedYear, setFoundedYear] = useState(String(club?.foundedYear || 2020));

  // Faculty coordinator
  const [facultyName, setFacultyName] = useState(club?.facultyCoordinator?.name || '');
  const [facultyEmail, setFacultyEmail] = useState(club?.facultyCoordinator?.email || '');
  const [facultyPhone, setFacultyPhone] = useState(club?.facultyCoordinator?.phone || '');

  // Contact
  const [contactEmail, setContactEmail] = useState(club?.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(club?.contactPhone || '');

  // Socials
  const [instagram, setInstagram] = useState(club?.socialLinks?.instagram || '');
  const [linkedin, setLinkedin] = useState(club?.socialLinks?.linkedin || '');
  const [website, setWebsite] = useState(club?.socialLinks?.website || '');
  const [discord, setDiscord] = useState(club?.socialLinks?.discord || '');

  // Media
  const [logo, setLogo] = useState(club?.logo || '');
  const [banner, setBanner] = useState(club?.banner || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (club) {
      setName(club.name || '');
      setTagline(club.tagline || '');
      setDescription(club.description || '');
      setCategory(club.category || 'technical');
      setFoundedYear(String(club.foundedYear || 2020));
      setFacultyName(club.facultyCoordinator?.name || '');
      setFacultyEmail(club.facultyCoordinator?.email || '');
      setFacultyPhone(club.facultyCoordinator?.phone || '');
      setContactEmail(club.contactEmail || '');
      setContactPhone(club.contactPhone || '');
      setInstagram(club.socialLinks?.instagram || '');
      setLinkedin(club.socialLinks?.linkedin || '');
      setWebsite(club.socialLinks?.website || '');
      setDiscord(club.socialLinks?.discord || '');
      setLogo(club.logo || '');
      setBanner(club.banner || '');
    }
  }, [club]);

  const handleFileUpload = async (file, targetSetter) => {
    try {
      const res = await uploadService.uploadImage(file);
      if (res?.data?.url) {
        targetSetter(res.data.url);
        toast.success('Image uploaded successfully! 🖼️');
      }
    } catch (err) {
      toast.error('Upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!club?._id) return;

    setLoading(true);
    try {
      const payload = {
        tagline: tagline.trim(),
        description: description.trim(),
        category,
        foundedYear: Number(foundedYear),
        facultyCoordinator: {
          name: facultyName.trim(),
          email: facultyEmail.trim(),
          phone: facultyPhone.trim()
        },
        contactEmail: contactEmail.trim().toLowerCase(),
        contactPhone: contactPhone.trim(),
        socialLinks: {
          instagram: instagram.trim(),
          linkedin: linkedin.trim(),
          website: website.trim(),
          discord: discord.trim()
        },
        logo: logo.trim(),
        banner: banner.trim()
      };

      await clubService.updateClub(club._id, payload);
      await refreshUser();
      toast.success('Club profile updated successfully! 🎉');
    } catch (err) {
      toast.error(err.message || 'Failed to update club profile');
    } finally {
      setLoading(false);
    }
  };

  if (!club) {
    return (
      <div className="p-8 text-center text-sm text-text-muted">
        No club associated with your organizer profile.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-main">
          Club Settings & Profile
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1.5">
          Update branding, faculty coordinators, and official contact channels for{' '}
          <strong className="text-primary font-semibold">{club.name}</strong>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Club Info */}
        <div className="glass-panel p-6 rounded-3xl border border-[var(--border-glass)] shadow-warm-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-text-main pb-2 border-b border-[var(--border-glass)]">
            Basic Overview
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Club Name"
              value={name}
              disabled
              helperText="Club name is permanent to maintain university credentials"
            />
            <Select
              label="Category"
              options={CLUB_CATEGORIES}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <Input
            label="Tagline / Motto"
            placeholder="e.g. Compiling Passion into Production"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-main">
              Club Mission & Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full glass-input p-3 text-sm rounded-xl focus:outline-none font-normal"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Founded Year"
              type="number"
              value={foundedYear}
              onChange={(e) => setFoundedYear(e.target.value)}
            />
            <Input
              label="Official Contact Email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />
            <Input
              label="Office Phone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Faculty Coordinator */}
        <div className="glass-panel p-6 rounded-3xl border border-[var(--border-glass)] shadow-warm-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-text-main pb-2 border-b border-[var(--border-glass)] flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span>Faculty Coordinator / Advisor</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Faculty Name"
              placeholder="e.g. Dr. Rajeshwar Swamy"
              value={facultyName}
              onChange={(e) => setFacultyName(e.target.value)}
            />
            <Input
              label="Faculty Email"
              type="email"
              placeholder="faculty@college.edu"
              value={facultyEmail}
              onChange={(e) => setFacultyEmail(e.target.value)}
            />
            <Input
              label="Faculty Phone"
              placeholder="+91 94481 ..."
              value={facultyPhone}
              onChange={(e) => setFacultyPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="glass-panel p-6 rounded-3xl border border-[var(--border-glass)] shadow-warm-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-text-main pb-2 border-b border-[var(--border-glass)]">
            Social Media & Web Links
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Official Website URL"
              placeholder="https://..."
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              icon={Globe}
            />
            <Input
              label="Instagram Profile"
              placeholder="https://instagram.com/..."
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              icon={Instagram}
            />
            <Input
              label="LinkedIn Page"
              placeholder="https://linkedin.com/company/..."
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              icon={Linkedin}
            />
            <Input
              label="Discord Community Invite"
              placeholder="https://discord.gg/..."
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
              icon={MessageSquare}
            />
          </div>
        </div>

        {/* Media: Logo & Banner */}
        <div className="glass-panel p-6 rounded-3xl border border-[var(--border-glass)] shadow-warm-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-text-main pb-2 border-b border-[var(--border-glass)]">
            Brand Assets (Logo & Banner)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Input
                label="Logo Image URL"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] && handleFileUpload(e.target.files[0], setLogo)
                }
                className="text-xs text-text-muted file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-soft file:text-text-main"
              />
              {logo && (
                <div className="w-16 h-16 rounded-2xl overflow-hidden glass-panel border border-[var(--border-glass)] shadow-warm-xs">
                  <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Input
                label="Banner Image URL"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] && handleFileUpload(e.target.files[0], setBanner)
                }
                className="text-xs text-text-muted file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-soft file:text-text-main"
              />
              {banner && (
                <div className="h-16 rounded-xl overflow-hidden glass-panel border border-[var(--border-glass)] shadow-warm-xs">
                  <img src={banner} alt="Banner" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={Save}
          >
            Save Club Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
