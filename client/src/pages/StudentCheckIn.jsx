import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/attendanceService';
import api from '../services/api';
import {
  QrCode,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Camera
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export const StudentCheckIn = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'code'
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [locationCoords, setLocationCoords] = useState(null);
  const [locationError, setLocationError] = useState(null);

  const scannerRef = useRef(null);

  // Fetch student's registered events happening today/upcoming
  useEffect(() => {
    fetchRegisteredEvents();
    requestLocation();
  }, []);

  const requestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
          setLocationError(null);
        },
        (err) => {
          console.warn('Geolocation warning:', err.message);
          setLocationError('Location access was denied. On-site geofenced events require GPS.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const res = await api.get('/registrations/mine');
      if (res.success && res.data) {
        // Filter events that have attendance enabled
        const active = res.data
          .filter((r) => r.status !== 'cancelled' && r.event)
          .map((r) => r.event);
        setRegisteredEvents(active);
        if (active.length > 0) {
          setSelectedEventId(active[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load registered events:', err);
    }
  };

  // Setup html5-qrcode scanner when activeTab is 'qr' and not completed
  useEffect(() => {
    if (activeTab === 'qr' && !scanResult) {
      setScanning(true);
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true
        },
        false
      );

      scanner.render(
        (decodedText) => {
          handleScannedData(decodedText);
          scanner.clear();
          setScanning(false);
        },
        (error) => {
          // ignore continuous scanning frame misses
        }
      );

      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(() => {});
        }
      };
    }
  }, [activeTab, scanResult, selectedEventId]);

  const handleScannedData = async (decodedText) => {
    let targetEventId = selectedEventId;
    let token = decodedText;

    // Check if QR data is JSON with { eventId, token }
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed.eventId && parsed.token) {
        targetEventId = parsed.eventId;
        token = parsed.token;
      }
    } catch (e) {
      // plain token string
    }

    if (!targetEventId) {
      toast.error('Please select the event you are attending from the dropdown.');
      return;
    }

    await submitAttendance({
      eventId: targetEventId,
      qrToken: token
    });
  };

  // Handle 6-Digit code input change
  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...codeDigits];
    newDigits[index] = value.slice(-1);
    setCodeDigits(newDigits);

    // Auto focus next box
    if (value && index < 5) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      const prevInput = document.getElementById(`digit-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    const code = codeDigits.join('');
    if (code.length !== 6) {
      toast.error('Please enter the full 6-digit event code');
      return;
    }
    if (!selectedEventId) {
      toast.error('Please select an event');
      return;
    }

    await submitAttendance({
      eventId: selectedEventId,
      code
    });
  };

  const submitAttendance = async ({ eventId, qrToken, code }) => {
    setLoading(true);
    try {
      const res = await attendanceService.checkIn(eventId, {
        qrToken,
        code,
        latitude: locationCoords?.latitude,
        longitude: locationCoords?.longitude
      });

      if (res.success) {
        setScanResult(res.data);
        if (res.data.status === 'on-time') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#5F7F5B', '#D8B168', '#C9895A', '#FAF5E9']
          });
          toast.success('Attendance recorded: On-Time Check-In verified!');
        } else {
          toast('Attendance recorded as Late Check-In', { icon: '⚠️' });
        }
      }
    } catch (err) {
      toast.error(err.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setCodeDigits(['', '', '', '', '', '']);
  };

  const selectedEvent = registeredEvents.find((e) => e._id === selectedEventId);

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-text-main border border-primary/20 text-xs font-semibold mb-3">
          <Camera className="w-3.5 h-3.5 text-primary" />
          Live Event Attendance Scanner
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-main">
          Mark Event Check-In
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Logged in as <span className="font-bold text-text-main">{user?.name}</span> ({user?.usn})
        </p>
      </div>

      {/* Success Celebration View */}
      {scanResult ? (
        <div className="glass-panel-strong p-8 rounded-3xl border border-[var(--border-glass)] shadow-warm-lg text-center animate-fade-in">
          <div
            className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-4 ${
              scanResult.status === 'on-time'
                ? 'bg-primary-soft text-primary border border-primary/30'
                : 'bg-warning/15 text-warning border border-warning/30'
            }`}
          >
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
              scanResult.status === 'on-time'
                ? 'bg-primary-soft text-primary border border-primary/30'
                : 'bg-warning/15 text-warning border border-warning/30'
            }`}
          >
            {scanResult.status === 'on-time' ? 'On-Time Check-In Verified' : 'Late Arrival Recorded'}
          </span>

          <h2 className="font-serif text-2xl font-bold text-text-main">
            {scanResult.status === 'on-time' ? 'You are All Set!' : 'Attendance Recorded'}
          </h2>

          <p className="mt-2 text-sm text-text-muted">
            Timestamp:{' '}
            <span className="font-mono font-bold text-text-main">
              {new Date(scanResult.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>{' '}
            via {scanResult.method === 'qr' ? 'Dynamic QR' : 'Passcode'}
          </p>

          {scanResult.status === 'on-time' ? (
            <p className="mt-4 p-3 rounded-2xl bg-primary-soft/50 text-text-main text-xs border border-primary/20">
              🌿 <span className="font-semibold">Certificate Eligible:</span> You checked in within the allowed window. Your verifiable digital certificate will automatically issue after event completion.
            </p>
          ) : (
            <p className="mt-4 p-3 rounded-2xl bg-warning/10 text-text-main text-xs border border-warning/20">
              ⚠️ <span className="font-semibold">Notice:</span> Arrival was logged after the allowed on-time grace period. Event certificates are reserved for on-time attendees.
            </p>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/my-events"
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-cream text-sm font-semibold shadow-warm-sm transition-all"
            >
              View My Events
            </Link>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl glass-button text-text-main text-sm font-semibold border border-[var(--border-glass)] hover:bg-sand/40 transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" /> Check In Another Event
            </button>
          </div>
        </div>
      ) : (
        /* Check-In Input Form */
        <div className="glass-panel-strong rounded-3xl p-6 sm:p-8 border border-[var(--border-glass)] shadow-warm-lg">
          {/* Registered Event Selection */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Select Your Registered Event
            </label>
            {registeredEvents.length === 0 ? (
              <div className="p-4 rounded-2xl bg-sand/30 border border-[var(--border-glass)] text-center text-xs text-text-muted">
                No active registrations found. Please register for an event first.
              </div>
            ) : (
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl glass-input text-text-main text-sm font-medium border border-[var(--border-glass)] focus:outline-none focus:ring-2 focus:ring-primary/40 bg-sand/40"
              >
                {registeredEvents.map((ev) => (
                  <option key={ev._id} value={ev._id} className="bg-[#FAF5E9] text-[#2F3A2C]">
                    {ev.title} ({new Date(ev.date).toLocaleDateString()})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Tab Switcher: QR Code vs 6-Digit Passcode */}
          <div className="flex rounded-2xl bg-sand/50 p-1.5 mb-6 border border-[var(--border-glass)]">
            <button
              type="button"
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'qr'
                  ? 'bg-primary text-cream shadow-warm-sm'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <QrCode className="w-4 h-4" />
              Scan Live QR Code
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'code'
                  ? 'bg-primary text-cream shadow-warm-sm'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              Enter 6-Digit Code
            </button>
          </div>

          {/* TAB 1: Camera QR Scanner */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center">
              <p className="text-xs text-text-muted mb-4 text-center">
                Point your phone camera at the dynamic rotating QR code projected by the organizer.
              </p>
              <div
                id="qr-reader"
                className="w-full max-w-sm rounded-2xl overflow-hidden border border-[var(--border-glass)] bg-sand/20 shadow-warm-inner"
              />
              {loading && (
                <div className="mt-4 flex items-center gap-2 text-xs text-primary font-semibold">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying token signature...
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 6-Digit Passcode Input */}
          {activeTab === 'code' && (
            <form onSubmit={handleCodeSubmit} className="text-center">
              <p className="text-xs text-text-muted mb-6">
                Enter the temporary 6-digit attendance code shown on the event presentation screen.
              </p>
              <div className="flex justify-center gap-2 sm:gap-3 mb-6">
                {codeDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`digit-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                    className="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold font-mono rounded-2xl glass-input text-text-main border border-[var(--border-glass)] focus:outline-none focus:ring-2 focus:ring-primary shadow-warm-inner bg-sand/30"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || codeDigits.join('').length !== 6 || !selectedEventId}
                className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-cream text-sm font-semibold shadow-warm-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                ) : (
                  <>
                    Confirm Check-In <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Location Status Notice */}
          <div className="mt-6 pt-4 border-t border-[var(--border-glass)] flex items-center justify-between text-[11px] text-text-muted">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {locationCoords ? 'GPS Location active for geofence verification' : 'GPS location optional / inactive'}
            </span>
            <button onClick={requestLocation} className="text-primary hover:underline font-semibold">
              Refresh GPS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCheckIn;
