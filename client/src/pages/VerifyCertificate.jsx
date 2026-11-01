import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { certificateService } from '../services/certificateService';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Download,
  Calendar,
  Building,
  Award,
  CheckCircle2,
  ExternalLink,
  Leaf,
  FileText,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export const VerifyCertificate = () => {
  const { certificateId: paramCertId } = useParams();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(paramCertId || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (paramCertId) {
      setSearchInput(paramCertId);
      handleVerify(paramCertId);
    }
  }, [paramCertId]);

  const handleVerify = async (idToVerify) => {
    const id = (idToVerify || searchInput).trim().toUpperCase();
    if (!id) {
      toast.error('Please enter a certificate ID to verify');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await certificateService.verifyCertificatePublic(id);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.message || 'Certificate not found or unverified.');
      }
    } catch (err) {
      setError(err.message || 'No valid certificate matches this identifier.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/verify/${searchInput.trim().toUpperCase()}`);
      handleVerify(searchInput.trim().toUpperCase());
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-text-main border border-primary/20 text-xs font-semibold mb-3">
          <Leaf className="w-3.5 h-3.5 text-primary" />
          Official Academic Credential Registry
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-main">
          Public Certificate Verification
        </h1>
        <p className="mt-2 text-sm text-text-muted max-w-lg mx-auto">
          Authenticate official credentials, participation records, and student achievements issued by VTU campus clubs.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6 max-w-xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="e.g. VTU-CEH-2026-A8K2F9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-text-main placeholder-text-muted text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/40 border border-[var(--border-glass)]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-cream text-sm font-semibold shadow-warm-sm transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
            ) : (
              'Verify'
            )}
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glass-panel p-10 text-center rounded-3xl border border-[var(--border-glass)] shadow-warm-md animate-pulse">
          <div className="w-12 h-12 rounded-full bg-primary-soft mx-auto flex items-center justify-center text-primary mb-3">
            <ShieldCheck className="w-6 h-6 animate-spin" />
          </div>
          <p className="font-serif font-semibold text-text-main">Checking institution credential database...</p>
          <p className="text-xs text-text-muted mt-1">Cross-referencing cryptographic signatures and server ledger</p>
        </div>
      )}

      {/* Error / Not Found State */}
      {!loading && error && (
        <div className="glass-panel p-8 rounded-3xl border border-danger/30 bg-danger/5 shadow-warm-md text-center max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-danger/10 text-danger mx-auto flex items-center justify-center mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-xl font-bold text-text-main">Certificate Not Found</h2>
          <p className="mt-2 text-sm text-text-muted">{error}</p>
          <p className="mt-3 text-xs text-text-muted">
            Double-check the certificate ID from the physical certificate QR or contact the issuing club organizer.
          </p>
        </div>
      )}

      {/* Verified Certificate Card */}
      {!loading && result && (
        <div className="glass-panel-strong rounded-3xl p-6 sm:p-10 border border-[var(--border-glass)] shadow-warm-lg transition-all">
          {/* Top Status Seal */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-[var(--border-glass)]">
            <div className="flex items-center gap-3.5">
              {result.revocation ? (
                <div className="w-12 h-12 rounded-2xl bg-danger/15 text-danger flex items-center justify-center border border-danger/30">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center border border-primary/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      result.revocation
                        ? 'bg-danger/15 text-danger border border-danger/30'
                        : 'bg-primary-soft text-primary border border-primary/30'
                    }`}
                  >
                    {result.revocation ? 'Revoked Credential' : 'Verified Genuine Credential'}
                  </span>
                  <span className="text-xs text-text-muted font-mono">{result.certificateId}</span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-main mt-0.5">
                  {result.title || 'Certificate of Participation'}
                </h2>
              </div>
            </div>

            {/* Download Action */}
            {result.downloadUrl && (
              <a
                href={result.downloadUrl}
                download
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-cream text-sm font-semibold shadow-warm-sm transition-all"
              >
                <Download className="w-4 h-4" />
                Download Verified PDF
              </a>
            )}
          </div>

          {/* Revocation Warning If Applicable */}
          {result.revocation && (
            <div className="mt-6 p-4 rounded-2xl bg-danger/10 border border-danger/30 text-danger text-sm">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Notice: This certificate was formally revoked by the institution.
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Reason: {result.revocation.reason} (Revoked on {new Date(result.revocation.revokedAt).toLocaleDateString()})
              </p>
            </div>
          )}

          {/* Credential Details Grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-sand/30 border border-[var(--border-glass)]">
              <span className="text-xs text-text-muted font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-primary" />
                Awarded Recipient
              </span>
              <p className="mt-1 font-serif text-lg font-bold text-text-main">{result.recipientName}</p>
              <p className="text-xs text-text-muted font-mono mt-0.5">
                VTU Seat Number: <span className="font-bold text-text-main">{result.maskedUSN}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-sand/30 border border-[var(--border-glass)]">
              <span className="text-xs text-text-muted font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-accent" />
                Event / Program
              </span>
              <p className="mt-1 font-serif text-lg font-bold text-text-main">{result.eventTitle}</p>
              <p className="text-xs text-text-muted mt-0.5">
                Organized by: <span className="font-semibold text-text-main">{result.clubName}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-sand/30 border border-[var(--border-glass)]">
              <span className="text-xs text-text-muted font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gold" />
                Date of Issuance
              </span>
              <p className="mt-1 text-sm font-semibold text-text-main">
                {new Date(result.issueDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              <p className="text-xs text-text-muted mt-0.5">Format: A4 Landscape Verified Digital Document</p>
            </div>

            <div className="p-4 rounded-2xl bg-sand/30 border border-[var(--border-glass)]">
              <span className="text-xs text-text-muted font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-primary" />
                Issuing Institution
              </span>
              <p className="mt-1 text-sm font-semibold text-text-main">{result.collegeName}</p>
              <p className="text-xs text-text-muted mt-0.5 truncate">{result.affiliation}</p>
            </div>
          </div>

          {/* Signatories Snapshot */}
          {result.signatories && result.signatories.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[var(--border-glass)]">
              <h3 className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-4">
                Authorized Institution Signatories
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {result.signatories.map((sig, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-sand/20 border border-[var(--border-glass)]">
                    <p className="font-serif text-sm font-bold text-text-main">{sig.name}</p>
                    <p className="text-xs text-primary font-medium">{sig.designation}</p>
                    {sig.department && <p className="text-[11px] text-text-muted">{sig.department}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Meta */}
          <div className="mt-8 pt-6 border-t border-[var(--border-glass)] flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Cryptographically verified against institution public certificate ledger
            </span>
            <Link to="/events" className="text-primary hover:underline font-semibold flex items-center gap-1">
              Explore Campus Events <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyCertificate;
