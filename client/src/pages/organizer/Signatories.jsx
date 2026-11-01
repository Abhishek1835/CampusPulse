import React, { useState, useEffect } from 'react';
import { signatoryService } from '../../services/signatoryService';
import api from '../../services/api';
import {
  PenTool,
  Plus,
  Trash2,
  Building,
  Upload,
  UserCheck,
  CheckCircle2,
  FileSignature
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Signatories = () => {
  const [signatories, setSignatories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    department: '',
    signatureImage: ''
  });

  useEffect(() => {
    fetchSignatories();
  }, []);

  const fetchSignatories = async () => {
    setLoading(true);
    try {
      const res = await signatoryService.getSignatories();
      if (res.success && res.data) {
        setSignatories(res.data);
      }
    } catch (err) {
      toast.error('Failed to load signatories');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    try {
      toast.loading('Uploading signature asset...', { id: 'sig-upload' });
      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success && res.data?.url) {
        setFormData((prev) => ({ ...prev, signatureImage: res.data.url }));
        toast.success('Signature uploaded!', { id: 'sig-upload' });
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed', { id: 'sig-upload' });
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.designation.trim()) {
      toast.error('Name and designation are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await signatoryService.createSignatory(formData);
      if (res.success) {
        toast.success('Signatory registered successfully');
        setFormData({ name: '', designation: '', department: '', signatureImage: '' });
        setAddModalOpen(false);
        fetchSignatories();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save signatory');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this signatory?')) return;

    try {
      const res = await signatoryService.deleteSignatory(id);
      if (res.success) {
        toast.success('Signatory removed');
        fetchSignatories();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-glass)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-text-main border border-primary/20 text-xs font-semibold mb-2">
            <PenTool className="w-3.5 h-3.5 text-primary" />
            Institutional Credential Authority
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-main">
            Certificate Signatories
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Configure HODs, Deans, and Club Faculty Advisors whose transparent signatures authenticate certificates.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-cream text-xs font-semibold shadow-warm-sm flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Signatory
        </button>
      </div>

      {/* Signatories Grid */}
      <div className="mt-8">
        {loading ? (
          <div className="p-16 text-center text-xs text-text-muted animate-pulse">
            Loading institution signatories...
          </div>
        ) : signatories.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-[var(--border-glass)] text-center max-w-md mx-auto">
            <FileSignature className="w-12 h-12 mx-auto text-text-muted mb-3 opacity-60" />
            <h3 className="font-serif text-base font-bold text-text-main">No Signatories Configured</h3>
            <p className="mt-1 text-xs text-text-muted">
              Add HOD, Faculty Advisor or Dean signatures to attach them automatically to issued certificates.
            </p>
            <button
              onClick={() => setAddModalOpen(true)}
              className="mt-5 px-4 py-2 rounded-xl bg-primary text-cream text-xs font-semibold shadow-warm-xs"
            >
              Add First Signatory
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {signatories.map((sig) => (
              <div
                key={sig._id}
                className="glass-panel-strong rounded-3xl p-6 border border-[var(--border-glass)] shadow-warm-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary-soft text-primary flex items-center justify-center border border-primary/20 shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <button
                      onClick={() => handleDelete(sig._id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                      title="Deactivate signatory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-serif text-base font-bold text-text-main mt-4">{sig.name}</h3>
                  <p className="text-xs font-semibold text-primary">{sig.designation}</p>
                  {sig.department && (
                    <p className="text-[11px] text-text-muted mt-0.5">{sig.department}</p>
                  )}
                </div>

                {/* Signature Preview Box */}
                <div className="mt-6 pt-4 border-t border-[var(--border-glass)]">
                  <span className="text-[10px] uppercase font-bold text-text-muted block mb-2">
                    Signature Asset
                  </span>
                  <div className="h-16 rounded-xl bg-sand/30 border border-[var(--border-glass)] flex items-center justify-center p-2">
                    {sig.signatureImage ? (
                      <img
                        src={sig.signatureImage}
                        alt={`${sig.name} Signature`}
                        className="max-h-full max-w-full object-contain filter contrast-125"
                      />
                    ) : (
                      <span className="font-serif italic text-xs text-text-muted">
                        [Digital Signature: {sig.name}]
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Signatory Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel-strong w-full max-w-md p-6 rounded-3xl border border-[var(--border-glass)] shadow-warm-lg">
            <h3 className="font-serif text-lg font-bold text-text-main flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Register New Signatory
            </h3>
            <p className="mt-1 text-xs text-text-muted">
              Add authorized signatory details to embed in certificates.
            </p>

            <form onSubmit={handleAddSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                  Full Name & Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. H.S. Shwetha"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-text-main border border-[var(--border-glass)] focus:outline-none focus:ring-2 focus:ring-primary/40 bg-sand/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                  Designation / Role *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Professor & Head / Dean / Faculty Advisor"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-text-main border border-[var(--border-glass)] focus:outline-none focus:ring-2 focus:ring-primary/40 bg-sand/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                  Department / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dept. of Computer Science & Engineering"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-text-main border border-[var(--border-glass)] focus:outline-none focus:ring-2 focus:ring-primary/40 bg-sand/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                  Signature Image (PNG with transparent background)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Signature Image URL or upload →"
                    value={formData.signatureImage}
                    onChange={(e) => setFormData({ ...formData, signatureImage: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 rounded-xl glass-input text-xs text-text-main border border-[var(--border-glass)] focus:outline-none focus:ring-2 focus:ring-primary/40 bg-sand/40 font-mono"
                  />
                  <label className="px-3.5 py-2.5 rounded-xl glass-button text-xs font-semibold text-text-main border border-[var(--border-glass)] hover:bg-sand/40 cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-4 h-4 text-primary" /> Upload
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl glass-button text-xs font-semibold text-text-main border border-[var(--border-glass)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-cream text-xs font-semibold shadow-warm-xs disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Register Signatory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signatories;
