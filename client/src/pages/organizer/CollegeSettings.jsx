import React, { useState, useEffect } from 'react';
import { collegeSettingsService } from '../../services/collegeSettingsService';
import api from '../../services/api';
import { Building, Upload, Save, Globe, MapPin, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const CollegeSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    collegeName: '',
    affiliation: '',
    collegeLogo: '',
    address: '',
    website: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await collegeSettingsService.getCollegeSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      toast.error('Failed to load institution settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    try {
      toast.loading('Uploading logo...', { id: 'logo-up' });
      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success && res.data?.url) {
        setSettings((prev) => ({ ...prev, collegeLogo: res.data.url }));
        toast.success('Logo uploaded successfully!', { id: 'logo-up' });
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed', { id: 'logo-up' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await collegeSettingsService.updateCollegeSettings(settings);
      if (res.success) {
        toast.success('Institution credentials settings updated!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto min-h-screen">
      {/* Header */}
      <div className="pb-6 border-b border-[var(--border-glass)]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-text-main border border-primary/20 text-xs font-semibold mb-2">
          <Building className="w-3.5 h-3.5 text-primary" />
          Institution Branding & Credential Authority
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-main">
          College Certificate Settings
        </h1>
        <p className="mt-1 text-xs text-text-muted">
          Configure the institution name, affiliation details, and crest that print on generated student certificates and public verification pages.
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-text-muted animate-pulse">
          Loading institution settings...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="glass-panel-strong rounded-3xl p-6 sm:p-8 border border-[var(--border-glass)] shadow-warm-md space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Official College / University Name *
              </label>
              <input
                type="text"
                required
                value={settings.collegeName}
                onChange={(e) => setSettings({ ...settings, collegeName: e.target.value })}
                placeholder="e.g. BMS College of Engineering"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-text-main font-medium border border-[var(--border-glass)] focus:outline-none focus:ring-2 focus:ring-primary/40 bg-sand/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                University Affiliation & Accreditation Text *
              </label>
              <textarea
                rows={2}
                required
                value={settings.affiliation}
                onChange={(e) => setSettings({ ...settings, affiliation: e.target.value })}
                placeholder="e.g. Autonomous Institute, Affiliated to Visvesvaraya Technological University (VTU), Belagavi"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-text-main border border-[var(--border-glass)] focus:outline-none focus:ring-2 focus:ring-primary/40 bg-sand/40"
              />
              <p className="text-[11px] text-text-muted mt-1">
                This exact text appears centered below the institution title on the header of all certificate PDFs.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Institution Crest / Logo URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.collegeLogo}
                  onChange={(e) => setSettings({ ...settings, collegeLogo: e.target.value })}
                  placeholder="https://... or upload PNG"
                  className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs text-text-main border border-[var(--border-glass)] focus:outline-none focus:ring-2 focus:ring-primary/40 bg-sand/40 font-mono"
                />
                <label className="px-4 py-2.5 rounded-xl glass-button text-xs font-semibold text-text-main border border-[var(--border-glass)] hover:bg-sand/40 cursor-pointer flex items-center gap-1.5 shrink-0">
                  <Upload className="w-4 h-4 text-primary" /> Upload
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-accent" /> Campus Address
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  placeholder="Bull Temple Road, Basavanagudi, Bengaluru - 560019"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-text-main border border-[var(--border-glass)] focus:outline-none focus:ring-2 focus:ring-primary/40 bg-sand/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-primary" /> Institution Website
                </label>
                <input
                  type="url"
                  value={settings.website}
                  onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                  placeholder="https://www.bmsce.ac.in"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-text-main border border-[var(--border-glass)] focus:outline-none focus:ring-2 focus:ring-primary/40 bg-sand/40 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-cream text-xs font-semibold shadow-warm-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save College Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CollegeSettings;
