import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clubService } from '../services/clubService';
import { EventCard } from '../components/events/EventCard';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import {
  Calendar,
  Globe,
  Instagram,
  Linkedin,
  MessageSquare,
  Mail,
  Phone,
  CheckCircle2,
  ArrowLeft,
  GraduationCap
} from 'lucide-react';

export const ClubDetails = () => {
  const { slug } = useParams();
  const [clubData, setClubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await clubService.getClubBySlug(slug);
        if (res?.data) {
          setClubData(res.data);
        }
      } catch (err) {
        console.error('Error loading club:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClub();
  }, [slug]);

  if (loading || !clubData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { club, upcomingEvents = [], pastEvents = [] } = clubData;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        to="/clubs"
        className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all clubs
      </Link>

      {/* Club Banner Header */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-[var(--border-glass)] shadow-warm-lg">
        <div className="h-48 sm:h-64 w-full bg-bg-soft relative">
          <img
            src={
              club.banner ||
              'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80'
            }
            alt={club.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        {/* Profile Info Overlay */}
        <div className="px-6 pb-6 pt-0 relative -mt-16 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl glass-panel-strong p-1 border border-white/60 shadow-warm-md bg-bg-soft overflow-hidden flex-shrink-0">
              <img
                src={club.logo}
                alt={club.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-xl sm:text-3xl font-bold text-cream">
                  {club.name}
                </h1>
                {club.isVerified && (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                )}
              </div>
              {club.tagline && (
                <p className="text-xs sm:text-sm font-medium text-cream/90 italic">
                  "{club.tagline}"
                </p>
              )}
              <div className="flex items-center gap-2 pt-1">
                <Badge variant={club.category} size="xs">
                  {club.category}
                </Badge>
                <span className="text-[11px] text-cream/80">
                  Est. {club.foundedYear || 2020}
                </span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            {club.socialLinks?.website && (
              <a
                href={club.socialLinks.website}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl glass-panel text-cream hover:text-white hover:bg-primary-soft/30 transition-colors"
                title="Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
            {club.socialLinks?.instagram && (
              <a
                href={club.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl glass-panel text-cream hover:text-white hover:bg-primary-soft/30 transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {club.socialLinks?.linkedin && (
              <a
                href={club.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl glass-panel text-cream hover:text-white hover:bg-primary-soft/30 transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {club.socialLinks?.discord && (
              <a
                href={club.socialLinks.discord}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl glass-panel text-cream hover:text-white hover:bg-primary-soft/30 transition-colors"
                title="Discord Server"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Club Bio & Events */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Club */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-glass)] shadow-warm-xs space-y-3">
            <h2 className="font-serif text-lg font-bold text-text-main">
              About the Club
            </h2>
            <p className="text-sm text-text-main leading-relaxed whitespace-pre-line font-normal">
              {club.description}
            </p>
          </div>

          {/* Events Tabs: Upcoming vs Past */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[var(--border-glass)] pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('upcoming')}
                className={`text-sm font-bold pb-1 transition-all ${
                  activeTab === 'upcoming'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                Upcoming Events ({upcomingEvents.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('past')}
                className={`text-sm font-bold pb-1 transition-all ${
                  activeTab === 'past'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                Past Events ({pastEvents.length})
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'upcoming' ? (
              upcomingEvents.length === 0 ? (
                <EmptyState
                  title="No upcoming events"
                  description="This club does not currently have any scheduled events. Check back soon!"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {upcomingEvents.map((ev) => (
                    <EventCard key={ev._id} event={ev} />
                  ))}
                </div>
              )
            ) : pastEvents.length === 0 ? (
              <EmptyState
                title="No past events"
                description="No historical events recorded for this club yet."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {pastEvents.map((ev) => (
                  <EventCard key={ev._id} event={ev} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Faculty Coordinator & Contact Info */}
        <div className="space-y-6">
          {/* Faculty Coordinator Card */}
          {club.facultyCoordinator?.name && (
            <div className="glass-panel p-6 rounded-3xl border border-[var(--border-glass)] shadow-warm-xs space-y-3">
              <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                <span>Faculty Coordinator</span>
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-text-main">
                  {club.facultyCoordinator.name}
                </h4>
                <p className="text-xs text-text-muted">Department Faculty Advisor</p>
              </div>

              {club.facultyCoordinator.email && (
                <a
                  href={`mailto:${club.facultyCoordinator.email}`}
                  className="flex items-center gap-2 text-xs text-text-muted hover:text-primary transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span className="truncate">{club.facultyCoordinator.email}</span>
                </a>
              )}
              {club.facultyCoordinator.phone && (
                <a
                  href={`tel:${club.facultyCoordinator.phone}`}
                  className="flex items-center gap-2 text-xs text-text-muted hover:text-primary transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-accent" />
                  <span>{club.facultyCoordinator.phone}</span>
                </a>
              )}
            </div>
          )}

          {/* Official Contact Info */}
          <div className="glass-panel p-6 rounded-3xl border border-[var(--border-glass)] shadow-warm-xs space-y-3">
            <span className="font-serif text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Club Office Contact
            </span>
            <div className="space-y-2 text-xs">
              <a
                href={`mailto:${club.contactEmail}`}
                className="flex items-center gap-2 text-text-main hover:text-primary transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span className="truncate">{club.contactEmail}</span>
              </a>
              {club.contactPhone && (
                <a
                  href={`tel:${club.contactPhone}`}
                  className="flex items-center gap-2 text-text-main hover:text-primary transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-accent" />
                  <span>{club.contactPhone}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
