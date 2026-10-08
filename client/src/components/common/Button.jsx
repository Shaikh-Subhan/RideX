import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rx-accent select-none';

  const sizeClasses = {
    xs: 'px-2.5 py-1 text-[11px] gap-1.5',
    sm: 'px-3 py-1.5 text-xs gap-2',
    md: 'px-4 py-2 text-xs sm:text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm sm:text-base gap-2.5',
  };

  const variantClasses = {
    // Primary Amber Accent Button
    primary:
      'bg-rx-accent text-rx-on-accent hover:bg-rx-accent-hover active:bg-rx-accent-hover shadow-sm hover:shadow-rx border border-rx-accent',
    // Dark Surface Secondary Button
    secondary:
      'bg-rx-surface text-rx-main hover:bg-rx-border active:bg-rx-card border border-rx-border hover:border-rx-border-strong',
    // Dark Outline Button with Amber Hover
    outline:
      'bg-rx-transparent text-rx-main hover:text-rx-accent hover:bg-rx-card active:bg-rx-surface border border-rx-border hover:border-rx-accent/60',
    // Danger / Destructive Button
    danger:
      'bg-rx-accent-soft/10 text-rx-accent hover:bg-rx-accent hover:text-rx-main border border-rx-accent-border/30 hover:border-rx-accent-border',
    // Ghost Minimal Button
    ghost:
      'bg-rx-transparent text-rx-muted hover:text-rx-main hover:bg-rx-card active:bg-rx-surface border border-rx-transparent',
    // Success Button
    success:
      'bg-rx-accent-soft/10 text-rx-accent hover:bg-rx-accent hover:text-rx-main border border-rx-accent-border/30 hover:border-rx-accent-border',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${
        variantClasses[variant] || variantClasses.primary
      } ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : LeftIcon ? (
        <LeftIcon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
      {!loading && RightIcon ? <RightIcon className="w-4 h-4 shrink-0" /> : null}
    </button>
  );
};

export default Button;
