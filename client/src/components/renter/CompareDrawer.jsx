import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, X, ArrowRight, Trash2 } from 'lucide-react';
import { useComparison } from '../../context/ComparisonContext';
import { useTheme } from '../../context/ThemeContext';
import { getVehicleImageUrl } from '../../utils/vehicleImage';

export const CompareDrawer = () => {
  const { selectedVehicles, removeVehicle, clearComparison, count } = useComparison();
  const { isDark = true } = useTheme();

  if (count === 0) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl backdrop-blur-xl rounded-2xl shadow-2xl border p-3 sm:p-4 animate-in slide-in-from-bottom-6 duration-300 transition-colors ${
        isDark
          ? 'bg-rx-card/95 text-rx-main border-rx-border shadow-rx'
          : 'bg-rx-card/98 text-rx-main border-rx-border shadow-rx-soft'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Info */}
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
              isDark
                ? 'bg-rx-surface border-rx-border text-rx-accent'
                : 'bg-rx-accent-soft border-rx-accent-border text-rx-accent'
            }`}
          >
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <span
              className={`text-xs font-black block ${
                isDark ? 'text-rx-main' : 'text-rx-main'
              }`}
            >
              Compare Vehicles
            </span>
            <p
              className={`text-[11px] font-medium ${
                isDark ? 'text-rx-muted' : 'text-rx-main'
              }`}
            >
              {count} of 5 selected {count < 2 && '(Select at least 2 to compare)'}
            </p>
          </div>
        </div>

        {/* Center: Vehicle Thumbnails */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
          {selectedVehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              className={`relative flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl border shrink-0 transition-colors ${
                isDark
                  ? 'bg-rx-surface border-rx-border text-rx-muted'
                  : 'bg-rx-card border-rx-border text-rx-main'
              }`}
            >
              <img
                src={getVehicleImageUrl(vehicle)}
                alt={vehicle.model}
                className="w-8 h-6 object-cover rounded-md"
              />
              <span
                className={`text-xs font-bold truncate max-w-[90px] ${
                  isDark ? 'text-rx-main' : 'text-rx-main'
                }`}
              >
                {vehicle.make} {vehicle.model}
              </span>
              <button
                type="button"
                onClick={() => removeVehicle(vehicle._id)}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  isDark
                    ? 'text-rx-muted hover:text-rx-main hover:bg-rx-card'
                    : 'text-rx-muted hover:text-rx-main hover:bg-rx-accent-soft'
                }`}
                title="Remove"
                aria-label="Remove vehicle from comparison"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={clearComparison}
            className={`p-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
              isDark
                ? 'text-rx-muted hover:text-rx-main hover:bg-rx-surface'
                : 'text-rx-main hover:text-rx-main hover:bg-rx-surface'
            }`}
            title="Clear all"
            aria-label="Clear all vehicles in comparison"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <Link
            to="/compare"
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md ${
              count >= 2
                ? isDark
                  ? 'bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent cursor-pointer shadow-rx'
                  : 'bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent cursor-pointer shadow-rx'
                : isDark
                ? 'bg-rx-surface text-rx-main border border-rx-border cursor-not-allowed pointer-events-none'
                : 'bg-rx-surface text-rx-muted border border-rx-border cursor-not-allowed pointer-events-none'
            }`}
          >
            <span>Compare Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompareDrawer;
