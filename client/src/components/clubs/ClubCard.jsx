import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { ArrowRight, Calendar, CheckCircle2 } from 'lucide-react';

export const ClubCard = ({ club }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="glass-panel rounded-3xl overflow-hidden flex flex-col h-full border border-[var(--border-glass)] shadow-warm-sm hover:shadow-warm-md hover:border-primary/40 transition-all duration-300"
    >
      {/* Banner & Logo */}
      <div className="relative h-32 w-full bg-bg-soft">
        <img
          src={
            club.banner ||
            'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80'
          }
          alt={club.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />

        <div className="absolute -bottom-5 left-5 w-14 h-14 rounded-2xl p-0.5 glass-panel-strong border border-white/60 shadow-warm-sm overflow-hidden bg-bg-soft">
          <img
            src={
              club.logo ||
              'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&auto=format&fit=crop&q=80'
            }
            alt={club.name}
            className="w-full h-full object-cover rounded-xl"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&auto=format&fit=crop&q=80';
            }}
          />
        </div>

        <div className="absolute top-3 right-3">
          <Badge variant={club.category} size="xs">
            {club.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="pt-8 p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-serif text-base font-bold text-text-main line-clamp-1 hover:text-primary transition-colors">
              {club.name}
            </h3>
            {club.isVerified && (
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
            )}
          </div>
          {club.tagline && (
            <p className="text-xs font-medium text-accent line-clamp-1 mt-0.5">
              "{club.tagline}"
            </p>
          )}
          <p className="text-xs text-text-muted line-clamp-2 mt-2 leading-relaxed">
            {club.description}
          </p>
        </div>

        {/* Footer info: Events count & Action */}
        <div className="pt-3 border-t border-[var(--border-glass)] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>{club.eventCount || 0} Events hosted</span>
          </div>
          <Link
            to={`/clubs/${club.slug}`}
            className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
          >
            Explore Club <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
