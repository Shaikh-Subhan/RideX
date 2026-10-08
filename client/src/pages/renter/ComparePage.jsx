import React, { useState, useEffect } from 'react';
import { getVehicleImageUrl } from '../../utils/vehicleImage';
import { formatCurrency } from '../../utils/format';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scale,
  Car,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  IndianRupee,
  Fuel,
  Gauge,
  Users,
  ShieldCheck,
  Star,
  Sparkles,
  Layers,
  MapPin
} from 'lucide-react';
import { useComparison } from '../../context/ComparisonContext';
import { useTheme } from '../../context/ThemeContext';
import comparisonApi from '../../api/comparisonApi';
import RatingStars from '../../components/common/RatingStars';
import EmptyState from '../../components/common/EmptyState';

export const ComparePage = () => {
  const navigate = useNavigate();
  const { isDark = true } = useTheme();
  const { selectedVehicles, removeVehicle, clearComparison } = useComparison();
  const [comparedData, setComparedData] = useState([]);
  const [loading, setLoading] = useState(false);

  const vehicleIds = selectedVehicles.map((v) => v._id);

  useEffect(() => {
    let isMounted = true;
    if (vehicleIds.length < 2) {
      setComparedData(selectedVehicles);
      return;
    }

    const fetchComparison = async () => {
      try {
        setLoading(true);
        const res = await comparisonApi.compareVehicles(vehicleIds);
        if (isMounted && res?.vehicles) {
          setComparedData(res.vehicles);
        }
      } catch (err) {
        if (isMounted) {
          setComparedData(selectedVehicles);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchComparison();
    return () => {
      isMounted = false;
    };
  }, [selectedVehicles]);

  if (selectedVehicles.length === 0) {
    return (
      <div className={`max-w-4xl mx-auto px-4 py-16 text-center ${
        isDark ? 'text-rx-main' : 'text-rx-main'
      }`}>
        <EmptyState
          icon={Scale}
          title="No Vehicles Selected for Comparison"
          description="Browse our fleet and click the scale icon on 2 to 5 cars to see their specs, pricing, and features side by side."
          actionLabel="Browse Vehicles to Compare"
          onAction={() => navigate('/cars')}
        />
      </div>
    );
  }

  // Helper to identify if values differ across cars
  const hasDifference = (key) => {
    if (comparedData.length < 2) return false;
    const firstVal = comparedData[0]?.[key];
    return comparedData.some((v) => v?.[key] !== firstVal);
  };

  return (
    <div
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 transition-colors duration-150 ${
        isDark ? 'text-rx-main' : 'text-rx-main'
      }`}
    >
      {/* Page Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b ${
          isDark ? 'border-rx-border' : 'border-rx-border'
        }`}
      >
        <div>
          <div
            className={`inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-1 ${
              isDark ? 'text-rx-accent' : 'text-rx-accent'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Side-by-Side Analysis</span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isDark ? 'text-rx-main' : 'text-rx-main'
            }`}
          >
            Vehicle Comparison
          </h1>
          <p
            className={`text-xs sm:text-sm mt-1 font-medium ${
              isDark ? 'text-rx-muted' : 'text-rx-muted'
            }`}
          >
            Comparing <strong className={isDark ? 'text-rx-accent' : 'text-rx-accent'}>{comparedData.length}</strong> of 5 selected vehicles
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/cars"
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border ${
              isDark
                ? 'bg-rx-card hover:bg-rx-surface text-rx-muted border-rx-border'
                : 'bg-rx-card hover:bg-rx-card text-rx-main border-rx-border shadow-xs'
            }`}
          >
            Add More Cars
          </Link>
          <button
            type="button"
            onClick={clearComparison}
            className={`flex items-center gap-1.5 px-4 py-2 border text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              isDark
                ? 'border-rx-accent-border/60 bg-rx-accent-soft/30 text-rx-main hover:bg-rx-accent-soft/60'
                : 'border-rx-accent-border bg-rx-accent-soft text-rx-main hover:bg-rx-accent-soft shadow-xs'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {comparedData.length < 2 && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold border ${
            isDark
              ? 'bg-rx-accent-soft/30 border-rx-accent-border/50 text-rx-main'
              : 'bg-rx-accent-soft border-rx-accent-border text-rx-main shadow-xs'
          }`}
        >
          <span>Select at least 2 vehicles to unlock full comparison and difference highlighting.</span>
          <Link to="/cars" className={`font-bold underline ml-2 ${isDark ? 'text-rx-accent' : 'text-rx-accent'}`}>
            Browse Fleet &rarr;
          </Link>
        </div>
      )}

      {/* Comparison Table / Matrix */}
      <div
        className={`overflow-x-auto rounded-3xl border shadow-2xl transition-colors duration-150 ${
          isDark
            ? 'bg-rx-card border-rx-border shadow-rx'
            : 'bg-rx-card border-rx-border shadow-rx-soft'
        }`}
      >
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr
              className={`border-b ${
                isDark ? 'border-rx-border bg-rx-page/60' : 'border-rx-border bg-rx-card/90'
              }`}
            >
              <th
                className={`p-5 text-xs font-extrabold uppercase tracking-wider w-48 ${
                  isDark ? 'text-rx-muted' : 'text-rx-muted'
                }`}
              >
                Specifications
              </th>
              {comparedData.map((v) => (
                <th key={v._id} className="p-5 w-64 align-top">
                  <div className="space-y-3">
                    <div
                      className={`relative aspect-16/10 w-full rounded-2xl overflow-hidden border shadow-xs ${
                        isDark ? 'bg-rx-page border-rx-border' : 'bg-rx-surface border-rx-border'
                      }`}
                    >
                      <img
                        src={getVehicleImageUrl(v)}
                        alt={v.model}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeVehicle(v._id)}
                        className={`absolute top-2 right-2 p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isDark
                            ? 'bg-rx-page/80 text-rx-muted hover:text-rx-main hover:bg-rx-card'
                            : 'bg-rx-card/95 text-rx-main hover:text-rx-main hover:bg-rx-accent-soft border border-rx-border shadow-sm'
                        }`}
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <h4
                        className={`font-black text-base line-clamp-1 ${
                          isDark ? 'text-rx-main' : 'text-rx-main'
                        }`}
                      >
                        {v.make} {v.model}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-xs font-bold ${
                            isDark ? 'text-rx-muted' : 'text-rx-main'
                          }`}
                        >
                          {v.year}
                        </span>
                        {v.vehicleNumber && (
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                              isDark
                                ? 'bg-rx-surface text-rx-muted border border-rx-border'
                                : 'bg-rx-surface text-rx-main border border-rx-border'
                            }`}
                          >
                            {v.vehicleNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-1">
                      <Link
                        to={`/cars/${v._id}`}
                        className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-black rounded-xl transition-all shadow-md ${
                          isDark
                            ? 'bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent shadow-rx'
                            : 'bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent shadow-rx'
                        }`}
                      >
                        <span>Rent This Car</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody
            className={`divide-y text-xs ${
              isDark ? 'divide-rx-border' : 'divide-rx-border'
            }`}
          >
            {/* Rental Price */}
            <tr
              className={
                hasDifference('rentalPricePerDay')
                  ? isDark
                    ? 'bg-rx-accent-soft/20'
                    : 'bg-rx-accent-soft/70'
                  : ''
              }
            >
              <td
                className={`p-5 font-extrabold flex items-center gap-1.5 ${
                  isDark ? 'text-rx-muted' : 'text-rx-main'
                }`}
              >
                <IndianRupee className={`w-4 h-4 ${isDark ? 'text-rx-accent' : 'text-rx-accent'}`} />
                Daily Price
              </td>
              {comparedData.map((v) => (
                <td key={v._id} className="p-5">
                  <span
                    className={`text-base font-black ${
                      isDark ? 'text-rx-accent' : 'text-rx-accent'
                    }`}
                  >
                    {formatCurrency(v.rentalPricePerDay)}
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      isDark ? 'text-rx-muted' : 'text-rx-main'
                    }`}
                  >
                    {' '}
                    / day
                  </span>
                </td>
              ))}
            </tr>

            {/* Vehicle Type */}
            <tr
              className={
                hasDifference('vehicleType')
                  ? isDark
                    ? 'bg-rx-accent-soft/20'
                    : 'bg-rx-accent-soft/70'
                  : ''
              }
            >
              <td
                className={`p-5 font-extrabold ${
                  isDark ? 'text-rx-muted' : 'text-rx-main'
                }`}
              >
                Vehicle Category
              </td>
              {comparedData.map((v) => (
                <td
                  key={v._id}
                  className={`p-5 capitalize font-bold ${
                    isDark ? 'text-rx-main' : 'text-rx-main'
                  }`}
                >
                  {v.vehicleType}
                </td>
              ))}
            </tr>

            {/* Star Rating */}
            <tr
              className={
                hasDifference('averageRating')
                  ? isDark
                    ? 'bg-rx-accent-soft/20'
                    : 'bg-rx-accent-soft/70'
                  : ''
              }
            >
              <td
                className={`p-5 font-extrabold ${
                  isDark ? 'text-rx-muted' : 'text-rx-main'
                }`}
              >
                Star Rating
              </td>
              {comparedData.map((v) => (
                <td key={v._id} className="p-5">
                  <RatingStars
                    rating={v.averageRating || 0}
                    totalReviews={v.totalReviews || 0}
                    showNumber
                    size="sm"
                  />
                </td>
              ))}
            </tr>

            {/* Transmission */}
            <tr
              className={
                hasDifference('transmission')
                  ? isDark
                    ? 'bg-rx-accent-soft/20'
                    : 'bg-rx-accent-soft/70'
                  : ''
              }
            >
              <td
                className={`p-5 font-extrabold ${
                  isDark ? 'text-rx-muted' : 'text-rx-main'
                }`}
              >
                Transmission
              </td>
              {comparedData.map((v) => (
                <td
                  key={v._id}
                  className={`p-5 capitalize font-bold ${
                    isDark ? 'text-rx-main' : 'text-rx-main'
                  }`}
                >
                  {v.transmission}
                </td>
              ))}
            </tr>

            {/* Fuel Type */}
            <tr
              className={
                hasDifference('fuelType')
                  ? isDark
                    ? 'bg-rx-accent-soft/20'
                    : 'bg-rx-accent-soft/70'
                  : ''
              }
            >
              <td
                className={`p-5 font-extrabold ${
                  isDark ? 'text-rx-muted' : 'text-rx-main'
                }`}
              >
                Powertrain
              </td>
              {comparedData.map((v) => (
                <td
                  key={v._id}
                  className={`p-5 capitalize font-bold ${
                    isDark ? 'text-rx-main' : 'text-rx-main'
                  }`}
                >
                  {v.fuelType}
                </td>
              ))}
            </tr>

            {/* Seating Capacity */}
            <tr
              className={
                hasDifference('seatingCapacity')
                  ? isDark
                    ? 'bg-rx-accent-soft/20'
                    : 'bg-rx-accent-soft/70'
                  : ''
              }
            >
              <td
                className={`p-5 font-extrabold ${
                  isDark ? 'text-rx-muted' : 'text-rx-main'
                }`}
              >
                Seating Capacity
              </td>
              {comparedData.map((v) => (
                <td
                  key={v._id}
                  className={`p-5 font-bold ${
                    isDark ? 'text-rx-main' : 'text-rx-main'
                  }`}
                >
                  {v.seatingCapacity} Passengers
                </td>
              ))}
            </tr>

            {/* Mileage */}
            <tr
              className={
                hasDifference('mileage')
                  ? isDark
                    ? 'bg-rx-accent-soft/20'
                    : 'bg-rx-accent-soft/70'
                  : ''
              }
            >
              <td
                className={`p-5 font-extrabold ${
                  isDark ? 'text-rx-muted' : 'text-rx-main'
                }`}
              >
                Fuel Economy
              </td>
              {comparedData.map((v) => (
                <td
                  key={v._id}
                  className={`p-5 font-bold ${
                    isDark ? 'text-rx-main' : 'text-rx-main'
                  }`}
                >
                  {v.mileage || 'Standard'} km/l
                </td>
              ))}
            </tr>

            {/* Driver Option */}
            <tr
              className={
                hasDifference('driverAvailable')
                  ? isDark
                    ? 'bg-rx-accent-soft/20'
                    : 'bg-rx-accent-soft/70'
                  : ''
              }
            >
              <td
                className={`p-5 font-extrabold ${
                  isDark ? 'text-rx-muted' : 'text-rx-main'
                }`}
              >
                Chauffeur Service
              </td>
              {comparedData.map((v) => (
                <td key={v._id} className="p-5">
                  {v.driverAvailable ? (
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        isDark ? 'text-rx-accent' : 'text-rx-accent'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      Available (+{formatCurrency(v.driverPricePerDay)}/day)
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 font-medium ${
                        isDark ? 'text-rx-muted' : 'text-rx-main'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      Self-Drive Only
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Location */}
            <tr
              className={
                hasDifference('location')
                  ? isDark
                    ? 'bg-rx-accent-soft/20'
                    : 'bg-rx-accent-soft/70'
                  : ''
              }
            >
              <td
                className={`p-5 font-extrabold ${
                  isDark ? 'text-rx-muted' : 'text-rx-main'
                }`}
              >
                Pickup Location
              </td>
              {comparedData.map((v) => (
                <td
                  key={v._id}
                  className={`p-5 font-bold ${
                    isDark ? 'text-rx-main' : 'text-rx-main'
                  }`}
                >
                  {v.location || 'Flexible'}
                </td>
              ))}
            </tr>

            {/* Features list */}
            <tr>
              <td
                className={`p-5 font-extrabold align-top ${
                  isDark ? 'text-rx-muted' : 'text-rx-main'
                }`}
              >
                Features
              </td>
              {comparedData.map((v) => (
                <td key={v._id} className="p-5 align-top">
                  <div className="flex flex-wrap gap-1.5">
                    {v.features && v.features.length > 0 ? (
                      v.features.map((f, i) => (
                        <span
                          key={i}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                            isDark
                              ? 'bg-rx-surface text-rx-muted border-rx-border'
                              : 'bg-rx-surface text-rx-main border-rx-border'
                          }`}
                        >
                          {f}
                        </span>
                      ))
                    ) : (
                      <span
                        className={`text-xs ${
                          isDark ? 'text-rx-muted' : 'text-rx-main'
                        }`}
                      >
                        Standard equipment
                      </span>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparePage;
