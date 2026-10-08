import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const Badge = ({ status, variant, children, className = '' }) => {
  const { isDark } = useTheme();
  const norm = (status || children || '').toString().toLowerCase();

  let styles = isDark
    ? 'bg-rx-surface text-rx-muted border-rx-border'
    : 'bg-rx-surface text-rx-main border-rx-border';

  if (
    norm.includes('verified') ||
    norm.includes('approved') ||
    norm.includes('completed') ||
    norm.includes('paid')
  ) {
    styles = isDark
      ? 'bg-rx-accent-soft/50 text-rx-accent border-rx-accent-border/60'
      : 'bg-rx-accent-soft text-rx-accent border-rx-accent-border';
  } else if (
    norm.includes('pending') ||
    norm.includes('partial') ||
    norm.includes('created')
  ) {
    styles = isDark
      ? 'bg-rx-accent-soft/50 text-rx-accent border-rx-accent-border/60'
      : 'bg-rx-accent-soft text-rx-accent border-rx-accent-border';
  } else if (
    norm.includes('rejected') ||
    norm.includes('cancelled') ||
    norm.includes('failed')
  ) {
    styles = isDark
      ? 'bg-rx-accent-soft/50 text-rx-accent border-rx-accent-border/60'
      : 'bg-rx-accent-soft text-rx-accent border-rx-accent-border';
  } else if (norm.includes('refunded')) {
    styles = isDark
      ? 'bg-rx-accent-soft/50 text-rx-accent border-rx-accent-border/60'
      : 'bg-rx-accent-soft text-rx-accent border-rx-accent-border';
  } else if (norm.includes('renter')) {
    styles = isDark
      ? 'bg-rx-surface text-rx-muted border-rx-border'
      : 'bg-rx-surface text-rx-main border-rx-border';
  } else if (norm.includes('owner')) {
    styles = isDark
      ? 'bg-rx-accent-soft/40 text-rx-accent border-rx-accent-border/50'
      : 'bg-rx-accent-soft text-rx-accent border-rx-accent-border';
  } else if (norm.includes('admin')) {
    styles = isDark
      ? 'bg-rx-accent-soft/40 text-rx-accent border-rx-accent-border/50'
      : 'bg-rx-accent-soft text-rx-accent border-rx-accent-border';
  }

  if (variant === 'success') {
    styles = isDark
      ? 'bg-rx-accent-soft/50 text-rx-accent border-rx-accent-border/60'
      : 'bg-rx-accent-soft text-rx-accent border-rx-accent-border';
  }
  if (variant === 'warning') {
    styles = isDark
      ? 'bg-rx-accent-soft/50 text-rx-accent border-rx-accent-border/60'
      : 'bg-rx-accent-soft text-rx-accent border-rx-accent-border';
  }
  if (variant === 'danger') {
    styles = isDark
      ? 'bg-rx-accent-soft/50 text-rx-accent border-rx-accent-border/60'
      : 'bg-rx-accent-soft text-rx-accent border-rx-accent-border';
  }
  if (variant === 'info') {
    styles = isDark
      ? 'bg-rx-surface text-rx-accent border-rx-border'
      : 'bg-rx-accent-soft text-rx-accent border-rx-accent-border';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold capitalize border tracking-wide transition-colors ${styles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {children || status}
    </span>
  );
};

export default Badge;
