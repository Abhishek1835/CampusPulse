import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      type = 'text',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-text-main tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-2xl">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
              <Icon className="w-4 h-4 stroke-[1.75]" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={`w-full glass-input px-3.5 py-2.5 text-sm rounded-2xl transition duration-200 placeholder:text-text-muted/50 focus:outline-none ${
              Icon ? 'pl-10' : ''
            } ${
              error
                ? 'border-danger/80 focus:border-danger focus:ring-danger/20'
                : 'border-border-glass-subtle'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-danger font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
