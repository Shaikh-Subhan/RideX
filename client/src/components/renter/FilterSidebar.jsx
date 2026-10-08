import React from 'react';
import {
  Search,
  MapPin,
  Calendar,
  Filter,
  RotateCcw,
  X,
  Car,
  Fuel,
  Users,
  Star,
  UserCheck,
  Zap,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import CustomSelect from '../common/CustomSelect';

export const FilterSidebar = ({
  filters,
  onChange,
  onReset,
  isMobileDrawer = false,
  onCloseMobile = () => {},
}) => {
  const { isDark = true } = useTheme();

  const vehicleCategoryOptions = [
    { value: 'all', label: 'All Vehicle Categories', icon: '🚗' },
    { value: 'sedan', label: 'Sedan', icon: '🚘', subtext: 'Executive Comfort' },
    { value: 'suv', label: 'SUV', icon: '🚙', subtext: 'Performance & Space' },
    { value: 'hatchback', label: 'Hatchback', icon: '🚗', subtext: 'Agile Urban' },
    { value: 'luxury', label: 'Luxury & Exotic', icon: '✨', subtext: 'Bespoke Premium' },
    { value: 'truck', label: 'Truck / Pickup', icon: '🛻', subtext: 'High Utility' },
    { value: 'van', label: 'Van / Minivan', icon: '🚐', subtext: 'Passenger Group' },
    { value: 'convertible', label: 'Convertible', icon: '🏎️', subtext: 'Open Air Tourer' },
    { value: 'coupe', label: 'Coupe', icon: '🏁', subtext: 'Sport Dynamics' },
  ];

  const fuelTypeOptions = [
    { value: 'all', label: 'All Powertrains', icon: '⚡' },
    { value: 'petrol', label: 'Petrol / Gasoline', icon: '⛽' },
    { value: 'diesel', label: 'Diesel', icon: '🛢️' },
    { value: 'electric', label: '100% Electric (EV)', icon: '⚡', badge: 'EV' },
    { value: 'hybrid', label: 'Hybrid / Plug-In', icon: '🔋', badge: 'Hybrid' },
  ];

  const driverOptions = [
    { value: 'all', label: 'Any (Self-drive or with driver)' },
    { value: 'true', label: 'Chauffeur / Driver Option', badge: 'Driver Available' },
    { value: 'false', label: 'Self-drive Only' },
  ];

  const ratingOptions = [
    { value: 'all', label: 'Any Rating', icon: '⭐' },
    { value: '4.5', label: '★ 4.5 & up (Top Rated)', icon: '⭐' },
    { value: '4.0', label: '★ 4.0 & up (Very Good)', icon: '⭐' },
    { value: '3.0', label: '★ 3.0 & up (Good)', icon: '⭐' },
  ];

  const transmissions = ['all', 'automatic', 'manual'];

  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value, page: 1 });
  };

  const inputClass = `w-full py-2 px-3 rounded-xl text-xs font-medium border transition-all duration-150 focus:outline-none ${
    isDark
      ? 'bg-rx-surface text-rx-main placeholder-rx-muted border-rx-border focus:border-rx-accent focus:ring-1 focus:ring-rx-accent/20'
      : 'bg-rx-card text-rx-main placeholder-rx-muted border-rx-border focus:border-rx-accent focus:ring-1 focus:ring-rx-accent-border/20 shadow-xs'
  }`;

  const labelClass = `text-xs font-bold flex items-center gap-1.5 ${
    isDark ? 'text-rx-muted' : 'text-rx-main'
  }`;

  return (
    <div
      className={`space-y-6 ${
        isDark ? 'text-rx-main' : 'text-rx-main'
      } ${isMobileDrawer ? (isDark ? 'p-4 bg-rx-card' : 'p-4 bg-rx-card') : ''}`}
    >
      {/* Mobile Drawer Header */}
      {isMobileDrawer && (
        <div
          className={`flex items-center justify-between pb-4 border-b ${
            isDark ? 'border-rx-border' : 'border-rx-border'
          }`}
        >
          <div className="flex items-center gap-2">
            <Filter className={`w-5 h-5 ${isDark ? 'text-rx-accent' : 'text-rx-accent'}`} />
            <h3 className="font-bold text-lg">Filter Fleet</h3>
          </div>
          <button
            onClick={onCloseMobile}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark
                ? 'text-rx-muted hover:text-rx-main hover:bg-rx-surface'
                : 'text-rx-main hover:text-rx-main hover:bg-rx-surface'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Filter Reset Header */}
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider ${
            isDark ? 'text-rx-muted' : 'text-rx-main'
          }`}
        >
          Refine Results
        </span>
        <button
          type="button"
          onClick={onReset}
          className={`flex items-center gap-1 text-xs font-semibold cursor-pointer transition-colors ${
            isDark
              ? 'text-rx-accent hover:text-rx-accent'
              : 'text-rx-accent hover:text-rx-accent'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Search Keyword */}
      <div className="space-y-1.5">
        <label className={labelClass}>Keyword</label>
        <div className="relative">
          <Search
            className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
              isDark ? 'text-rx-muted' : 'text-rx-muted'
            }`}
          />
          <input
            type="text"
            placeholder="Search make or model..."
            value={filters.keyword || ''}
            onChange={(e) => handleChange('keyword', e.target.value)}
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <label className={labelClass}>Location</label>
        <div className="relative">
          <MapPin
            className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
              isDark ? 'text-rx-muted' : 'text-rx-muted'
            }`}
          />
          <input
            type="text"
            placeholder="City or state (e.g. San Francisco)"
            value={filters.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      {/* Rental Dates */}
      <div className="space-y-2">
        <label className={labelClass}>
          <Calendar className={`w-3.5 h-3.5 ${isDark ? 'text-rx-accent' : 'text-rx-accent'}`} />
          Availability Dates
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span
              className={`text-[10px] font-semibold block mb-0.5 ${
                isDark ? 'text-rx-muted' : 'text-rx-main'
              }`}
            >
              Pickup
            </span>
            <input
              type="date"
              value={filters.startDate || ''}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <span
              className={`text-[10px] font-semibold block mb-0.5 ${
                isDark ? 'text-rx-muted' : 'text-rx-main'
              }`}
            >
              Return
            </span>
            <input
              type="date"
              value={filters.endDate || ''}
              min={filters.startDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-1.5">
        <label className={labelClass}>Daily Price ($)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min ($)"
            value={filters.minPrice || ''}
            min="0"
            onChange={(e) => handleChange('minPrice', e.target.value)}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="Max ($)"
            value={filters.maxPrice || ''}
            min="0"
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Vehicle Category - Custom Selection List */}
      <div className="space-y-1.5">
        <label className={labelClass}>
          <Car className={`w-3.5 h-3.5 ${isDark ? 'text-rx-accent' : 'text-rx-accent'}`} />
          Vehicle Category
        </label>
        <CustomSelect
          options={vehicleCategoryOptions}
          value={filters.vehicleType || 'all'}
          onChange={(val) => handleChange('vehicleType', val === 'all' ? '' : val)}
          placeholder="All Vehicle Categories"
        />
      </div>

      {/* Transmission Buttons */}
      <div className="space-y-1.5">
        <label className={labelClass}>Transmission</label>
        <div className="grid grid-cols-3 gap-1.5">
          {transmissions.map((t) => {
            const isSelected = (filters.transmission || 'all') === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => handleChange('transmission', t === 'all' ? '' : t)}
                className={`py-2 px-2 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-rx-accent text-rx-on-accent border-rx-accent shadow-sm'
                      : 'bg-rx-accent text-rx-main border-rx-accent shadow-sm'
                    : isDark
                    ? 'bg-rx-surface text-rx-muted border-rx-border hover:text-rx-main hover:border-rx-border-strong'
                    : 'bg-rx-card text-rx-muted border-rx-border hover:text-rx-main hover:border-rx-border shadow-xs'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Powertrain / Fuel - Custom Selection List */}
      <div className="space-y-1.5">
        <label className={labelClass}>
          <Fuel className={`w-3.5 h-3.5 ${isDark ? 'text-rx-accent' : 'text-rx-accent'}`} />
          Powertrain / Fuel
        </label>
        <CustomSelect
          options={fuelTypeOptions}
          value={filters.fuelType || 'all'}
          onChange={(val) => handleChange('fuelType', val === 'all' ? '' : val)}
          placeholder="All Powertrains"
        />
      </div>

      {/* Minimum Seats */}
      <div className="space-y-1.5">
        <label className={labelClass}>
          <Users className={`w-3.5 h-3.5 ${isDark ? 'text-rx-accent' : 'text-rx-accent'}`} />
          Minimum Seats
        </label>
        <div className="grid grid-cols-5 gap-1">
          {[2, 4, 5, 7, 8].map((seats) => {
            const isSelected = filters.minSeats === String(seats);
            return (
              <button
                key={seats}
                type="button"
                onClick={() =>
                  handleChange('minSeats', isSelected ? '' : String(seats))
                }
                className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                  isSelected
                    ? isDark
                      ? 'bg-rx-accent text-rx-on-accent border-rx-accent shadow-sm'
                      : 'bg-rx-accent text-rx-main border-rx-accent shadow-sm'
                    : isDark
                    ? 'bg-rx-surface text-rx-muted border-rx-border hover:text-rx-main hover:border-rx-border-strong'
                    : 'bg-rx-card text-rx-muted border-rx-border hover:text-rx-main hover:border-rx-border shadow-xs'
                }`}
              >
                {seats}+
              </button>
            );
          })}
        </div>
      </div>

      {/* Chauffeur Service - Custom Selection List */}
      <div className="space-y-1.5">
        <label className={labelClass}>
          <UserCheck className={`w-3.5 h-3.5 ${isDark ? 'text-rx-accent' : 'text-rx-accent'}`} />
          Chauffeur Service
        </label>
        <CustomSelect
          options={driverOptions}
          value={filters.driverAvailable || 'all'}
          onChange={(val) => handleChange('driverAvailable', val === 'all' ? '' : val)}
          placeholder="Chauffeur Service"
        />
      </div>

      {/* Minimum Star Rating - Custom Selection List */}
      <div className="space-y-1.5">
        <label className={labelClass}>
          <Star className={`w-3.5 h-3.5 ${isDark ? 'text-rx-accent' : 'text-rx-accent'}`} />
          Minimum Rating
        </label>
        <CustomSelect
          options={ratingOptions}
          value={filters.minRating || 'all'}
          onChange={(val) => handleChange('minRating', val === 'all' ? '' : val)}
          placeholder="Any Rating"
        />
      </div>

      {isMobileDrawer && (
        <button
          type="button"
          onClick={onCloseMobile}
          className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer ${
            isDark
              ? 'bg-rx-accent text-rx-on-accent hover:bg-rx-accent-hover'
              : 'bg-rx-accent text-rx-main hover:bg-rx-accent-hover'
          }`}
        >
          Show Results
        </button>
      )}
    </div>
  );
};

export default FilterSidebar;
