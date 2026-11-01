import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  onClick,
  icon: Icon,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 focus:ring-offset-bg-base disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5'
  };

  const variantClasses = {
    primary:
      'bg-primary hover:bg-primary-hover text-[#FDFBF7] shadow-sm hover:shadow-warm hover:-translate-y-0.5 active:translate-y-0 border border-primary/30',
    accent:
      'bg-accent hover:bg-accent-hover text-[#FDFBF7] shadow-sm hover:shadow-warm hover:-translate-y-0.5 active:translate-y-0 border border-accent/30',
    secondary:
      'glass-panel text-text-main hover:bg-primary-soft/40 border border-border-glass-subtle shadow-sm hover:-translate-y-0.5 active:translate-y-0',
    outline:
      'bg-transparent border border-primary/40 text-primary hover:bg-primary-soft/40',
    danger:
      'bg-danger hover:bg-danger/90 text-[#FDFBF7] shadow-sm hover:-translate-y-0.5 active:translate-y-0',
    ghost:
      'bg-transparent text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5'
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></span>
      ) : (
        Icon && <Icon className="w-4 h-4 flex-shrink-0 stroke-[1.75]" />
      )}
      {children}
    </motion.button>
  );
};
