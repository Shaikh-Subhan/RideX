import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Car,
  CalendarCheck,
  CreditCard,
  FileCheck,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  DollarSign
} from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import adminApi from '../../api/adminApi';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getDashboardStats();
        if (isMounted && res) {
          setStats(res);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const users = stats?.users || {};
  const vehicles = stats?.vehicles || {};
  const bookings = stats?.bookings || {};
  const payments = stats?.payments || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-rx-main">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AdminSidebar />

        <div className="flex-1 w-full space-y-8">
          {/* Header */}
          <div className="pb-6 border-b border-rx-border">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-rx-main tracking-tight">
              Platform Overview
            </h1>
            <p className="text-xs sm:text-sm text-rx-muted mt-1">
              Global system monitoring, financial totals, and marketplace statistics
            </p>
          </div>

          {/* Pending Verifications Alert */}
          {vehicles.pending > 0 && (
            <div className="p-4 sm:p-5 bg-rx-accent-soft/40 border border-rx-accent-border/60 rounded-3xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-rx-accent shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-rx-accent">
                    {vehicles.pending} Vehicle Document Verifications Pending
                  </h4>
                  <p className="text-xs text-rx-muted">
                    Host registration documents and insurance certificates require administrative review.
                  </p>
                </div>
              </div>
              <Link
                to="/admin/verification"
                className="px-4 py-2 bg-rx-accent hover:bg-rx-accent-soft text-rx-main text-xs font-bold rounded-xl transition-colors shrink-0 shadow-md"
              >
                Review Now
              </Link>
            </div>
          )}

          {/* Financial Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-rx-card border border-rx-border text-rx-main rounded-3xl shadow-xl space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rx-accent">
                Total Collected Revenue
              </span>
              <p className="text-3xl sm:text-4xl font-extrabold text-rx-accent">
                ${payments.totalCollectedAmount || 0}
              </p>
              <p className="text-xs text-rx-muted pt-1">
                From {payments.paid || 0} fully paid and {payments.partiallyPaid || 0} partial transactions
              </p>
            </div>

            <div className="p-6 bg-rx-card border border-rx-border rounded-3xl shadow-xl space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rx-accent">
                Total Refunded Volume
              </span>
              <p className="text-3xl sm:text-4xl font-extrabold text-rx-main">
                ${payments.totalRefundedAmount || 0}
              </p>
              <p className="text-xs text-rx-muted pt-1">
                From {payments.refunded || 0} processed refund requests
              </p>
            </div>
          </div>

          {/* System Breakdown Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Users Breakdown */}
            <div className="bg-rx-card rounded-3xl border border-rx-border p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-rx-border">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-rx-accent" />
                  <h3 className="font-bold text-rx-main text-base">Users Directory</h3>
                </div>
                <span className="text-sm font-extrabold text-rx-main">
                  {users.total || 0} total
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 bg-rx-surface rounded-2xl border border-rx-border">
                  <span className="text-rx-muted text-[10px] uppercase font-bold block">Renters</span>
                  <span className="text-lg font-bold text-rx-accent">{users.renters || 0}</span>
                </div>
                <div className="p-3 bg-rx-surface rounded-2xl border border-rx-border">
                  <span className="text-rx-muted text-[10px] uppercase font-bold block">Hosts</span>
                  <span className="text-lg font-bold text-rx-accent">{users.owners || 0}</span>
                </div>
                <div className="p-3 bg-rx-surface rounded-2xl border border-rx-border">
                  <span className="text-rx-muted text-[10px] uppercase font-bold block">Admins</span>
                  <span className="text-lg font-bold text-rx-accent">{users.admins || 0}</span>
                </div>
              </div>
            </div>

            {/* Vehicles Breakdown */}
            <div className="bg-rx-card rounded-3xl border border-rx-border p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-rx-border">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-rx-accent" />
                  <h3 className="font-bold text-rx-main text-base">Vehicles Fleet</h3>
                </div>
                <span className="text-sm font-extrabold text-rx-main">
                  {vehicles.total || 0} total
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 bg-rx-accent-soft/40 rounded-2xl border border-rx-accent-border/60">
                  <span className="text-rx-accent text-[10px] uppercase font-bold block">Verified</span>
                  <span className="text-lg font-bold text-rx-accent">{vehicles.verified || 0}</span>
                </div>
                <div className="p-3 bg-rx-accent-soft/40 rounded-2xl border border-rx-accent-border/60">
                  <span className="text-rx-accent text-[10px] uppercase font-bold block">Pending</span>
                  <span className="text-lg font-bold text-rx-accent">{vehicles.pending || 0}</span>
                </div>
                <div className="p-3 bg-rx-accent-soft/40 rounded-2xl border border-rx-accent-border/60">
                  <span className="text-rx-accent text-[10px] uppercase font-bold block">Rejected</span>
                  <span className="text-lg font-bold text-rx-accent">{vehicles.rejected || 0}</span>
                </div>
              </div>
            </div>

            {/* Bookings Breakdown */}
            <div className="bg-rx-card rounded-3xl border border-rx-border p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-rx-border">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-rx-accent" />
                  <h3 className="font-bold text-rx-main text-base">Bookings Status</h3>
                </div>
                <span className="text-sm font-extrabold text-rx-main">
                  {bookings.total || 0} total
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="p-2.5 bg-rx-surface rounded-xl border border-rx-border">
                  <span className="text-rx-muted text-[10px] block">Pending</span>
                  <span className="text-sm font-bold text-rx-accent">{bookings.pending || 0}</span>
                </div>
                <div className="p-2.5 bg-rx-surface rounded-xl border border-rx-border">
                  <span className="text-rx-muted text-[10px] block">Approved</span>
                  <span className="text-sm font-bold text-rx-accent">{bookings.approved || 0}</span>
                </div>
                <div className="p-2.5 bg-rx-surface rounded-xl border border-rx-border">
                  <span className="text-rx-muted text-[10px] block">Completed</span>
                  <span className="text-sm font-bold text-rx-accent">{bookings.completed || 0}</span>
                </div>
                <div className="p-2.5 bg-rx-surface rounded-xl border border-rx-border">
                  <span className="text-rx-muted text-[10px] block">Rejected</span>
                  <span className="text-sm font-bold text-rx-accent">{bookings.rejected || 0}</span>
                </div>
                <div className="p-2.5 bg-rx-surface rounded-xl border border-rx-border">
                  <span className="text-rx-muted text-[10px] block">Cancelled</span>
                  <span className="text-sm font-bold text-rx-muted">{bookings.cancelled || 0}</span>
                </div>
              </div>
            </div>

            {/* Payments Ledger */}
            <div className="bg-rx-card rounded-3xl border border-rx-border p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-rx-border">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-rx-accent" />
                  <h3 className="font-bold text-rx-main text-base">Payment Ledger</h3>
                </div>
                <span className="text-sm font-extrabold text-rx-main">
                  {payments.total || 0} transactions
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-rx-accent-soft/40 rounded-xl border border-rx-accent-border/60">
                  <span className="text-rx-accent text-[10px] block">Paid Full</span>
                  <span className="text-sm font-bold text-rx-accent">{payments.paid || 0}</span>
                </div>
                <div className="p-2.5 bg-rx-accent-soft/40 rounded-xl border border-rx-accent-border/60">
                  <span className="text-rx-accent text-[10px] block">Partial</span>
                  <span className="text-sm font-bold text-rx-accent">{payments.partiallyPaid || 0}</span>
                </div>
                <div className="p-2.5 bg-rx-surface rounded-xl border border-rx-border">
                  <span className="text-rx-accent text-[10px] block">Created</span>
                  <span className="text-sm font-bold text-rx-accent">{payments.created || 0}</span>
                </div>
                <div className="p-2.5 bg-rx-accent-soft/40 rounded-xl border border-rx-accent-border/60">
                  <span className="text-rx-accent text-[10px] block">Failed/Ref.</span>
                  <span className="text-sm font-bold text-rx-accent">
                    {(payments.failed || 0) + (payments.refunded || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
