import React from 'react';
import { Sprout } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = Sprout,
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div
      className={`glass-panel rounded-3xl p-10 sm:p-14 text-center flex flex-col items-center justify-center border border-border-glass ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-primary-soft/50 border border-primary/25 flex items-center justify-center text-primary mb-4 shadow-sm">
        <Icon className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h3 className="text-2xl font-editorial font-bold text-text-main mb-2">
        {title}
      </h3>
      <p className="text-sm text-text-muted max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
