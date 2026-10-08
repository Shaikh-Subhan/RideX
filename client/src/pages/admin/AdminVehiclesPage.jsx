import React, { useState, useEffect } from 'react';
import { getVehicleImageUrl } from '../../utils/vehicleImage';
import { Link } from 'react-router-dom';
import {
  Car,
  Search,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  ExternalLink,
  Check,
  X,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import adminApi from '../../api/adminApi';
import Badge from '../../components/common/Badge';
import RatingStars from '../../components/common/RatingStars';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

export const AdminVehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  // Verification action modal
  const [confirmModal, setConfirmModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await adminApi.getAllVehiclesAdmin(params);
      setVehicles(res?.vehicles || []);
      if (res?.pagination) setPagination(res.pagination);
    } catch (err) {
      console.warn('Failed to load admin vehicles:', err.message);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchVehicles();
  };

  const handleReviewAction = async () => {
    if (!confirmModal) return;
    const { id, status } = confirmModal;

    try {
      setSubmitting(true);
      await adminApi.reviewVehicleVerification(id, status);
      success(
        `Vehicle ${status === 'verified' ? 'verified & approved' : 'rejected'}. Host notified!`
      );
      setConfirmModal(null);
      fetchVehicles();
    } catch (err) {
      toastError(err.response?.data?.message || 'Verification update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-rx-main">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AdminSidebar />

        <div className="flex-1 w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-rx-border">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-rx-main tracking-tight">
                Vehicle Inventory & Verification
              </h1>
              <p className="text-xs sm:text-sm text-rx-muted mt-1">
                Complete catalog of platform vehicles, verification stages, and instant host approvals
              </p>
            </div>

            <Link
              to="/admin/verification"
              className="inline-flex items-center gap-2 px-4 py-2 bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent text-xs font-bold rounded-xl transition-all shadow-md self-start sm:self-auto"
            >
              <FileCheck className="w-4 h-4" />
              <span>Review Pending Documents</span>
            </Link>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-rx-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search make, model, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-rx-card border border-rx-border rounded-xl text-xs text-rx-main placeholder-rx-muted focus:outline-none focus:border-rx-accent shadow-sm"
              />
            </form>

            <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
              {[
                { label: 'All Fleet', val: '' },
                { label: 'Verified', val: 'verified' },
                { label: 'Pending', val: 'pending' },
                { label: 'Rejected', val: 'rejected' },
              ].map((s) => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => {
                    setStatusFilter(s.val);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === s.val
                      ? 'bg-rx-accent text-rx-on-accent shadow-md'
                      : 'bg-rx-card text-rx-muted border border-rx-border hover:text-rx-main'
                  }`}
                >
                  {s.label}
                </button>
              ))}
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
          ) : vehicles.length > 0 ? (
            <div className="bg-rx-card rounded-3xl border border-rx-border shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-rx-page/50 border-b border-rx-border text-rx-muted font-bold uppercase text-[10px]">
                      <th className="py-4 px-5">Vehicle</th>
                      <th className="py-4 px-4">Host</th>
                      <th className="py-4 px-4">Daily Rate</th>
                      <th className="py-4 px-4">Location</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-5 text-right">Verification Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rx-border">
                    {vehicles.map((v) => {
                      const verifStatus = v.verification?.status || 'pending';
                      const owner = v.owner || {};

                      return (
                        <tr key={v._id} className="hover:bg-rx-surface/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <img
                                src={getVehicleImageUrl(v)}
                                alt={v.model}
                                className="w-12 h-9 object-cover rounded-xl shrink-0 border border-rx-border"
                              />
                              <div>
                                <h4 className="font-bold text-rx-main flex items-center gap-1.5">
                                  <span>{v.make} {v.model}</span>
                                  {v.vehicleNumber && (
                                    <span className="px-1.5 py-0.2 rounded bg-rx-page text-rx-accent border border-rx-border text-[9px] font-mono font-bold uppercase">
                                      {v.vehicleNumber}
                                    </span>
                                  )}
                                </h4>
                                <span className="text-rx-muted text-[11px]">
                                  {v.year} &bull; {v.vehicleType}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-semibold text-rx-muted block">
                              {owner.name || 'Host'}
                            </span>
                            <span className="text-rx-muted text-[11px] block">{owner.email || ''}</span>
                          </td>

                          <td className="py-4 px-4 font-bold text-rx-accent">
                            ${v.rentalPricePerDay}/day
                          </td>

                          <td className="py-4 px-4 text-rx-muted font-medium">
                            {v.location || 'Flexible'}
                          </td>

                          <td className="py-4 px-4">
                            <Badge status={verifStatus}>{verifStatus}</Badge>
                          </td>

                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {verifStatus === 'pending' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setConfirmModal({
                                        id: v._id,
                                        status: 'verified',
                                        title: 'Approve & Verify Vehicle?',
                                        message: `Approve verification for ${v.make} ${v.model}? This vehicle will immediately go live on the public marketplace.`,
                                      })
                                    }
                                    className="p-1.5 bg-rx-accent-soft/60 hover:bg-rx-accent-dark/80 text-rx-accent border border-rx-accent-border/60 rounded-lg transition-colors cursor-pointer"
                                    title="Approve & Verify"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setConfirmModal({
                                        id: v._id,
                                        status: 'rejected',
                                        title: 'Reject Vehicle Documents?',
                                        message: `Decline verification for ${v.make} ${v.model}?`,
                                      })
                                    }
                                    className="p-1.5 bg-rx-accent-soft/60 hover:bg-rx-accent-dark/80 text-rx-accent border border-rx-accent-border/60 rounded-lg transition-colors cursor-pointer"
                                    title="Reject Documents"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>

                                  <Link
                                    to="/admin/verification"
                                    className="p-1.5 text-rx-accent hover:bg-rx-surface rounded-lg border border-rx-border"
                                    title="Inspect Submitted Documents"
                                  >
                                    <FileCheck className="w-4 h-4" />
                                  </Link>
                                </>
                              )}

                              <Link
                                to={`/cars/${v._id}`}
                                className="p-1.5 text-rx-muted hover:text-rx-main hover:bg-rx-surface rounded-lg"
                                title="View public page"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="p-4 bg-rx-page/30 border-t border-rx-border flex items-center justify-between">
                  <span className="text-xs text-rx-muted">
                    Showing Page {page} of {pagination.totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="p-1.5 bg-rx-card border border-rx-border rounded-lg text-rx-muted disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      className="p-1.5 bg-rx-card border border-rx-border rounded-lg text-rx-muted disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={Car}
              title="No Vehicles Found"
              description="No vehicle listings matched your search criteria."
            />
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        onConfirm={handleReviewAction}
        loading={submitting}
        title={confirmModal?.title || 'Review Verification'}
        message={confirmModal?.message || 'Proceed with this verification decision?'}
        confirmText={confirmModal?.status === 'verified' ? 'Confirm Approval' : 'Confirm Rejection'}
        isDanger={confirmModal?.status === 'rejected'}
      />
    </div>
  );
};

export default AdminVehiclesPage;
