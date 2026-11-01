import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-danger/30 text-center max-w-md shadow-warm-lg space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-danger/10 border border-danger/25 flex items-center justify-center text-danger">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-5xl font-bold text-danger">403</h1>
        <h2 className="font-serif text-lg font-bold text-text-main">
          Access Restricted
        </h2>
        <p className="text-xs text-text-muted">
          You do not have the required permission level to access this portal or resource.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link to="/events">
            <Button variant="secondary" size="md">
              Student Events
            </Button>
          </Link>
          <Link to="/">
            <Button variant="primary" size="md" icon={ArrowLeft}>
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
