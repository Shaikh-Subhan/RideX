import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export const FormField = ({ label, error, helperText, required = false, children, className = '' }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-rx-muted flex items-center justify-between">
          <span>
            {label} {required && <span className="text-rx-accent">*</span>}
          </span>
        </label>
      )}
      {children}
      {error ? (
        <span className="text-[11px] text-rx-accent flex items-center gap-1 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </span>
      ) : helperText ? (
        <span className="text-[11px] text-rx-muted mt-0.5">{helperText}</span>
      ) : null}
    </div>
  );
};

export const Input = forwardRef(
  (
    {
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      error,
      className = '',
      type = 'text',
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative flex items-center w-full">
        {LeftIcon && (
          <div className="absolute left-3.5 pointer-events-none text-rx-muted">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full rounded-xl bg-rx-card text-rx-main placeholder-rx-muted/60 text-xs sm:text-sm px-3.5 py-2.5 border transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-rx-accent focus:border-rx-accent disabled:opacity-50 disabled:bg-rx-surface ${
            LeftIcon ? 'pl-10' : ''
          } ${RightIcon ? 'pr-10' : ''} ${
            error ? 'border-rx-accent-border/70 focus:border-rx-accent-border focus:ring-rx-accent-border' : 'border-rx-border'
          } ${className}`}
          {...props}
        />
        {RightIcon && (
          <div className="absolute right-3.5 pointer-events-none text-rx-muted">
            <RightIcon className="w-4 h-4" />
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export const Select = forwardRef(
  ({ error, children, className = '', ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full rounded-xl bg-rx-card text-rx-main text-xs sm:text-sm px-3.5 py-2.5 border transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-rx-accent focus:border-rx-accent disabled:opacity-50 disabled:bg-rx-surface cursor-pointer ${
          error ? 'border-rx-accent-border/70 focus:border-rx-accent-border focus:ring-rx-accent-border' : 'border-rx-border'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

export const Textarea = forwardRef(
  ({ error, className = '', rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full rounded-xl bg-rx-card text-rx-main placeholder-rx-muted/60 text-xs sm:text-sm p-3.5 border transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-rx-accent focus:border-rx-accent disabled:opacity-50 disabled:bg-rx-surface resize-y ${
          error ? 'border-rx-accent-border/70 focus:border-rx-accent-border focus:ring-rx-accent-border' : 'border-rx-border'
        } ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export default Input;
