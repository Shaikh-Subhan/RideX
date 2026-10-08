import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  leftIcon: LeftIcon,
  className = '',
  dropdownClassName = '',
  disabled = false,
  size = 'md', // 'sm' | 'md' | 'lg'
  name,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const { isDark = true } = useTheme ? useTheme() : { isDark: true };

  // Normalize options to { value, label, icon, badge, subtext }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: String(opt), label: String(opt) };
    }
    return {
      value: String(opt.value),
      label: opt.label || String(opt.value),
      icon: opt.icon,
      badge: opt.badge,
      subtext: opt.subtext,
    };
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === String(value));

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val) => {
    if (disabled) return;
    onChange(val);
    setIsOpen(false);
  };

  const sizeClasses = {
    sm: 'py-1.5 px-2.5 text-xs',
    md: 'py-2 px-3 text-xs',
    lg: 'py-2.5 px-3.5 text-sm',
  };

  return (
    <div ref={containerRef} className={`relative w-full select-none ${className}`}>
      {/* Trigger Field Box */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between rounded-xl border transition-all duration-150 text-left cursor-pointer ${
          sizeClasses[size] || sizeClasses.md
        } ${
          isDark
            ? 'bg-rx-surface text-rx-main border-rx-border hover:border-rx-border-strong'
            : 'bg-rx-card text-rx-main border-rx-border hover:border-rx-border shadow-xs'
        } ${
          isOpen
            ? isDark
              ? 'border-rx-accent ring-1 ring-rx-accent/30 shadow-lg shadow-rx'
              : 'border-rx-accent ring-1 ring-rx-accent/30 shadow-md shadow-rx'
            : ''
        } ${
          error ? 'border-rx-accent-border/70 focus:border-rx-accent-border' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          {LeftIcon && (
            <LeftIcon
              className={`w-3.5 h-3.5 shrink-0 ${
                isDark ? 'text-rx-accent' : 'text-rx-accent'
              }`}
            />
          )}
          {selectedOption?.icon && (
            <span className="shrink-0 text-sm leading-none">{selectedOption.icon}</span>
          )}
          <span
            className={`truncate font-medium capitalize ${
              !selectedOption && !value
                ? isDark
                  ? 'text-rx-muted'
                  : 'text-rx-muted'
                : isDark
                ? 'text-rx-main'
                : 'text-rx-main'
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                isDark
                  ? 'bg-rx-accent/15 text-rx-accent border border-rx-accent/30'
                  : 'bg-rx-accent-soft text-rx-accent border border-rx-accent-border'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-rx-accent' : isDark ? 'text-rx-muted' : 'text-rx-muted'
          }`}
        />
      </button>

      {/* Styled Selection Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 right-0 top-full mt-1.5 z-50 max-h-64 overflow-y-auto rounded-xl border p-1 shadow-2xl backdrop-blur-xl transition-all duration-150 animate-in fade-in-50 zoom-in-95 ${
            isDark
              ? 'bg-rx-card/98 border-rx-border text-rx-main shadow-rx'
              : 'bg-rx-card/98 border-rx-border text-rx-main shadow-rx-soft'
          } ${dropdownClassName}`}
        >
          {normalizedOptions.length === 0 ? (
            <div className="py-3 px-3 text-center text-xs text-rx-muted">
              No options available
            </div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = String(value) === opt.value;
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? isDark
                        ? 'bg-rx-accent/15 text-rx-accent font-bold'
                        : 'bg-rx-accent-soft text-rx-accent font-bold'
                      : isDark
                      ? 'text-rx-main hover:bg-rx-surface hover:text-rx-main'
                      : 'text-rx-main hover:bg-rx-surface hover:text-rx-main'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {opt.icon && (
                      <span className="shrink-0 text-sm leading-none">{opt.icon}</span>
                    )}
                    <div className="flex flex-col text-left truncate">
                      <span className="truncate capitalize">{opt.label}</span>
                      {opt.subtext && (
                        <span
                          className={`text-[10px] ${
                            isDark ? 'text-rx-muted' : 'text-rx-main'
                          }`}
                        >
                          {opt.subtext}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {opt.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          isSelected
                            ? isDark
                              ? 'bg-rx-accent text-rx-on-accent'
                              : 'bg-rx-accent text-rx-main'
                            : isDark
                            ? 'bg-rx-border text-rx-muted'
                            : 'bg-rx-surface text-rx-muted'
                        }`}
                      >
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && (
                      <Check
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isDark ? 'text-rx-accent' : 'text-rx-accent'
                        }`}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
