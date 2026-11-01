import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { statsService } from '../../services/statsService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import {
  CalendarDays,
  Users,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Percent,
  QrCode,
  Award,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const PALETTE_COLORS = ['#5F7F5B', '#C9895A', '#D8B168', '#4C6A49', '#9B7653', '#7B9075'];

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await statsService.getOrganizerStats();
        if (res?.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Error fetching organizer stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const overview = stats?.overview || {
    totalEvents: 0,
    upcomingEventsCount: 0,
    totalRegistrations: 0,
    seatsFilledPercentage: 0
  };

  const registrationsOverTime = stats?.registrationsOverTime || [];
  const categoryDistribution = stats?.categoryDistribution || [];
  const recentRegistrations = stats?.recentRegistrations || [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-main">
            Club Overview & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1.5">
            Managing events for{' '}
            <strong className="text-primary font-semibold">
              {user?.club?.name}
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            icon={PlusCircle}
            onClick={() => navigate('/organizer/events/new')}
          >
            Create New Event
          </Button>
        </div>
      </div>

      {/* Summary Stat Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="glass-panel p-5 rounded-3xl border border-[var(--border-glass)] shadow-warm-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Total Club Events
            </span>
            <div className="p-2.5 rounded-xl bg-primary-soft text-primary">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-serif text-3xl font-bold text-text-main">
              <AnimatedCounter target={overview.totalEvents} />
            </p>
            <p className="text-xs text-text-muted mt-1">All-time hosted</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel p-5 rounded-3xl border border-[var(--border-glass)] shadow-warm-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Total Registrations
            </span>
            <div className="p-2.5 rounded-xl bg-accent-soft text-accent">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-serif text-3xl font-bold text-text-main">
              <AnimatedCounter target={overview.totalRegistrations} />
            </p>
            <p className="text-xs text-text-muted mt-1">Active registered students</p>
          </div>
        </div>

        {/* Card 3: Attendance Turnout */}
        <div className="glass-panel p-5 rounded-3xl border border-[var(--border-glass)] shadow-warm-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Attendance Turnout
            </span>
            <div className="p-2.5 rounded-xl bg-primary-soft text-primary">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-serif text-3xl font-bold text-primary">
              <AnimatedCounter target={overview.attendanceRate || 0} suffix="%" />
            </p>
            <p className="text-xs text-text-muted mt-1">
              {overview.totalAttendance || 0} attendees verified ({overview.onTimeAttendance || 0} on-time)
            </p>
          </div>
        </div>

        {/* Card 4: Certificates Issued */}
        <div className="glass-panel p-5 rounded-3xl border border-[var(--border-glass)] shadow-warm-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Certificates Issued
            </span>
            <div className="p-2.5 rounded-xl bg-gold/20 text-gold">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-serif text-3xl font-bold text-accent">
              <AnimatedCounter target={overview.totalCertificatesIssued || 0} />
            </p>
            <p className="text-xs text-text-muted mt-1">Automated verifiable credentials</p>
          </div>
        </div>

        {/* Card 5 */}
        <div className="glass-panel p-5 rounded-3xl border border-[var(--border-glass)] shadow-warm-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Upcoming Events
            </span>
            <div className="p-2.5 rounded-xl bg-primary-soft text-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-serif text-3xl font-bold text-text-main">
              <AnimatedCounter target={overview.upcomingEventsCount} />
            </p>
            <p className="text-xs text-text-muted mt-1">Scheduled ahead</p>
          </div>
        </div>

        {/* Card 6 */}
        <div className="glass-panel p-5 rounded-3xl border border-[var(--border-glass)] shadow-warm-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Capacity Filled
            </span>
            <div className="p-2.5 rounded-xl bg-gold/20 text-gold">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-serif text-3xl font-bold text-text-main">
              <AnimatedCounter target={overview.seatsFilledPercentage} suffix="%" />
            </p>
            <p className="text-xs text-text-muted mt-1">Overall venue fill rate</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registrations Over Time (AreaChart) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-[var(--border-glass)] shadow-warm-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-bold text-text-main">
                Registrations Timeline
              </h3>
              <p className="text-xs text-text-muted">Daily registrations over the last 7 days</p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationsOverTime}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5F7F5B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#5F7F5B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-glass-strong)',
                    borderColor: 'var(--border-glass)',
                    borderRadius: '16px',
                    color: 'var(--text-main)',
                    boxShadow: '0 8px 30px rgba(95, 80, 55, 0.12)',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  stroke="#5F7F5B"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorReg)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (PieChart) */}
        <div className="glass-panel p-6 rounded-3xl border border-[var(--border-glass)] shadow-warm-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-text-main">
              Event Categories
            </h3>
            <p className="text-xs text-text-muted">Distribution across disciplines</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PALETTE_COLORS[index % PALETTE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface-glass-strong)',
                      borderColor: 'var(--border-glass)',
                      borderRadius: '16px',
                      color: 'var(--text-main)',
                      boxShadow: '0 8px 30px rgba(95, 80, 55, 0.12)',
                      fontSize: '12px'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-text-muted">No events categorized yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="glass-panel rounded-3xl p-6 border border-[var(--border-glass)] shadow-warm-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-text-main">
              Recent Registrations
            </h3>
            <p className="text-xs text-text-muted">
              Latest students signing up for your club events
            </p>
          </div>
          <Link
            to="/organizer/events"
            className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline flex items-center gap-1"
          >
            Manage Events <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentRegistrations.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-6">
            No registrations received yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-glass)] text-text-muted uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">USN</th>
                  <th className="py-2.5 px-3">Event</th>
                  <th className="py-2.5 px-3">Team Name</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-glass)]">
                {recentRegistrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-primary-soft/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-text-main">
                      {reg.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-text-muted">{reg.usn}</td>
                    <td className="py-3 px-3 max-w-[200px] truncate text-text-main font-medium">
                      {reg.event?.title || 'Unknown Event'}
                    </td>
                    <td className="py-3 px-3 text-text-muted">
                      {reg.teamName || '—'}
                    </td>
                    <td className="py-3 px-3 text-text-muted">
                      {new Date(reg.registeredAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          reg.status === 'attended'
                            ? 'success'
                            : reg.status === 'cancelled'
                            ? 'danger'
                            : 'primary'
                        }
                        size="xs"
                      >
                        {reg.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
