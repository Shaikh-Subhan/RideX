import React, { useState, useEffect } from 'react';
import { getVehicleImageUrl } from '../../utils/vehicleImage';
import {
  CalendarCheck,
  Calendar,
  Check,
  X,
  CheckCheck,
  Award,
  ShieldCheck,
  User,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import bookingApi from '../../api/bookingApi';
import Badge from '../../components/common/Badge';
import ReviewRenterModal from '../../components/owner/ReviewRenterModal';
import { formatCurrency, formatDate } from '../../utils/format';
import { ConfirmDialog } from '../../components/common/Modal';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const OwnerBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Modals / Dialogs
  const [selectedBookingForTrust, setSelectedBookingForTrust] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [processing, setProcessing] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getOwnerBookings();
      setBookings(res?.bookings || []);
    } catch (err) {
      console.warn('Failed to load owner bookings:', err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleExecuteAction = async () => {
    if (!confirmAction) return;
    const { id, type } = confirmAction;

    try {
      setProcessing(true);
      if (type === 'approved' || type === 'rejected') {
        await bookingApi.reviewBooking(id, type);
        success(`Booking ${type === 'approved' ? 'approved' : 'rejected'} successfully!`);
      } else if (type === 'complete') {
        await bookingApi.completeBooking(id);
        success('Booking marked as completed! You can now evaluate the renter.');
      }
      setConfirmAction(null);
      fetchBookings();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update booking status');
    } finally {
      setProcessing(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-rx-main">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <OwnerSidebar />

        <div className="flex-1 min-w-0 w-full space-y-6">
          {/* Header */}
          <div className="pb-6 border-b border-rx-border">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-rx-main tracking-tight">
              Booking Requests
            </h1>
            <p className="text-xs sm:text-sm text-rx-muted mt-1">
              Review driver reservations, approve rentals, and evaluate completed trips
            </p>
          </div>

          {/* Filter Tabs */}
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

          {/* List of Bookings */}
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
                const r = b.renter || {};
                const isPending = b.status === 'pending';
                const isApproved = b.status === 'approved';
                const isCompleted = b.status === 'completed';

                return (
                  <div
                    key={b._id}
                    className="bg-rx-card rounded-3xl border border-rx-border p-5 sm:p-6 shadow-xl hover:border-rx-accent/40 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                  >
                    {/* Vehicle & Renter Details */}
                    <div className="flex items-start gap-4">
                      <img
                        src={getVehicleImageUrl(v)}
                        alt={v.model || 'Car'}
                        className="w-20 h-16 sm:w-24 sm:h-20 rounded-2xl object-cover shrink-0 border border-rx-border"
                      />

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-extrabold text-rx-main text-base">
                            {v.make} {v.model}
                          </h4>
                          <span className="text-xs text-rx-muted font-medium">({v.year})</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-semibold text-rx-muted">
                          <User className="w-3.5 h-3.5 text-rx-accent" />
                          <span>Renter: {r.name || 'Anonymous'}</span>
                          {r.phone && <span className="text-rx-muted font-normal">({r.phone})</span>}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-rx-muted">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-rx-accent" />
                            {formatDate(b.startDate)} &rarr;{' '}
                            {formatDate(b.endDate)}
                          </span>
                          <span>&bull;</span>
                          <span>{b.rentalDays} days</span>
                          {b.withDriver && (
                            <>
                              <span>&bull;</span>
                              <span className="text-rx-accent font-bold">With Driver</span>
                            </>
                          )}
                        </div>

                        {b.specialRequests && (
                          <p className="text-[11px] text-rx-muted italic bg-rx-surface p-2 rounded-xl border border-rx-border">
                            Note: "{b.specialRequests}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status & Price */}
                    <div className="flex flex-wrap lg:flex-col items-start lg:items-end justify-between w-full lg:w-auto gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-rx-border">
                      <div className="flex items-center gap-2">
                        <Badge status={b.status}>{b.status}</Badge>
                        <Badge status={b.paymentStatus}>{b.paymentStatus}</Badge>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-extrabold text-rx-accent">{formatCurrency(b.totalAmount)}</span>
                        <span className="text-xs text-rx-muted ml-1">total payout</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-rx-border justify-end">
                      {/* Approve / Reject buttons for Pending */}
                      {isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmAction({
                                id: b._id,
                                type: 'approved',
                                title: 'Approve Booking Request?',
                                message: `Are you sure you want to approve this booking for ${r.name}? The renter will be invited to complete payment.`,
                              })
                            }
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setConfirmAction({
                                id: b._id,
                                type: 'rejected',
                                title: 'Decline Booking Request?',
                                message: `Decline booking request for ${r.name}? The vehicle dates will remain open for others.`,
                              })
                            }
                            className="flex items-center gap-1.5 px-3 py-2 border border-rx-accent-border/60 bg-rx-accent-soft/20 text-rx-main hover:bg-rx-accent-soft/40 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                            <span>Decline</span>
                          </button>
                        </>
                      )}

                      {/* Complete Trip button for Approved */}
                      {isApproved && (
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmAction({
                              id: b._id,
                              type: 'complete',
                              title: 'Mark Trip as Completed?',
                              message: 'Confirm that the vehicle has been safely returned. This completes the reservation and unlocks renter trust evaluation.',
                            })
                          }
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent text-xs font-extrabold rounded-xl transition-all shadow-md cursor-pointer"
                        >
                          <CheckCheck className="w-4 h-4" />
                          <span>Complete Trip</span>
                        </button>
                      )}

                      {/* Review Renter button for Completed */}
                      {isCompleted && (
                        <button
                          type="button"
                          onClick={() => setSelectedBookingForTrust(b)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                        >
                          <Award className="w-4 h-4" />
                          <span>Evaluate Renter</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={CalendarCheck}
              title={`No ${activeTab !== 'all' ? activeTab : ''} bookings found`}
              description="Booking requests from verified drivers for your vehicles will show up here."
            />
          )}
        </div>
      </div>

      {/* Renter Trust Evaluation Modal */}
      {selectedBookingForTrust && (
        <ReviewRenterModal
          isOpen={!!selectedBookingForTrust}
          onClose={() => setSelectedBookingForTrust(null)}
          booking={selectedBookingForTrust}
          onSuccess={() => {
            setSelectedBookingForTrust(null);
            fetchBookings();
          }}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleExecuteAction}
        loading={processing}
        title={confirmAction?.title || 'Confirm Action'}
        message={confirmAction?.message || 'Are you sure you want to proceed?'}
        confirmText="Confirm"
        isDanger={confirmAction?.type === 'rejected'}
      />
    </div>
  );
};

export default OwnerBookingsPage;
