import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Fuel,
  Gauge,
  MapPin,
  CheckCircle2,
  Scale,
  UserCheck,
  Car
} from 'lucide-react';
import RatingStars from '../common/RatingStars';
import { useComparison } from '../../context/ComparisonContext';
import { useTheme } from '../../context/ThemeContext';
import { getVehicleImageUrl } from '../../utils/vehicleImage';

export const VehicleCard = ({ vehicle }) => {
  const { isInComparison, toggleVehicle } = useComparison();
  const { isDark } = useTheme();

  if (!vehicle) return null;

  const isCompared = isInComparison(vehicle._id);
  const primaryImage = getVehicleImageUrl(vehicle);

  const isVerified =
    vehicle.verification?.status === 'verified' || vehicle.isVerified;

  return (
    <div className={`group rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-0.5 ${
      isDark
        ? 'bg-rx-card border-rx-border text-rx-main hover:border-rx-accent/50'
        : 'bg-rx-card border-rx-border text-rx-main hover:border-rx-accent/50 shadow-rx-soft'
    }`}>
      {/* Vehicle Image Container */}
      <div className={`relative aspect-16/10 w-full overflow-hidden ${
        isDark ? 'bg-rx-page' : 'bg-rx-surface'
      }`}>
        <img
          src={primaryImage}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden';
          }}
        />

        {/* Top-Left: Verification and Driver Option Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {isVerified && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold backdrop-blur-md shadow-sm ${
              isDark
                ? 'bg-rx-page/90 text-rx-accent border border-rx-accent-border/60'
                : 'bg-rx-card/95 text-rx-accent border border-rx-accent-border shadow-xs'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 text-rx-accent" />
              Verified
            </span>
          )}
          {vehicle.driverAvailable && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold backdrop-blur-md shadow-sm ${
              isDark
                ? 'bg-rx-page/90 text-rx-accent border border-rx-accent/40'
                : 'bg-rx-card/95 text-rx-accent border border-rx-accent-border shadow-xs'
            }`}>
              <UserCheck className={`w-3.5 h-3.5 ${isDark ? 'text-rx-accent' : 'text-rx-accent'}`} />
              Driver Option
            </span>
          )}
        </div>

        {/* Top-Right: Compare Toggle Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleVehicle(vehicle);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-xl backdrop-blur-md transition-all cursor-pointer border z-10 flex items-center justify-center ${
            isCompared
              ? isDark
                ? 'bg-rx-accent text-rx-on-accent border-rx-accent shadow-lg shadow-rx scale-105 font-bold'
                : 'bg-rx-accent text-rx-main border-rx-accent shadow-lg shadow-rx scale-105 font-bold'
              : isDark
              ? 'bg-rx-page/80 text-rx-muted border-rx-border hover:text-rx-accent hover:bg-rx-card hover:border-rx-accent/60 hover:scale-105'
              : 'bg-rx-card/95 text-rx-main border-rx-border hover:text-rx-accent hover:bg-rx-card hover:border-rx-accent hover:scale-105 shadow-md'
          }`}
          title={isCompared ? 'Remove from comparison' : 'Compare this vehicle'}
          aria-label={isCompared ? 'Remove from comparison' : 'Compare this vehicle'}
        >
          <Scale className="w-4 h-4" />
        </button>

        {/* Bottom-Left: Vehicle Type tag with Car icon */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-md ${
            isDark
              ? 'bg-rx-page/90 text-rx-main border border-rx-border'
              : 'bg-rx-card/95 text-rx-main border border-rx-border font-extrabold shadow-sm'
          }`}>
            <Car className={`w-3.5 h-3.5 ${isDark ? 'text-rx-accent' : 'text-rx-accent'}`} />
            <span>{vehicle.vehicleType || 'Vehicle'}</span>
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header & Rating */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className={`font-bold text-base sm:text-lg transition-colors line-clamp-1 ${
              isDark
                ? 'text-rx-main group-hover:text-rx-accent'
                : 'text-rx-main group-hover:text-rx-accent'
            }`}>
              {vehicle.make} {vehicle.model}
              <span className={`font-normal ml-1.5 text-xs ${isDark ? 'text-rx-muted' : 'text-rx-main'}`}>
                {vehicle.year}
              </span>
            </h3>
          </div>

          <div className="flex items-center justify-between gap-2 mb-3.5">
            <RatingStars
              rating={vehicle.averageRating || 0}
              totalReviews={vehicle.totalReviews || 0}
              showNumber
              size="sm"
            />
            {vehicle.location && (
              <div className={`flex items-center gap-1 text-xs font-medium truncate max-w-[130px] ${
                isDark ? 'text-rx-muted' : 'text-rx-muted'
              }`}>
                <MapPin className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-rx-accent' : 'text-rx-accent'}`} />
                <span className="truncate">{vehicle.location}</span>
              </div>
            )}
          </div>

          {/* Key Specifications Grid */}
          <div className={`grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl text-xs mb-4 border transition-colors ${
            isDark
              ? 'bg-rx-surface border-rx-border text-rx-muted'
              : 'bg-rx-card border-rx-border text-rx-muted'
          }`}>
            <div className="flex items-center gap-1.5 truncate">
              <Gauge className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-rx-accent' : 'text-rx-accent'}`} />
              <span className={`capitalize truncate font-medium ${isDark ? 'text-rx-main' : 'text-rx-main'}`}>
                {vehicle.transmission}
              </span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Fuel className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-rx-accent' : 'text-rx-accent'}`} />
              <span className={`capitalize truncate font-medium ${isDark ? 'text-rx-main' : 'text-rx-main'}`}>
                {vehicle.fuelType}
              </span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Users className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-rx-accent' : 'text-rx-accent'}`} />
              <span className={`truncate font-medium ${isDark ? 'text-rx-main' : 'text-rx-main'}`}>
                {vehicle.seatingCapacity} Seats
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className={`pt-3 border-t flex items-center justify-between ${
          isDark ? 'border-rx-border' : 'border-rx-border'
        }`}>
          <div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-extrabold ${isDark ? 'text-rx-accent' : 'text-rx-accent'}`}>
                ${vehicle.rentalPricePerDay}
              </span>
              <span className={`text-[11px] font-medium ${isDark ? 'text-rx-muted' : 'text-rx-main'}`}>
                / day
              </span>
            </div>
            {vehicle.driverAvailable && vehicle.driverPricePerDay ? (
              <span className={`text-[10px] font-medium block ${isDark ? 'text-rx-muted' : 'text-rx-main'}`}>
                +${vehicle.driverPricePerDay}/day driver
              </span>
            ) : null}
          </div>

          <Link
            to={`/cars/${vehicle._id}`}
            className={`inline-flex items-center justify-center px-4 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-md ${
              isDark
                ? 'bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent'
                : 'bg-rx-accent hover:bg-rx-accent-hover text-rx-main shadow-rx'
            }`}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
