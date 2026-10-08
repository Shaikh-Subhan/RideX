import React, { useState, useEffect } from 'react';
import { getVehicleImageUrl } from '../../utils/vehicleImage';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  Calendar,
  Car,
  Star,
  CreditCard,
  Ban,
  ArrowRight
} from 'lucide-react';
import bookingApi from '../../api/bookingApi';
import Badge from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/Modal';
import PaymentModal from '../../components/renter/PaymentModal';
import ReviewVehicleModal from '../../components/renter/ReviewVehicleModal';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Modals state
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getMyBookings();
      setBookings(res.bookings || []);
    } catch (err) {
      console.warn('Failed to fetch bookings:', err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!cancellingBookingId) return;
    try {
      setCancelling(true);
      await bookingApi.cancelBooking(cancellingBookingId);
      success('Booking cancelled successfully');
      setCancellingBookingId(null);
      fetchBookings();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 text-rx-main">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-rx-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-rx-main tracking-tight">
            My Bookings
          </h1>
          <p className="text-xs sm:text-sm text-rx-muted mt-1">
            Track your vehicle reservations, process payment, and rate completed trips
          </p>
        </div>

        <Link
          to="/cars"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Car className="w-4 h-4" />
          <span>Browse Fleet</span>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'pending', 'approved', 'completed', 'cancelled', 'rejected'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-rx-accent text-rx-on-accent shadow-md'
                : 'bg-rx-card text-rx-muted border border-rx-border hover:text-rx-main'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings Table / List */}
      {loading ? (
        <div className="bg-rx-card rounded-3xl border border-rx-border p-8 shadow-xl">
          <table className="w-full">
            <tbody>
              <TableRowSkeleton cols={6} />
              <TableRowSkeleton cols={6} />
            </tbody>
          </table>
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const v = b.vehicle || {};
            const isApprovedUnpaid = b.status === 'approved' && b.paymentStatus !== 'paid';
            const isCompleted = b.status === 'completed';
            const isPending = b.status === 'pending';

            return (
              <div
                key={b._id}
                className="bg-rx-card rounded-3xl border border-rx-border shadow-xl hover:border-rx-accent/40 transition-all p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                {/* Vehicle & Info */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-2xl bg-rx-page border border-rx-border overflow-hidden shrink-0">
                    <img
                      src={getVehicleImageUrl(v)}
                      alt={v.model || 'Car'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-rx-main text-base sm:text-lg">
                        {v.make} {v.model}
                      </h3>
                      <span className="text-xs text-rx-muted font-medium">{v.year}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-rx-muted">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-rx-accent" />
                        {new Date(b.startDate).toLocaleDateString()} &rarr;{' '}
                        {new Date(b.endDate).toLocaleDateString()}
                      </span>
                      <span>&bull;</span>
                      <span>{b.rentalDays} {b.rentalDays === 1 ? 'day' : 'days'}</span>
                      {b.withDriver && (
                        <>
                          <span>&bull;</span>
                          <span className="text-rx-accent font-semibold">With Chauffeur</span>
                        </>
                      )}
                    </div>

                    <p className="text-[11px] font-mono text-rx-muted">
                      Ref: #{b._id.substring(b._id.length - 8).toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Status Badges & Price */}
                <div className="flex flex-wrap lg:flex-col items-start lg:items-end justify-between w-full lg:w-auto gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-rx-border">
                  <div className="flex items-center gap-2">
                    <Badge status={b.status}>{b.status}</Badge>
                    <Badge status={b.paymentStatus}>
                      {b.paymentStatus === 'paid' ? 'Paid in Full' : b.paymentStatus}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-xl font-extrabold text-rx-accent">${b.totalAmount}</span>
                    <span className="text-xs text-rx-muted ml-1">total</span>
                  </div>
                </div>

                {/* Contextual Actions */}
                <div className="flex items-center gap-2 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-rx-border justify-end">
                  {/* Pay button if approved and unpaid */}
                  {isApprovedUnpaid && (
                    <button
                      type="button"
                      onClick={() => setSelectedBookingForPayment(b)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-rx-accent hover:bg-rx-accent-soft text-rx-main text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pay Now</span>
                    </button>
                  )}

                  {/* Review button if completed */}
                  {isCompleted && (
                    <button
                      type="button"
                      onClick={() => setSelectedBookingForReview(b)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent text-xs font-extrabold rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      <Star className="w-4 h-4 fill-rx-on-accent" />
                      <span>Rate Vehicle</span>
                    </button>
                  )}

                  {/* Cancel button if pending */}
                  {isPending && (
                    <button
                      type="button"
                      onClick={() => setCancellingBookingId(b._id)}
                      className="flex items-center gap-1.5 px-3 py-2 border border-rx-accent-border/60 bg-rx-accent-soft/20 text-rx-accent hover:bg-rx-accent-soft/40 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}

                  <Link
                    to={`/cars/${v._id}`}
                    className="p-2 text-rx-muted hover:text-rx-main rounded-xl hover:bg-rx-surface transition-colors border border-rx-transparent hover:border-rx-border"
                    title="View vehicle"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={CalendarCheck}
          title={`No ${activeTab !== 'all' ? activeTab : ''} bookings found`}
          description="When you reserve vehicles on RideX, their approval status, invoice checkout, and vehicle reviews will be tracked here."
          actionLabel="Find Cars to Rent"
          onAction={() => navigate('/cars')}
        />
      )}

      {/* Pay Modal */}
      {selectedBookingForPayment && (
        <PaymentModal
          isOpen={!!selectedBookingForPayment}
          onClose={() => setSelectedBookingForPayment(null)}
          booking={selectedBookingForPayment}
          onSuccess={() => {
            fetchBookings();
            setSelectedBookingForPayment(null);
          }}
        />
      )}

      {/* Review Vehicle Modal */}
      {selectedBookingForReview && (
        <ReviewVehicleModal
          isOpen={!!selectedBookingForReview}
          onClose={() => setSelectedBookingForReview(null)}
          booking={selectedBookingForReview}
          onSuccess={() => {
            setSelectedBookingForReview(null);
          }}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cancellingBookingId}
        onClose={() => setCancellingBookingId(null)}
        onConfirm={handleCancelBooking}
        loading={cancelling}
        isDanger
        title="Cancel Booking Request?"
        message="Are you sure you want to cancel this pending booking? You can always create a new request later."
        confirmText="Yes, Cancel Booking"
      />
    </div>
  );
};

export default MyBookingsPage;
