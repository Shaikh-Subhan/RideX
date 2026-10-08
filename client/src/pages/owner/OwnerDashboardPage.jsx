import React, { useState, useEffect } from 'react';
import { getVehicleImageUrl } from '../../utils/vehicleImage';
import { Link } from 'react-router-dom';
import {
  Car,
  CalendarCheck,
  DollarSign,
  ShieldAlert,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import vehicleApi from '../../api/vehicleApi';
import bookingApi from '../../api/bookingApi';
import notificationApi from '../../api/notificationApi';
import Badge from '../../components/common/Badge';

export const OwnerDashboardPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState({ totalEarnings: 0, completedBookings: 0, pendingPayouts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [vehiclesRes, bookingsRes, earningsRes] = await Promise.all([
          vehicleApi.getMyVehicles().catch(() => ({ vehicles: [] })),
          bookingApi.getOwnerBookings().catch(() => ({ bookings: [] })),
          bookingApi.getOwnerEarnings().catch(() => ({ totalEarnings: 0, completedBookings: 0 })),
        ]);

        if (isMounted) {
          setVehicles(vehiclesRes?.vehicles || []);
          setBookings(bookingsRes?.bookings || []);
          setEarnings(earningsRes || { totalEarnings: 0, completedBookings: 0 });
        }
      } catch (err) {
        console.error('Owner dashboard error:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalVehicles = vehicles.length;
  const pendingVerification = vehicles.filter(
    (v) => v.verification?.status === 'pending' || !v.verification?.status
  ).length;
  const activeBookings = bookings.filter((b) => b.status === 'approved' || b.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-rx-main">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Owner Nav Sidebar */}
        <OwnerSidebar />

        {/* Dashboard Main Content */}
        <div className="flex-1 min-w-0 w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-rx-border">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-rx-main tracking-tight">
                Host Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-rx-muted mt-1">
                Overview of your rental fleet, incoming requests, and performance metrics
              </p>
            </div>

            <Link
              to="/owner/vehicles/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent text-xs font-extrabold transition-all shadow-md self-start sm:self-auto cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Vehicle</span>
            </Link>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 bg-rx-card rounded-3xl border border-rx-border shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rx-surface border border-rx-border flex items-center justify-center text-rx-accent shrink-0">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-rx-muted uppercase tracking-wider">
                  Total Vehicles
                </span>
                <p className="text-2xl font-extrabold text-rx-main">{totalVehicles}</p>
              </div>
            </div>

            <div className="p-5 bg-rx-card rounded-3xl border border-rx-border shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rx-surface border border-rx-border flex items-center justify-center text-rx-accent shrink-0">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-rx-muted uppercase tracking-wider">
                  Active Bookings
                </span>
                <p className="text-2xl font-extrabold text-rx-main">{activeBookings}</p>
              </div>
            </div>

            <div className="p-5 bg-rx-card rounded-3xl border border-rx-border shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rx-surface border border-rx-border flex items-center justify-center text-rx-accent shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-rx-muted uppercase tracking-wider">
                  Total Earnings
                </span>
                <p className="text-2xl font-extrabold text-rx-accent">
                  ${earnings.totalEarnings || 0}
                </p>
              </div>
            </div>

            <div className="p-5 bg-rx-card rounded-3xl border border-rx-border shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rx-surface border border-rx-border flex items-center justify-center text-rx-accent shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-rx-muted uppercase tracking-wider">
                  Pending Verification
                </span>
                <p className="text-2xl font-extrabold text-rx-accent">{pendingVerification}</p>
              </div>
            </div>
          </div>

          {/* Verification Callout if any pending or unverified */}
          {pendingVerification > 0 && (
            <div className="p-5 bg-rx-accent-soft/30 border border-rx-accent-border/60 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rx-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-rx-main">Vehicle Documents Pending Review</h4>
                  <p className="text-xs text-rx-muted mt-0.5">
                    {pendingVerification} of your vehicles require registration & insurance documents or admin verification to appear on the marketplace.
                  </p>
                </div>
              </div>
              <Link
                to="/owner/vehicles"
                className="px-4 py-2 bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent text-xs font-bold rounded-xl transition-colors shrink-0 shadow-md"
              >
                Inspect Vehicles
              </Link>
            </div>
          )}

          {/* Recent Bookings & Fleet Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Bookings */}
            <div className="bg-rx-card rounded-3xl border border-rx-border p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-rx-main">Recent Booking Requests</h3>
                <Link
                  to="/owner/bookings"
                  className="text-xs font-bold text-rx-accent hover:text-rx-accent"
                >
                  View All &rarr;
                </Link>
              </div>

              {bookings.length === 0 ? (
                <p className="text-xs text-rx-muted py-8 text-center bg-rx-surface rounded-2xl border border-rx-border">
                  No booking requests received yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {bookings.slice(0, 4).map((b) => (
                    <div
                      key={b._id}
                      className="p-3.5 bg-rx-surface rounded-2xl border border-rx-border flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-rx-main">
                          {b.vehicle?.make} {b.vehicle?.model}
                        </p>
                        <p className="text-[11px] text-rx-muted">
                          By {b.renter?.name || 'Renter'} &bull; {b.rentalDays} days
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-rx-accent block">${b.totalAmount}</span>
                        <Badge status={b.status}>{b.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fleet Status */}
            <div className="bg-rx-card rounded-3xl border border-rx-border p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-rx-main">Fleet Overview</h3>
                <Link
                  to="/owner/vehicles"
                  className="text-xs font-bold text-rx-accent hover:text-rx-accent"
                >
                  Manage Cars &rarr;
                </Link>
              </div>

              {vehicles.length === 0 ? (
                <div className="py-8 text-center bg-rx-surface rounded-2xl border border-rx-border space-y-2">
                  <p className="text-xs text-rx-muted">You haven't listed any vehicles yet.</p>
                  <Link
                    to="/owner/vehicles/new"
                    className="inline-block px-3 py-1.5 bg-rx-accent text-rx-on-accent rounded-xl text-xs font-bold"
                  >
                    Add your first car
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicles.slice(0, 4).map((v) => (
                    <div
                      key={v._id}
                      className="p-3 bg-rx-surface rounded-2xl border border-rx-border flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={getVehicleImageUrl(v)}
                          alt={v.model}
                          className="w-10 h-8 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-bold text-rx-main">
                            {v.make} {v.model}
                          </p>
                          <span className="text-[10px] text-rx-accent font-semibold">${v.rentalPricePerDay}/day</span>
                        </div>
                      </div>
                      <Badge status={v.verification?.status || 'pending'}>
                        {v.verification?.status || 'pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboardPage;
