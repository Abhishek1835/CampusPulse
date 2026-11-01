import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { attendanceService } from '../../services/attendanceService';
import {
  QrCode,
  KeyRound,
  Maximize2,
  Minimize2,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Search,
  Plus,
  ArrowLeft,
  RefreshCw,
  Pause,
  Play,
  Settings,
  ShieldCheck,
  Building
} from 'lucide-react';
import toast from 'react-hot-toast';

export const LiveAttendance = () => {
  const { id: eventId } = useParams();

  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState(null);
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [remainingSec, setRemainingSec] = useState(30);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Attendance list & counters
  const [attendanceList, setAttendanceList] = useState([]);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalCheckedIn: 0,
    onTimeCount: 0,
    lateCount: 0,
    manualCount: 0,
    notCheckedIn: 0
  });

  // Manual Check-In Modal
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualUSN, setManualUSN] = useState('');
  const [manualReason, setManualReason] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);

  const containerRef = useRef(null);
  const timerRef = useRef(null);

  // Fetch token and attendance periodically
  useEffect(() => {
    fetchLiveToken();
    fetchAttendanceList();

    const tokenInterval = setInterval(() => {
      if (!isPaused) {
        fetchLiveToken();
      }
    }, 28000); // refresh every 28s

    const listInterval = setInterval(() => {
      fetchAttendanceList();
    }, 6000); // refresh attendees every 6s

    return () => {
      clearInterval(tokenInterval);
      clearInterval(listInterval);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [eventId, isPaused]);

  // Countdown timer for 30s token refresh
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    setRemainingSec(30);
    timerRef.current = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [tokenData]);

  const fetchLiveToken = async () => {
    try {
      const res = await attendanceService.getLiveAttendanceToken(eventId);
      if (res.success && res.data) {
        setTokenData(res.data);
        // Render QR Code image from payload
        const qrUrl = await QRCode.toDataURL(res.data.qrPayload || res.data.qrToken, {
          width: 380,
          margin: 1,
          color: {
            dark: '#1C211B',
            light: '#FAF5E9'
          }
        });
        setQrImageUrl(qrUrl);
      }
    } catch (err) {
      console.error('Failed to get live token:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceList = async () => {
    try {
      const res = await attendanceService.getEventAttendance(eventId);
      if (res.success && res.data) {
        setAttendanceList(res.data.attendance || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to get attendance stream:', err);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleManualCheckIn = async (e) => {
    e.preventDefault();
    if (!manualUSN.trim()) {
      toast.error('USN is required');
      return;
    }
    if (!manualReason.trim()) {
      toast.error('A mandatory audit reason is required for manual attendance');
      return;
    }

    setSubmittingManual(true);
    try {
      const res = await attendanceService.manualMarkAttendance(eventId, {
        usn: manualUSN.trim().toUpperCase(),
        reason: manualReason.trim(),
        status: 'manual'
      });
      if (res.success) {
        toast.success(res.message || 'Manual attendance recorded');
        setManualUSN('');
        setManualReason('');
        setManualModalOpen(false);
        fetchAttendanceList();
      }
    } catch (err) {
      toast.error(err.message || 'Manual check-in failed');
    } finally {
      setSubmittingManual(false);
    }
  };

  const attendancePercent =
    stats.totalRegistrations > 0
      ? Math.round((stats.totalCheckedIn / stats.totalRegistrations) * 100)
      : 0;

  return (
    <div
      ref={containerRef}
      className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors ${
        isFullscreen ? 'bg-[#FAF5E9] text-[#2F3A2C]' : ''
      }`}
    >
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-glass)] max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Link
            to="/organizer/events"
            className="p-2 rounded-xl glass-button text-text-main hover:bg-sand/40 border border-[var(--border-glass)] transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Live Attendance Projection Console
              </span>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-text-main">
              Projector Attendance Screen
            </h1>
          </div>
        </div>

        {/* Console Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isPaused
                ? 'bg-warning/15 text-warning border-warning/30'
                : 'glass-button text-text-main border-[var(--border-glass)] hover:bg-sand/40'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Resume QR Stream' : 'Pause'}
          </button>

          <button
            onClick={() => setManualModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-accent hover:bg-accent/90 text-cream text-xs font-semibold shadow-warm-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Manual USN Check-In
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl glass-button text-text-main hover:bg-sand/40 border border-[var(--border-glass)] transition-all"
            title="Toggle Projector Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Console Content */}
      <div className="max-w-7xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / CENTER: Big Dynamic QR & 6-Digit Code (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass-panel-strong rounded-3xl p-6 sm:p-8 border border-[var(--border-glass)] shadow-warm-lg flex flex-col items-center text-center">
            {/* Dynamic QR Refresh Progress */}
            <div className="w-full flex items-center justify-between text-xs text-text-muted mb-4 font-mono">
              <span className="flex items-center gap-1.5">
                <RefreshCw className={`w-3.5 h-3.5 text-primary ${isPaused ? '' : 'animate-spin'}`} />
                Dynamic HMAC QR Token
              </span>
              <span className="font-bold text-text-main">
                Refreshes in: <span className="text-primary">{remainingSec}s</span>
              </span>
            </div>

            {/* Progress Bar Line */}
            <div className="w-full bg-sand/50 h-1.5 rounded-full overflow-hidden mb-6 border border-[var(--border-glass)]">
              <div
                className="bg-primary h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(remainingSec / 30) * 100}%` }}
              />
            </div>

            {/* Giant QR Code Display */}
            <div className="relative p-4 rounded-3xl bg-[#FAF5E9] border-2 border-primary/30 shadow-warm-md flex items-center justify-center">
              {loading || !qrImageUrl ? (
                <div className="w-[300px] h-[300px] flex items-center justify-center text-xs text-text-muted">
                  Generating secure dynamic QR token...
                </div>
              ) : (
                <img
                  src={qrImageUrl}
                  alt="Dynamic Attendance QR"
                  className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] object-contain rounded-2xl"
                />
              )}
            </div>

            <p className="mt-4 text-xs font-semibold text-text-muted">
              Scan with your mobile camera or CampusPulse scanner at{' '}
              <span className="font-mono text-primary font-bold">/checkin</span>
            </p>

            {/* Big 6-Digit Fallback Code */}
            {tokenData?.code && (
              <div className="mt-6 w-full pt-6 border-t border-[var(--border-glass)] flex flex-col sm:flex-row items-center justify-between gap-3 bg-sand/30 p-4 rounded-2xl">
                <div className="text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-accent" /> Projector 6-Digit Passcode
                  </span>
                  <p className="text-xs text-text-muted">For students unable to scan camera QR</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-3xl font-extrabold tracking-widest text-text-main px-4 py-1.5 rounded-xl bg-sand/60 border border-[var(--border-glass)]">
                    {tokenData.code}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-[var(--border-glass)] shadow-warm-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                On-Time
              </span>
              <p className="font-serif text-2xl font-bold text-primary mt-1">{stats.onTimeCount}</p>
              <span className="text-[10px] text-primary/80">Certificate Eligible</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-[var(--border-glass)] shadow-warm-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Late Arrival
              </span>
              <p className="font-serif text-2xl font-bold text-warning mt-1">{stats.lateCount}</p>
              <span className="text-[10px] text-warning/80">Grace Exceeded</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-[var(--border-glass)] shadow-warm-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Manual Override
              </span>
              <p className="font-serif text-2xl font-bold text-accent mt-1">{stats.manualCount}</p>
              <span className="text-[10px] text-accent/80">Audit Approved</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-[var(--border-glass)] shadow-warm-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Turnout Rate
              </span>
              <p className="font-serif text-2xl font-bold text-text-main mt-1">{attendancePercent}%</p>
              <span className="text-[10px] text-text-muted">
                {stats.totalCheckedIn} / {stats.totalRegistrations} Registered
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Live Stream of Arriving Attendees (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="glass-panel-strong rounded-3xl p-6 border border-[var(--border-glass)] shadow-warm-lg flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-glass)]">
              <div>
                <h2 className="font-serif text-lg font-bold text-text-main flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  Live Arrival Stream
                </h2>
                <p className="text-xs text-text-muted">Real-time check-in audit feed</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-primary-soft text-text-main text-xs font-bold font-mono">
                {stats.totalCheckedIn} Present
              </span>
            </div>

            {/* Scrollable list of attendees */}
            <div className="mt-4 flex-1 overflow-y-auto max-h-[580px] space-y-2.5 pr-1">
              {attendanceList.length === 0 ? (
                <div className="text-center py-16 text-text-muted text-xs">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Waiting for participants to scan and check in...
                </div>
              ) : (
                attendanceList.map((att) => (
                  <div
                    key={att._id}
                    className="p-3 rounded-2xl bg-sand/30 border border-[var(--border-glass)] flex items-center justify-between gap-3 text-xs animate-fade-in"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-main truncate">
                          {att.student?.name || 'Student'}
                        </span>
                        <span className="font-mono text-[11px] text-text-muted">({att.usn})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-text-muted">
                        <span>
                          {new Date(att.checkInTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{att.method} check-in</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] shrink-0 ${
                        att.status === 'on-time'
                          ? 'bg-primary-soft text-primary border border-primary/30'
                          : att.status === 'late'
                          ? 'bg-warning/15 text-warning border border-warning/30'
                          : 'bg-accent/15 text-accent border border-accent/30'
                      }`}
                    >
                      {att.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-glass)] text-center">
              <Link
                to={`/organizer/events/${eventId}/participants`}
                className="text-xs font-semibold text-primary hover:underline"
              >
                View Full Participants Directory & Export CSV →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Attendance Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel-strong w-full max-w-md p-6 rounded-3xl border border-[var(--border-glass)] shadow-warm-lg">
            <h3 className="font-serif text-lg font-bold text-text-main flex items-center gap-2">
              <Plus className="w-5 h-5 text-accent" />
              Manual USN Attendance Entry
            </h3>
            <p className="mt-1 text-xs text-text-muted">
              Manually mark attendance with an auditable reason (e.g. phone camera issue, volunteer duty).
            </p>

            <form onSubmit={handleManualCheckIn} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                  Student University Seat Number (USN) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1BM22CS045"
                  value={manualUSN}
                  onChange={(e) => setManualUSN(e.target.value.toUpperCase())}
                  required
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-mono uppercase text-text-main border border-[var(--border-glass)] focus:outline-none focus:ring-2 focus:ring-primary/40 bg-sand/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                  Mandatory Audit Reason *
                </label>
                <textarea
                  placeholder="Reason for manual check-in override..."
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-text-main border border-[var(--border-glass)] focus:outline-none focus:ring-2 focus:ring-primary/40 bg-sand/40"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl glass-button text-xs font-semibold text-text-main border border-[var(--border-glass)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="px-5 py-2 rounded-xl bg-accent hover:bg-accent/90 text-cream text-xs font-semibold shadow-warm-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingManual ? 'Saving...' : 'Verify & Record Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveAttendance;
