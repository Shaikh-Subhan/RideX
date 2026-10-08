import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const TrustScoreBadge = ({ score = 100, size = 'md', showLabel = true }) => {
  const { isDark } = useTheme();
  const numScore = Math.min(100, Math.max(0, Number(score) || 0));

  let colorClasses = isDark
    ? 'bg-rx-accent-soft/40 text-rx-accent border-rx-accent-border/60'
    : 'bg-rx-accent-soft text-rx-accent border-rx-accent-border';
  let badgeText = 'Excellent';

  if (numScore >= 85) {
    colorClasses = isDark
      ? 'bg-rx-accent-soft/40 text-rx-accent border-rx-accent-border/60'
      : 'bg-rx-accent-soft text-rx-accent border-rx-accent-border';
    badgeText = 'Top Renter';
  } else if (numScore >= 70) {
    colorClasses = isDark
      ? 'bg-rx-accent-soft/40 text-rx-accent border-rx-accent-border/60'
      : 'bg-rx-accent-soft text-rx-accent border-rx-accent-border';
    badgeText = 'Trusted';
  } else if (numScore >= 50) {
    colorClasses = isDark
      ? 'bg-rx-accent-soft/30 text-rx-accent border-rx-accent-border/50'
      : 'bg-rx-accent-soft text-rx-accent border-rx-accent-border';
    badgeText = 'Fair';
  } else {
    colorClasses = isDark
      ? 'bg-rx-accent-soft/40 text-rx-accent border-rx-accent-border/60'
      : 'bg-rx-accent-soft text-rx-accent border-rx-accent-border';
    badgeText = 'Needs Review';
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg font-bold border transition-colors ${colorClasses} ${
        sizeClasses[size] || sizeClasses.md
      }`}
      title={`Renter Trust Score: ${numScore}/100`}
    >
      {numScore >= 70 ? (
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
      ) : (
        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
      )}
      <span>{numScore}/100</span>
      {showLabel && <span className="opacity-80 font-normal text-[11px]">({badgeText})</span>}
    </div>
  );
};

export default TrustScoreBadge;
