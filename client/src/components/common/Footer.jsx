import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ShieldCheck, HeartHandshake, Award } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-rx-page text-rx-muted border-t border-rx-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rx-card border border-rx-border flex items-center justify-center text-rx-accent">
                <Car className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-rx-main tracking-tight">
                Ride<span className="text-rx-accent">X</span>
              </span>
            </Link>
            <p className="text-xs text-rx-muted leading-relaxed">
              Curated peer-to-peer car rental marketplace. Connect with trusted vehicle owners, compare top models, and drive with confidence.
            </p>
            <div className="flex items-center gap-2 pt-2 text-rx-muted text-xs">
              <ShieldCheck className="w-4 h-4 text-rx-accent" />
              <span>Verified Fleet & Drivers</span>
            </div>
          </div>

          {/* Renter Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-rx-main uppercase tracking-wider">For Renters</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/cars" className="hover:text-rx-main transition-colors">Explore All Cars</Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-rx-main transition-colors">Compare Models</Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-rx-main transition-colors">My Bookings</Link>
              </li>
              <li>
                <span className="text-rx-muted">Self-Drive & With-Driver options</span>
              </li>
            </ul>
          </div>

          {/* Owner Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-rx-main uppercase tracking-wider">For Car Owners</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/owner" className="hover:text-rx-main transition-colors">Host Dashboard</Link>
              </li>
              <li>
                <Link to="/owner/vehicles" className="hover:text-rx-main transition-colors">Manage Fleet</Link>
              </li>
              <li>
                <Link to="/owner/earnings" className="hover:text-rx-main transition-colors">Host Earnings</Link>
              </li>
              <li>
                <span className="text-rx-muted">Verified document onboarding</span>
              </li>
            </ul>
          </div>

          {/* Trust & Quality */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-rx-main uppercase tracking-wider">Trust & Quality</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Award className="w-4 h-4 text-rx-accent shrink-0 mt-0.5" />
                <span>Renter trust scoring (0–100) based on verified booking history.</span>
              </div>
              <div className="flex items-start gap-2">
                <HeartHandshake className="w-4 h-4 text-rx-accent shrink-0 mt-0.5" />
                <span>Authentic 1-5 star vehicle reviews by real renters.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-rx-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-rx-muted">
          <p>&copy; {new Date().getFullYear()} RideX Automotive Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-5 text-xs text-rx-muted">
            <Link to="/cars" className="hover:text-rx-main transition-colors">Browse Marketplace</Link>
            <span aria-hidden="true" className="text-rx-main">·</span>
            <Link to="/compare" className="hover:text-rx-main transition-colors">Compare Fleet</Link>
            <span aria-hidden="true" className="text-rx-main">·</span>
            <Link to="/login" className="hover:text-rx-main transition-colors">Sign In</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
