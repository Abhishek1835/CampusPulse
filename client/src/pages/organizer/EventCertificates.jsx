import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { certificateService } from '../../services/certificateService';
import api from '../../services/api';
import {
  Award,
  Download,
  RefreshCw,
  Trash2,
  ArrowLeft,
  FileArchive,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

export const EventCertificates = () => {
  const { id: eventId } = useParams();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [generating, setGenerating] = useState(false);

  // Revoke Modal State
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, [eventId, filterStatus]);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await certificateService.getEventCertificates(eventId, filterStatus);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNow = async () => {
    if (!window.confirm('Generate and sign certificates now for all eligible attendees?')) {
      return;
    }

    setGenerating(true);
    try {
      const res = await certificateService.generateCertificatesNow(eventId);
      if (res.success) {
        toast.success(res.message || 'Certificates successfully generated!');
        fetchCertificates();
      }
    } catch (err) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async (certId) => {
    try {
      toast.loading('Regenerating certificate PDF...', { id: 'regen' });
      const res = await certificateService.regenerateCertificate(certId);
      if (res.success) {
        toast.success('Certificate regenerated successfully', { id: 'regen' });
        fetchCertificates();
      }
    } catch (err) {
      toast.error(err.message || 'Regeneration failed', { id: 'regen' });
    }
  };

  const handleRevokeSubmit = async (e) => {
    e.preventDefault();
    if (!revokeReason.trim()) {
      toast.error('Revocation reason is mandatory');
      return;
    }

    setRevoking(true);
    try {
      const res = await certificateService.revokeCertificate(selectedCert._id, revokeReason.trim());
      if (res.success) {
        toast.success('Certificate revoked');
        setRevokeModalOpen(false);
        setSelectedCert(null);
        setRevokeReason('');
        fetchCertificates();
      }
    } catch (err) {
      toast.error(err.message || 'Revocation failed');
    } finally {
      setRevoking(false);
    }
  };

  const certificates = data?.certificates || [];
  const filteredCerts = certificates.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.certificateId?.toLowerCase().includes(q) ||
      c.recipientName?.toLowerCase().includes(q) ||
      c.recipientUSN?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-glass)]">
        <div className="flex items-center gap-3">
          <Link
            to="/organizer/events"
            className="p-2 rounded-xl glass-button text-text-main hover:bg-sand/40 border border-[var(--border-glass)] transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Certificate Automation Console
              </span>
              {data?.certificatesGenerated && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-soft text-primary border border-primary/20">
                  Automated Run Complete
                </span>
              )}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-main">
              {data?.eventTitle || 'Event Certificates'}
            </h1>
          </div>
        </div>

        {/* Global Event Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleGenerateNow}
            disabled={generating}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-cream text-xs font-semibold shadow-warm-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {generating ? 'Processing Certificates...' : 'Generate Certificates Now'}
          </button>

          <a
            href={certificateService.getZipDownloadUrl(eventId)}
            download
            className="px-4 py-2.5 rounded-xl glass-button text-text-main text-xs font-semibold border border-[var(--border-glass)] hover:bg-sand/40 transition-all flex items-center gap-2 shadow-warm-xs"
          >
            <FileArchive className="w-4 h-4 text-accent" />
            Download Bulk ZIP
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name, USN, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-text-main border border-[var(--border-glass)] focus:outline-none focus:ring-2 focus:ring-primary/40 bg-sand/30"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-text-muted font-medium">Status Filter:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-xs text-text-main border border-[var(--border-glass)] bg-sand/40 focus:outline-none"
          >
            <option value="all">All Certificates ({certificates.length})</option>
            <option value="issued">Issued Only</option>
            <option value="revoked">Revoked Only</option>
          </select>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="mt-6 glass-panel-strong rounded-3xl border border-[var(--border-glass)] shadow-warm-md overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-text-muted animate-pulse">
            Loading event certificates and signatures snapshot...
          </div>
        ) : filteredCerts.length === 0 ? (
          <div className="p-16 text-center">
            <Award className="w-10 h-10 mx-auto text-text-muted mb-3 opacity-60" />
            <h3 className="font-serif text-base font-bold text-text-main">No Certificates Found</h3>
            <p className="mt-1 text-xs text-text-muted max-w-sm mx-auto">
              Certificates will auto-generate once the event concludes and grace delay expires, or you can trigger generation immediately with the "Generate Certificates Now" button.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-glass)] bg-sand/30 text-text-muted font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Certificate ID</th>
                  <th className="py-3.5 px-4">Recipient</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Downloads</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-glass)]">
                {filteredCerts.map((cert) => (
                  <tr key={cert._id} className="hover:bg-sand/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-text-main">
                      {cert.certificateId}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-text-main">{cert.recipientName}</p>
                      <p className="text-[11px] font-mono text-text-muted">{cert.recipientUSN}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-full bg-sand/60 text-text-main text-[10px] font-bold border border-[var(--border-glass)]">
                        {cert.certificateType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-text-muted font-mono">{cert.downloadCount || 0}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          cert.status === 'issued'
                            ? 'bg-primary-soft text-primary border border-primary/30'
                            : 'bg-danger/15 text-danger border border-danger/30'
                        }`}
                      >
                        {cert.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={certificateService.getDownloadUrl(cert.certificateId)}
                          download
                          className="p-1.5 rounded-lg hover:bg-sand/40 text-text-main transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4 text-primary" />
                        </a>

                        <button
                          onClick={() => handleRegenerate(cert._id)}
                          className="p-1.5 rounded-lg hover:bg-sand/40 text-text-main transition-colors"
                          title="Regenerate PDF"
                        >
                          <RefreshCw className="w-4 h-4 text-gold" />
                        </button>

                        {cert.status !== 'revoked' && (
                          <button
                            onClick={() => {
                              setSelectedCert(cert);
                              setRevokeModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-danger/10 text-danger transition-colors"
                            title="Revoke Certificate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        <Link
                          to={`/verify/${cert.certificateId}`}
                          target="_blank"
                          className="p-1.5 rounded-lg hover:bg-sand/40 text-text-muted transition-colors"
                          title="Public Verification View"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Revocation Modal */}
      {revokeModalOpen && selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel-strong w-full max-w-md p-6 rounded-3xl border border-danger/30 shadow-warm-lg">
            <h3 className="font-serif text-lg font-bold text-danger flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-danger" />
              Revoke Certificate
            </h3>
            <p className="mt-1 text-xs text-text-muted">
              Revoking{' '}
              <span className="font-mono font-bold text-text-main">{selectedCert.certificateId}</span>{' '}
              for <span className="font-bold text-text-main">{selectedCert.recipientName}</span>. This will immediately invalidate public verification.
            </p>

            <form onSubmit={handleRevokeSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                  Mandatory Revocation Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="e.g. Identity discrepancy, violation of academic integrity guidelines..."
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-text-main border border-[var(--border-glass)] focus:outline-none focus:ring-2 focus:ring-danger/40 bg-sand/40"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRevokeModalOpen(false);
                    setSelectedCert(null);
                  }}
                  className="px-4 py-2 rounded-xl glass-button text-xs font-semibold text-text-main border border-[var(--border-glass)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={revoking}
                  className="px-4 py-2 rounded-xl bg-danger hover:bg-danger/90 text-cream text-xs font-semibold shadow-warm-xs disabled:opacity-50"
                >
                  {revoking ? 'Revoking...' : 'Confirm Revocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCertificates;
