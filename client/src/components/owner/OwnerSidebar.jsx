import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  CalendarCheck,
  IndianRupee,
  PlusCircle,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const OwnerSidebar = () => {
  const { switchRole } = useAuth();
  const location = useLocation();

  const links = [
    { label: 'Overview', path: '/owner', icon: LayoutDashboard, end: true },
    { label: 'My Vehicles', path: '/owner/vehicles', icon: Car },
    { label: 'Add Vehicle', path: '/owner/vehicles/new', icon: PlusCircle },
    { label: 'Booking Requests', path: '/owner/bookings', icon: CalendarCheck },
    { label: 'Earnings & Payouts', path: '/owner/earnings', icon: IndianRupee },
  ];
  const activeLinkPath = links
    .filter((link) => location.pathname === link.path || (!link.end && location.pathname.startsWith(`${link.path}/`)))
    .sort((a, b) => b.path.length - a.path.length)[0]?.path;

  return (
    <aside className="w-full lg:w-64 bg-rx-card rounded-3xl border border-rx-border shadow-xl p-5 flex flex-col gap-6 shrink-0 h-fit text-rx-main">
      <div>
        <div className="flex items-center gap-2.5 px-2 pb-4 border-b border-rx-border">
          <div className="w-9 h-9 rounded-xl bg-rx-surface border border-rx-border text-rx-main flex items-center justify-center font-bold text-xs">
            H
          </div>
          <div>
            <h4 className="text-sm font-bold text-rx-main leading-tight">Host Portal</h4>
            <p className="text-[10px] text-rx-muted">Manage fleet & rentals</p>
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
                className={() => {
                  const isActive = link.path === activeLinkPath;
                  return (
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-rx-surface text-rx-main border border-rx-accent/40 shadow-sm'
                      : 'text-rx-muted hover:text-rx-main hover:bg-rx-surface/60'
                  }`
                  );
                }}
                aria-current={link.path === activeLinkPath ? 'page' : undefined}
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
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rx-muted hover:text-rx-main bg-rx-surface hover:bg-rx-border rounded-xl transition-colors cursor-pointer border border-rx-border"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Switch to Renter Mode
        </button>
      </div>
    </aside>
  );
};

export default OwnerSidebar;
