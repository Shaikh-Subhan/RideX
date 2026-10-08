import React from 'react';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs py-1.5 px-3',
    md: 'text-xs sm:text-sm py-2 px-4',
    lg: 'text-sm sm:text-base py-2.5 px-5',
  };

  return (
    <div
      role="tablist"
      className={`inline-flex items-center gap-1 p-1 bg-rx-card rounded-xl border border-rx-border select-none ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 font-bold rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap ${
              sizeClasses[size] || sizeClasses.md
            } ${
              isActive
                ? 'bg-rx-surface text-rx-main border border-rx-border shadow-sm'
                : 'text-rx-muted hover:text-rx-main hover:bg-rx-surface/50 border border-rx-transparent'
            }`}
          >
            {Icon && <Icon className="w-4 h-4 shrink-0" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums ${
                  isActive
                    ? 'bg-rx-accent text-rx-on-accent'
                    : 'bg-rx-border text-rx-muted'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
