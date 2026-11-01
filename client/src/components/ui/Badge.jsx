import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px] font-semibold tracking-wide',
    sm: 'px-2.5 py-1 text-xs font-semibold tracking-wide',
    md: 'px-3 py-1.5 text-xs font-semibold tracking-wide'
  };

  const variantClasses = {
    default:
      'bg-bg-soft/80 text-text-muted border border-border-glass-subtle',
    primary:
      'bg-[#5F7F5B]/15 text-[#3E5C3B] dark:bg-[#9DBB8F]/20 dark:text-[#C4DCB9] border border-[#5F7F5B]/30',
    // Categories: Soft pastel earthy chips
    technical:
      'bg-[#5F7F5B]/15 text-[#3D573A] dark:bg-[#9DBB8F]/20 dark:text-[#B9D5AD] border border-[#5F7F5B]/30',
    cultural:
      'bg-[#C9895A]/15 text-[#8F5529] dark:bg-[#D9A074]/20 dark:text-[#E8BA95] border border-[#C9895A]/30',
    sports:
      'bg-[#D8B168]/20 text-[#825F18] dark:bg-[#E5C27E]/20 dark:text-[#ECD19A] border border-[#D8B168]/35',
    workshop:
      'bg-[#9B7653]/15 text-[#6B4E33] dark:bg-[#BFA58D]/20 dark:text-[#DFCFC2] border border-[#9B7653]/30',
    seminar:
      'bg-[#6B7A4E]/15 text-[#48562F] dark:bg-[#A3B383]/20 dark:text-[#C5D1AC] border border-[#6B7A4E]/30',
    hackathon:
      'bg-[#406343]/15 text-[#2B472E] dark:bg-[#7DA680]/20 dark:text-[#A8C8AA] border border-[#406343]/30',
    other:
      'bg-[#787265]/15 text-[#4D483F] dark:bg-[#A8A396]/20 dark:text-[#CBC7BE] border border-[#787265]/30',
    // Status & Utility
    success:
      'bg-[#6E9A62]/15 text-[#456A3C] dark:bg-[#85AF78]/20 dark:text-[#B9DBAF] border border-[#6E9A62]/30',
    warning:
      'bg-[#D9A441]/15 text-[#8C6418] dark:bg-[#E2B356]/20 dark:text-[#EAD098] border border-[#D9A441]/30',
    danger:
      'bg-[#B9573F]/15 text-[#8A3723] dark:bg-[#CF6D55]/20 dark:text-[#E49E8E] border border-[#B9573F]/30',
    free:
      'bg-[#5F7F5B]/15 text-[#3D573A] dark:bg-[#9DBB8F]/20 dark:text-[#B9D5AD] border border-[#5F7F5B]/30 font-bold',
    paid:
      'bg-[#C9895A]/15 text-[#8F5529] dark:bg-[#D9A074]/20 dark:text-[#E8BA95] border border-[#C9895A]/30 font-bold'
  };

  const mappedVariant = variantClasses[variant] || variantClasses.default;

  return (
    <span
      className={`inline-flex items-center rounded-full capitalize select-none ${sizeClasses[size]} ${mappedVariant} ${className}`}
    >
      {children}
    </span>
  );
};
