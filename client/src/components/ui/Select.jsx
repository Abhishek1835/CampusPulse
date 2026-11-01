import React, { forwardRef } from 'react';

export const Select = forwardRef(
  (
    {
      label,
      options = [],
      error,
      helperText,
      className = '',
      id,
      placeholder = 'Select an option',
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-text-main tracking-wide"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full glass-input px-3.5 py-2.5 text-sm rounded-2xl transition duration-200 focus:outline-none bg-surface-glass-strong dark:bg-surface-glass-strong text-text-main ${
            error
              ? 'border-danger/80 focus:border-danger focus:ring-danger/20'
              : 'border-border-glass-subtle'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const value = typeof opt === 'object' ? opt.value || opt.id : opt;
            const labelText = typeof opt === 'object' ? opt.label || opt.name : opt;
            return (
              <option
                key={value}
                value={value}
                className="bg-bg-soft dark:bg-bg-base text-text-main"
              >
                {labelText}
              </option>
            );
          })}
        </select>
        {error && <p className="text-xs text-danger font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
