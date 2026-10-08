import React, { useState, useEffect } from 'react';
import { Users, Search, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import adminApi from '../../api/adminApi';
import Badge from '../../components/common/Badge';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (roleFilter) params.role = roleFilter;
      if (search.trim()) params.search = search.trim();

      const res = await adminApi.getAllUsers(params);
      setUsers(res?.users || []);
      if (res?.pagination) setPagination(res.pagination);
    } catch (err) {
      console.warn('Failed to load users:', err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-rx-main">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AdminSidebar />

        <div className="flex-1 w-full space-y-6">
          <div className="pb-6 border-b border-rx-border">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-rx-main tracking-tight">
              User Management
            </h1>
            <p className="text-xs sm:text-sm text-rx-muted mt-1">
              Browse platform registered accounts, permissions, and verification statuses
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-rx-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-rx-card border border-rx-border rounded-xl text-xs text-rx-main placeholder-rx-muted focus:outline-none focus:border-rx-accent shadow-sm"
              />
            </form>

            <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
              {[
                { label: 'All Users', val: '' },
                { label: 'Renters', val: 'renter' },
                { label: 'Hosts', val: 'owner' },
                { label: 'Admins', val: 'admin' },
              ].map((r) => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => {
                    setRoleFilter(r.val);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    roleFilter === r.val
                      ? 'bg-rx-accent text-rx-on-accent shadow-md'
                      : 'bg-rx-card text-rx-muted border border-rx-border hover:text-rx-main'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="bg-rx-card rounded-3xl border border-rx-border p-8 shadow-xl">
              <table className="w-full">
                <tbody>
                  <TableRowSkeleton cols={5} />
                  <TableRowSkeleton cols={5} />
                </tbody>
              </table>
            </div>
          ) : users.length > 0 ? (
            <div className="bg-rx-card rounded-3xl border border-rx-border shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-rx-page/50 border-b border-rx-border text-rx-muted font-bold uppercase text-[10px]">
                      <th className="py-4 px-5">User</th>
                      <th className="py-4 px-4">Contact</th>
                      <th className="py-4 px-4">Roles</th>
                      <th className="py-4 px-4">Joined Date</th>
                      <th className="py-4 px-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rx-border">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-rx-surface/50 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-rx-surface text-rx-accent border border-rx-border flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {u.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <h4 className="font-bold text-rx-main">{u.name}</h4>
                              <span className="text-rx-muted text-[11px] font-mono">{u._id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 space-y-0.5">
                          <span className="font-medium text-rx-muted block">{u.email}</span>
                          <span className="text-rx-muted text-[11px] block">{u.phone || 'No phone'}</span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {u.roles?.map((r) => (
                              <Badge key={r} status={r}>
                                {r}
                              </Badge>
                            ))}
                          </div>
                        </td>

                        <td className="py-4 px-4 text-rx-muted font-medium">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-4 px-5 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rx-accent-soft/40 text-rx-accent border border-rx-accent-border/60">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No Users Found"
              description="No user records matched your search query or role filter."
            />
          )}

          {/* Pagination */}
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

export default AdminUsersPage;
