import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldX, PlusCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const RoleRoute = ({ allowedRoles = [], children }) => {
  const { roles, isAuthenticated, loading, addRole } = useAuth();
  const { success, error: toastError } = useToast();
  const [addingRole, setAddingRole] = useState(false);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-rx-accent border-t-rx-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-rx-muted">Verifying role permissions...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = allowedRoles.some((role) => roles.includes(role));

  if (!hasAccess) {
    const isOwnerRoute = allowedRoles.includes('owner');

    const handleEnableOwner = async () => {
      try {
        setAddingRole(true);
        await addRole('owner');
        success('Owner account activated! You can now manage vehicles.');
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to activate owner role');
      } finally {
        setAddingRole(false);
      }
    };

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-rx-card rounded-3xl border border-rx-border shadow-2xl p-8 text-center text-rx-main">
          <div className="w-16 h-16 rounded-2xl bg-rx-accent-soft/40 border border-rx-accent-border/50 flex items-center justify-center text-rx-accent mx-auto mb-5 shadow-sm">
            <ShieldX className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-rx-main mb-2">Access Restricted</h2>
          <p className="text-xs sm:text-sm text-rx-muted mb-6 leading-relaxed">
            This section requires{' '}
            <span className="font-bold text-rx-accent uppercase">
              {allowedRoles.join(' or ')}
            </span>{' '}
            privileges. Your account currently has{' '}
            <span className="font-semibold text-rx-muted">
              {roles.join(', ') || 'no'}
            </span>{' '}
            roles.
          </p>

          <div className="flex flex-col gap-3">
            {isOwnerRoute && !roles.includes('owner') && (
              <button
                onClick={handleEnableOwner}
                disabled={addingRole}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                {addingRole ? 'Activating...' : 'Activate Owner Account'}
              </button>
            )}

            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rx-surface text-rx-muted font-semibold text-xs hover:bg-rx-border transition-colors border border-rx-border"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleRoute;
