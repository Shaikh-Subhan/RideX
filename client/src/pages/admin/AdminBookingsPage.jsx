import React, { useState, useEffect } from 'react';
import { CalendarCheck, ChevronLeft, ChevronRight, Calendar, User } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import adminApi from '../../api/adminApi';
import Badge from '../../components/common/Badge';
import CustomSelect from '../../components/common/CustomSelect';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/format';

export const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;

      const res = await adminApi.getAllBookingsAdmin(params);
      setBookings(res?.bookings || []);
      if (res?.pagination) setPagination(res.pagination);
    } catch (err) {
      console.warn('Failed to load admin bookings:', err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, paymentFilter, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-rx-main">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AdminSidebar />

        <div className="flex-1 w-full space-y-6">
          <div className="pb-6 border-b border-rx-border">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-rx-main tracking-tight">
              Booking Registry
            </h1>
            <p className="text-xs sm:text-sm text-rx-muted mt-1">
              Global log of all renter reservations, schedules, and fulfillment statuses
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-rx-card p-4 rounded-2xl border border-rx-border shadow-md">
            <div className="flex items-center gap-2 min-w-[200px]">
              <span className="text-xs font-bold text-rx-muted shrink-0">Trip Status:</span>
              <CustomSelect
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'pending', label: 'Pending', badge: 'Pending' },
                  { value: 'approved', label: 'Approved', badge: 'Active' },
                  { value: 'completed', label: 'Completed', badge: 'Done' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
                placeholder="All Statuses"
                size="sm"
              />
            </div>

            <div className="flex items-center gap-2 min-w-[200px]">
              <span className="text-xs font-bold text-rx-muted shrink-0">Payment Status:</span>
              <CustomSelect
                options={[
                  { value: '', label: 'All Payments' },
                  { value: 'unpaid', label: 'Unpaid' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'partially_paid', label: 'Partially Paid' },
                  { value: 'paid', label: 'Paid', badge: 'Paid' },
                  { value: 'refunded', label: 'Refunded' },
                ]}
                value={paymentFilter}
                onChange={(val) => {
                  setPaymentFilter(val);
                  setPage(1);
                }}
                placeholder="All Payments"
                size="sm"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="bg-rx-card rounded-3xl border border-rx-border p-8 shadow-xl">
              <table className="w-full">
                <tbody>
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                </tbody>
              </table>
            </div>
          ) : bookings.length > 0 ? (
            <div className="bg-rx-card rounded-3xl border border-rx-border shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-rx-page/50 border-b border-rx-border text-rx-muted font-bold uppercase text-[10px]">
                      <th className="py-4 px-5">Booking Ref</th>
                      <th className="py-4 px-4">Vehicle</th>
                      <th className="py-4 px-4">Renter</th>
                      <th className="py-4 px-4">Rental Dates</th>
                      <th className="py-4 px-4">Amount</th>
                      <th className="py-4 px-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rx-border">
                    {bookings.map((b) => (
                      <tr key={b._id} className="hover:bg-rx-surface/50 transition-colors">
                        <td className="py-4 px-5 font-mono font-bold text-rx-accent">
                          #{b._id.substring(b._id.length - 8).toUpperCase()}
                        </td>

                        <td className="py-4 px-4 font-semibold text-rx-main">
                          {b.vehicle?.make} {b.vehicle?.model}
                        </td>

                        <td className="py-4 px-4 text-rx-muted">
                          <span className="font-semibold block">{b.renter?.name || 'Renter'}</span>
                          <span className="text-[10px] text-rx-muted block">{b.renter?.email || ''}</span>
                        </td>

                        <td className="py-4 px-4 text-rx-muted font-medium">
                          {formatDate(b.startDate)} &rarr;{' '}
                          {formatDate(b.endDate)}
                          <span className="text-[10px] text-rx-muted block">
                            {b.rentalDays} days {b.withDriver ? '(With Driver)' : ''}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-extrabold text-rx-main text-sm">
                          {formatCurrency(b.totalAmount)}
                        </td>

                        <td className="py-4 px-5 text-right space-x-1.5">
                          <Badge status={b.status}>{b.status}</Badge>
                          <Badge status={b.paymentStatus}>{b.paymentStatus}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={CalendarCheck}
              title="No Booking Records Found"
              description="No booking entries matched your current filter criteria."
            />
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-rx-border text-xs font-bold text-rx-muted bg-rx-card hover:bg-rx-surface disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-xs text-rx-muted">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-rx-border text-xs font-bold text-rx-muted bg-rx-card hover:bg-rx-surface disabled:opacity-40 cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookingsPage;
