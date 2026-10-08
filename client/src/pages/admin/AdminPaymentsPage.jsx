import React, { useState, useEffect } from 'react';
import { CreditCard, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import adminApi from '../../api/adminApi';
import Badge from '../../components/common/Badge';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

export const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;

      const res = await adminApi.getAllPaymentsAdmin(params);
      setPayments(res?.payments || []);
      if (res?.pagination) setPagination(res.pagination);
    } catch (err) {
      console.warn('Failed to load admin payments:', err.message);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-rx-main">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AdminSidebar />

        <div className="flex-1 w-full space-y-6">
          <div className="pb-6 border-b border-rx-border">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-rx-main tracking-tight">
              Payment Transactions
            </h1>
            <p className="text-xs sm:text-sm text-rx-muted mt-1">
              Financial ledger of all customer deposits, gateway transactions, and refunds
            </p>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { label: 'All Transactions', val: '' },
              { label: 'Paid Full', val: 'paid' },
              { label: 'Partially Paid', val: 'partially_paid' },
              { label: 'Created / Unpaid', val: 'created' },
              { label: 'Refunded', val: 'refunded' },
              { label: 'Failed', val: 'failed' },
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
          ) : payments.length > 0 ? (
            <div className="bg-rx-card rounded-3xl border border-rx-border shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-rx-page/50 border-b border-rx-border text-rx-muted font-bold uppercase text-[10px]">
                      <th className="py-4 px-5">Transaction ID</th>
                      <th className="py-4 px-4">Renter</th>
                      <th className="py-4 px-4">Booking Ref</th>
                      <th className="py-4 px-4">Amounts</th>
                      <th className="py-4 px-4">Method & Date</th>
                      <th className="py-4 px-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rx-border">
                    {payments.map((p) => {
                      const r = p.renter || {};
                      const b = p.booking || {};

                      return (
                        <tr key={p._id} className="hover:bg-rx-surface/50 transition-colors">
                          <td className="py-4 px-5 font-mono font-bold text-rx-accent">
                            {p.transactionId || `#TXN-${p._id.substring(p._id.length - 8).toUpperCase()}`}
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-semibold text-rx-main block">{r.name || 'User'}</span>
                            <span className="text-[10px] text-rx-muted block">{r.email || ''}</span>
                          </td>

                          <td className="py-4 px-4 font-mono text-rx-muted">
                            #{b._id ? b._id.substring(b._id.length - 8).toUpperCase() : 'N/A'}
                          </td>

                          <td className="py-4 px-4 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-rx-muted text-[10px]">Total:</span>
                              <strong className="text-rx-main font-bold">${p.totalAmount}</strong>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-rx-muted text-[10px]">Paid:</span>
                              <span className="text-rx-accent font-bold">${p.paidAmount}</span>
                            </div>
                            {p.remainingAmount > 0 && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-rx-muted text-[10px]">Due:</span>
                                <span className="text-rx-accent font-semibold">${p.remainingAmount}</span>
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-4 text-rx-muted">
                            <span className="font-semibold uppercase text-[10px] text-rx-muted block">
                              {p.method || 'Demo'}
                            </span>
                            <span className="text-[10px] text-rx-muted block">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </span>
                          </td>

                          <td className="py-4 px-5 text-right">
                            <Badge status={p.status}>{p.status}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={CreditCard}
              title="No Payment Records Found"
              description="No financial transactions matched the selected status filter."
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

export default AdminPaymentsPage;
