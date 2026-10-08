import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck,
  Users,
  Car,
  CalendarCheck,
  CreditCard,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSidebar = () => {
  const { switchRole } = useAuth();

  const links = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Vehicle Verification', path: '/admin/verification', icon: FileCheck },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'All Vehicles', path: '/admin/vehicles', icon: Car },
    { label: 'Booking Records', path: '/admin/bookings', icon: CalendarCheck },
    { label: 'Payment Ledger', path: '/admin/payments', icon: CreditCard },
  ];

  return (
    <aside className="w-full lg:w-64 bg-rx-card text-rx-main rounded-3xl border border-rx-border p-5 flex flex-col gap-6 shrink-0 h-fit shadow-xl">
      <div>
        <div className="flex items-center gap-2.5 px-2 pb-4 border-b border-rx-border">
          <div className="w-9 h-9 rounded-xl bg-rx-surface border border-rx-border text-rx-main flex items-center justify-center font-bold text-sm shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rx-main leading-tight">Admin Console</h4>
            <p className="text-[10px] text-rx-muted">Platform Governance</p>
          </div>
        </div>

        <nav className="mt-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-rx-surface text-rx-main border border-rx-accent/40 shadow-sm'
                      : 'text-rx-muted hover:text-rx-main hover:bg-rx-surface/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 opacity-80" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-rx-border">
        <button
          type="button"
          onClick={() => switchRole('renter')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rx-main bg-rx-surface hover:bg-rx-border rounded-xl transition-colors cursor-pointer border border-rx-border"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Exit Admin Console
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
