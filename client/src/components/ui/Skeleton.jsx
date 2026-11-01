import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-primary-soft/45 dark:bg-primary-soft/25 rounded-2xl ${className}`}
      {...props}
    />
  );
};

export const EventCardSkeleton = () => {
  return (
    <div className="glass-panel rounded-3xl p-5 flex flex-col space-y-4 border border-border-glass">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="space-y-2">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-md" />
      </div>
      <div className="pt-3 border-t border-border-glass-subtle flex justify-between items-center">
        <Skeleton className="h-8 w-24 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-2xl" />
      </div>
    </div>
  );
};
