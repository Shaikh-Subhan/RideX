import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'up', // 'up' | 'down' | 'neutral'
  subtitle,
  highlight = false,
  className = '',
}) => {
  return (
    <div
      className={`p-5 sm:p-6 rounded-2xl bg-rx-card border transition-all duration-200 ${
        highlight
          ? 'border-rx-accent/60 shadow-lg shadow-rx'
          : 'border-rx-border hover:border-rx-border-strong'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-4 mb-3">
        <span className="text-xs font-semibold text-rx-muted tracking-wide uppercase">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              highlight
                ? 'bg-rx-accent/10 border-rx-accent/30 text-rx-accent'
                : 'bg-rx-surface border-rx-border text-rx-muted'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-rx-main font-mono tabular-nums tracking-tight">
          {value}
        </div>
      </div>

      {(trend || subtitle) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                trendDirection === 'up'
                  ? 'text-rx-accent'
                  : trendDirection === 'down'
                  ? 'text-rx-accent'
                  : 'text-rx-muted'
              }`}
            >
              {trendDirection === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
              {trendDirection === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
              {trend}
            </span>
          )}
          {subtitle && (
            <span className="text-rx-muted truncate">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
