import React from 'react';
import { Car } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Car,
  title = 'No vehicles found',
  description = 'Try adjusting your filters or search terms to find what you are looking for.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-14 bg-rx-card rounded-2xl border border-rx-border ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-rx-surface border border-rx-border flex items-center justify-center text-rx-accent mb-4 shadow-md">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-rx-main mb-2">{title}</h3>
      <p className="text-sm text-rx-muted max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent font-bold text-xs transition-colors shadow-md cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
