import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { certificateService } from '../services/certificateService';
import {
  Award,
  Download,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Calendar,
  Building,
  AlertCircle,
  Leaf,
  FileCheck2,
  Sparkles,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

export const MyCertificates = () => {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [ineligibleNotes, setIneligibleNotes] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await certificateService.getMyCertificates();
      if (res.success && res.data) {
        setCertificates(res.data.certificates || []);
        setIneligibleNotes(res.data.ineligibleNotes || []);
      }
    } catch (err) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (certificateId) => {
    const url = `${window.location.origin}/verify/${certificateId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(certificateId);
    toast.success('Verification URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getLinkedInShareUrl = (cert) => {
    const title = cert.title || 'Certificate of Participation';
    const org = cert.collegeSnapshot?.name || 'Visvesvaraya Technological University (VTU)';
    const date = new Date(cert.issueDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const certUrl = `${window.location.origin}/verify/${cert.certificateId}`;

    return `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
      title
    )}&organizationName=${encodeURIComponent(org)}&issueYear=${year}&issueMonth=${month}&certUrl=${encodeURIComponent(
      certUrl
    )}&certId=${encodeURIComponent(cert.certificateId)}`;
  };

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-text-main border border-primary/20 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5 text-primary" />
            Verified Digital Achievements
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-main">
            My Event Certificates
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            All verifiable credentials awarded for verified on-time event attendance.
          </p>
        </div>

        <Link
          to="/verify"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass-button text-text-main text-xs font-semibold border border-[var(--border-glass)] hover:bg-sand/40 transition-all self-start md:self-auto"
        >
          <FileCheck2 className="w-4 h-4 text-primary" />
          Public Credential Verifier
        </Link>
      </div>

      {/* Informative Notice For Ineligible Events (Late Attendance) */}
      {ineligibleNotes.length > 0 && (
        <div className="mb-8 p-5 rounded-3xl glass-panel border border-warning/30 bg-warning/5 shadow-warm-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-warning/20 text-warning flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-text-main">
                Attendance Policy & Certificate Eligibility
              </h3>
              <p className="mt-1 text-xs text-text-muted leading-relaxed">
                Certificates are generated exclusively for students who completed verified{' '}
                <span className="font-semibold text-text-main">on-time check-in</span>. You have attended the following session(s) outside the allowed on-time grace period:
              </p>
              <div className="mt-3 space-y-1.5">
                {ineligibleNotes.map((note, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between text-xs p-2.5 rounded-xl bg-sand/30 border border-[var(--border-glass)] gap-1"
                  >
                    <span className="font-semibold text-text-main">{note.eventTitle}</span>
                    <span className="text-text-muted text-[11px]">
                      Status: <span className="text-warning font-semibold uppercase">{note.attendanceStatus}</span> (Outside allowed on-time window)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass-panel p-6 rounded-3xl border border-[var(--border-glass)] h-72 animate-pulse"
            />
          ))}
        </div>
      ) : certificates.length === 0 ? (
        /* Empty State */
        <div className="glass-panel p-12 rounded-3xl border border-[var(--border-glass)] shadow-warm-md text-center max-w-md mx-auto my-12">
          <div className="w-16 h-16 rounded-3xl bg-primary-soft text-primary mx-auto flex items-center justify-center mb-4 border border-primary/20">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-xl font-bold text-text-main">No Certificates Earned Yet</h2>
          <p className="mt-2 text-xs text-text-muted leading-relaxed">
            Attend upcoming college workshops, hackathons, and seminars on time to earn cryptographically verifiable digital certificates signed by HODs and organizers.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              to="/events"
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-cream text-xs font-semibold shadow-warm-sm transition-all"
            >
              Browse Events
            </Link>
            <Link
              to="/checkin"
              className="px-5 py-2.5 rounded-xl glass-button text-text-main text-xs font-semibold border border-[var(--border-glass)] hover:bg-sand/40 transition-all"
            >
              Go to Check-In
            </Link>
          </div>
        </div>
      ) : (
        /* Certificates Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="glass-panel-strong rounded-3xl p-6 border border-[var(--border-glass)] shadow-warm-md hover:shadow-warm-lg transition-all flex flex-col justify-between group"
            >
              {/* Top Certificate Header Card */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary-soft text-text-main border border-primary/20">
                    {cert.certificateId}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                    {cert.certificateType}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-text-main group-hover:text-primary transition-colors">
                  {cert.title || 'Certificate of Participation'}
                </h3>
                <p className="text-xs font-semibold text-accent mt-0.5">
                  {cert.event?.title || cert.eventTitle || 'College Event'}
                </p>

                <div className="mt-4 pt-3 border-t border-[var(--border-glass)] space-y-1.5 text-xs text-text-muted">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{cert.club?.name || cert.clubName || 'College Club'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span>
                      Issued on{' '}
                      {new Date(cert.issueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-[var(--border-glass)]">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <a
                    href={certificateService.getDownloadUrl(cert.certificateId)}
                    download
                    className="py-2 px-3 rounded-xl bg-primary hover:bg-primary-hover text-cream text-xs font-semibold shadow-warm-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                  <a
                    href={certificateService.getViewUrl(cert.certificateId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl glass-button text-text-main text-xs font-semibold border border-[var(--border-glass)] hover:bg-sand/40 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-primary" /> View PDF
                  </a>
                </div>

                <div className="flex items-center justify-between gap-1 pt-1">
                  <a
                    href={getLinkedInShareUrl(cert)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-text-muted hover:text-primary flex items-center gap-1 transition-colors py-1 px-1.5 rounded-lg hover:bg-sand/30"
                  >
                    <Share2 className="w-3 h-3 text-accent" /> Add to LinkedIn
                  </a>

                  <button
                    onClick={() => handleCopyLink(cert.certificateId)}
                    className="text-[11px] font-semibold text-text-muted hover:text-primary flex items-center gap-1 transition-colors py-1 px-1.5 rounded-lg hover:bg-sand/30"
                  >
                    {copiedId === cert.certificateId ? (
                      <>
                        <Check className="w-3 h-3 text-primary" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-gold" /> Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCertificates;
