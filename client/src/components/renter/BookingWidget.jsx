import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, UserCheck, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import bookingApi from '../../api/bookingApi';
import { getNextDate } from '../../utils/date';
import { formatCurrency } from '../../utils/format';

export const BookingWidget = ({ vehicle, onBookingSuccess }) => {
  const { isAuthenticated, user, roles } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 4);

  const [startDate, setStartDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(threeDaysLater.toISOString().split('T')[0]);
  const [withDriver, setWithDriver] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleStartDateChange = (value) => {
    setStartDate(value);
    if (value && endDate <= value) {
      setEndDate(getNextDate(value));
    }
  };

  // Calculate rental days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const dailyVehicleRate = Number(vehicle?.rentalPricePerDay) || 0;
  const dailyDriverRate = withDriver ? Number(vehicle?.driverPricePerDay) || 0 : 0;
  const estimatedVehicleTotal = dailyVehicleRate * days;
  const estimatedDriverTotal = dailyDriverRate * days;
  const estimatedGrandTotal = estimatedVehicleTotal + estimatedDriverTotal;

  const handleBookNow = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/cars/${vehicle._id}` } });
      return;
    }

    if (!roles.includes('renter')) {
      setErrorMsg('Only registered renters can book vehicles. Please switch to or add the renter role.');
      return;
    }

    const currentUserId = user?._id || user?.id;
    const vehicleOwnerId = vehicle.owner?._id || vehicle.owner?.id || (typeof vehicle.owner === 'string' ? vehicle.owner : null);
    if (currentUserId && vehicleOwnerId && String(vehicleOwnerId) === String(currentUserId)) {
      setErrorMsg('You cannot book your own vehicle.');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setErrorMsg('Return date must be after pickup date.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await bookingApi.createBooking({
        vehicleId: vehicle._id,
        startDate,
        endDate,
        withDriver,
        specialRequests: specialRequests.trim(),
      });

      success('Reservation request submitted! Redirecting to your bookings...');
      if (onBookingSuccess) {
        onBookingSuccess(res.booking);
      } else {
        navigate('/bookings');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place booking. Please check availability.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-rx-card rounded-3xl border border-rx-border shadow-2xl p-6 sm:p-7 sticky top-24 text-rx-main">
      {/* Price Header */}
      <div className="flex items-baseline justify-between pb-5 border-b border-rx-border">
        <div>
          <span className="text-3xl font-extrabold text-rx-accent">{formatCurrency(dailyVehicleRate)}</span>
          <span className="text-xs text-rx-muted font-medium"> / day</span>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-bold text-rx-accent bg-rx-accent-soft/50 px-2.5 py-1 rounded-md border border-rx-accent-border/60">
            Instant Request
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 p-3 bg-rx-accent-soft/50 border border-rx-accent-border/60 rounded-xl flex items-start gap-2 text-xs text-rx-accent">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rx-accent" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Date Pickers */}
      <form onSubmit={handleBookNow} className="mt-5 space-y-4">
        <div className="border border-rx-border rounded-2xl p-3 bg-rx-surface space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-rx-muted flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rx-accent" />
              Pickup Date
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-full bg-rx-card px-3 py-2 border border-rx-border rounded-xl text-xs font-semibold text-rx-main focus:outline-none focus:border-rx-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-rx-muted flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rx-accent" />
              Return Date
            </label>
            <input
              type="date"
              required
              min={startDate ? getNextDate(startDate) : new Date().toISOString().split('T')[0]}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-rx-card px-3 py-2 border border-rx-border rounded-xl text-xs font-semibold text-rx-main focus:outline-none focus:border-rx-accent"
            />
          </div>
        </div>

        {/* Chauffeur Option */}
        {vehicle.driverAvailable && (
          <div className="p-3.5 bg-rx-surface border border-rx-border rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-5 h-5 text-rx-accent shrink-0" />
              <div>
                <p className="text-xs font-bold text-rx-main">Chauffeur Service</p>
                <p className="text-[11px] text-rx-muted">
                  +{formatCurrency(vehicle.driverPricePerDay || 0)}/day extra
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              id="withDriver"
              checked={withDriver}
              onChange={(e) => setWithDriver(e.target.checked)}
              className="w-4 h-4 accent-rx-accent rounded border-rx-border cursor-pointer"
            />
          </div>
        )}

        {/* Special Requests */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-rx-muted">Special Notes (Optional)</label>
          <input
            type="text"
            placeholder="Child seat, pickup location notes..."
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            className="w-full px-3 py-2 bg-rx-surface border border-rx-border rounded-xl text-xs text-rx-main placeholder-rx-muted focus:outline-none focus:border-rx-accent"
          />
        </div>

        {/* Price Breakdown */}
        <div className="py-4 border-t border-rx-border space-y-2 text-xs">
          <div className="flex justify-between text-rx-muted">
            <span>
              {formatCurrency(dailyVehicleRate)} × {days} {days === 1 ? 'day' : 'days'}
            </span>
            <span className="font-semibold text-rx-main">{formatCurrency(estimatedVehicleTotal)}</span>
          </div>

          {withDriver && dailyDriverRate > 0 && (
            <div className="flex justify-between text-rx-muted">
              <span>
                Driver fee ({formatCurrency(dailyDriverRate)} × {days} days)
              </span>
              <span className="font-semibold text-rx-main">{formatCurrency(estimatedDriverTotal)}</span>
            </div>
          )}

          <div className="pt-2 border-t border-dashed border-rx-border flex justify-between items-baseline">
            <span className="text-sm font-bold text-rx-main">Estimated Total</span>
            <span className="text-2xl font-extrabold text-rx-accent">{formatCurrency(estimatedGrandTotal)}</span>
          </div>
          <p className="text-[10px] text-rx-muted italic">
            *Final calculations verified by RideX backend engine.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-4 bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent font-extrabold rounded-2xl transition-all shadow-lg shadow-rx flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
        >
          {submitting ? (
            <span>Processing Reservation...</span>
          ) : (
            <>
              <span>{isAuthenticated ? 'Reserve Vehicle Now' : 'Sign in to Reserve'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-rx-muted pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-rx-accent" />
          <span>No charges until host confirms your booking</span>
        </div>
      </form>
    </div>
  );
};

export default BookingWidget;
