import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  CalendarCheck,
  CreditCard,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import bookingApi from '../../api/bookingApi';
import Badge from '../../components/common/Badge';

export const OwnerEarningsPage = () => {
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    completedBookingsCount: 0,
    pendingEarnings: 0,
    bookings: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const res = await bookingApi.getOwnerEarnings();
        if (isMounted && res) {
          setEarnings(res);
        }
      } catch (err) {
        console.warn('Failed to load owner earnings:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEarnings();
    return () => {
      isMounted = false;
    };
  }, []);

  const total = earnings.totalEarnings || 0;
  const completed = earnings.completedBookingsCount || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-rx-main">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <OwnerSidebar />

        <div className="flex-1 min-w-0 w-full space-y-8">
          {/* Header */}
          <div className="pb-6 border-b border-rx-border">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-rx-main tracking-tight">
              Host Earnings & Financials
            </h1>
            <p className="text-xs sm:text-sm text-rx-muted mt-1">
              Detailed breakdown of trip revenue, completed payouts, and transaction history
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-rx-card border border-rx-border rounded-3xl shadow-xl space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rx-accent">
                Total Revenue
              </span>
              <p className="text-3xl sm:text-4xl font-extrabold text-rx-main">${total}</p>
              <div className="flex items-center gap-1.5 text-xs text-rx-accent pt-2">
                <TrendingUp className="w-4 h-4 text-rx-accent" />
                <span>Earned across all completed rentals</span>
              </div>
            </div>

            <div className="p-6 bg-rx-card rounded-3xl border border-rx-border shadow-xl space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rx-muted">
                Completed Trips
              </span>
              <p className="text-3xl sm:text-4xl font-extrabold text-rx-main">{completed}</p>
              <div className="flex items-center gap-1.5 text-xs text-rx-muted pt-2">
                <CheckCircle2 className="w-4 h-4 text-rx-accent" />
                <span>Verified completed bookings</span>
              </div>
            </div>

            <div className="p-6 bg-rx-card rounded-3xl border border-rx-border shadow-xl space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rx-muted">
                Average Payout / Trip
              </span>
              <p className="text-3xl sm:text-4xl font-extrabold text-rx-accent">
                ${completed > 0 ? (total / completed).toFixed(0) : '0'}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-rx-muted pt-2">
                <DollarSign className="w-4 h-4 text-rx-accent" />
                <span>Per completed rental</span>
              </div>
            </div>
          </div>

          {/* Visual Payout Progress */}
          <div className="bg-rx-card rounded-3xl border border-rx-border p-6 sm:p-7 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-rx-main">Earnings Performance</h3>
              <span className="text-xs text-rx-muted">Live data from RideX Ledger</span>
            </div>

            <div className="h-3 bg-rx-surface rounded-full overflow-hidden flex border border-rx-border">
              <div
                style={{ width: `${Math.min(100, Math.max(8, (total / 1000) * 100))}%` }}
                className="bg-rx-accent h-full rounded-full transition-all duration-500 shadow-md"
              />
            </div>
            <div className="flex justify-between text-xs text-rx-muted">
              <span>$0 Baseline</span>
              <span>Next Milestone: $1,000</span>
            </div>
          </div>

          {/* Booking History Table */}
          <div className="bg-rx-card rounded-3xl border border-rx-border shadow-xl overflow-hidden space-y-4 p-6">
            <h3 className="text-base font-bold text-rx-main">Rental Transaction Log</h3>

            {earnings.bookings && earnings.bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-rx-border text-rx-muted font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Booking Ref</th>
                      <th className="py-3 px-4">Vehicle</th>
                      <th className="py-3 px-4">Rental Duration</th>
                      <th className="py-3 px-4">Payout Amount</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rx-border">
                    {earnings.bookings.map((b) => (
                      <tr key={b._id} className="hover:bg-rx-surface/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-rx-accent">
                          #{b._id.substring(b._id.length - 8).toUpperCase()}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-rx-main">
                          {b.vehicle?.make} {b.vehicle?.model}
                        </td>
                        <td className="py-3.5 px-4 text-rx-muted">
                          {b.rentalDays} days ({new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()})
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-rx-accent text-sm">
                          ${b.totalAmount}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Badge status={b.paymentStatus}>{b.paymentStatus}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-rx-muted py-8 text-center bg-rx-surface rounded-2xl border border-rx-border">
                No completed trip earnings recorded yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerEarningsPage;
