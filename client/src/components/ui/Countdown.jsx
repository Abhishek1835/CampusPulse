import React, { useState, useEffect } from 'react';

export const Countdown = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.expired) {
    return (
      <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-bg-soft/80 border border-border-glass-subtle text-xs font-semibold text-text-muted">
        Event Concluded
      </div>
    );
  }

  const items = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds }
  ];

  return (
    <div className="flex items-center gap-2">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex flex-col items-center justify-center min-w-[56px] py-1.5 px-2 rounded-2xl glass-panel border border-border-glass shadow-sm"
        >
          <span className="text-lg sm:text-xl font-editorial font-bold text-accent leading-tight">
            {String(item.value).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};
