import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Compass, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-[var(--border-glass)] text-center max-w-md shadow-warm-lg space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-soft border border-primary/25 flex items-center justify-center text-primary">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-5xl font-bold text-primary">
          404
        </h1>
        <h2 className="font-serif text-lg font-bold text-text-main">
          Page Not Found
        </h2>
        <p className="text-xs text-text-muted">
          The campus path you're trying to reach does not exist or has been relocated.
        </p>
        <div className="pt-2 flex justify-center">
          <Link to="/">
            <Button variant="primary" size="md" icon={Home}>
              Back to Campus Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
