import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Car,
  Home,
  Bell,
  Scale,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  CalendarCheck,
  DollarSign,
  ShieldCheck,
  PlusCircle,
  FileCheck,
  Users,
  CreditCard,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComparison } from '../../context/ComparisonContext';
import { useTheme } from '../../context/ThemeContext';
import notificationApi from '../../api/notificationApi';

export const Navbar = () => {
  const { user, roles, currentRole, switchRole, logout, isAuthenticated } = useAuth();
  const { count: compareCount } = useComparison();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const dropdownRef = useRef(null);

  // Close dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Poll notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const res = await notificationApi.getMyNotifications();
        if (isMounted && res?.notifications) {
          const unread = res.notifications.filter((n) => !n.isRead).length;
          setUnreadNotifications(unread);
        }
      } catch {
        // Silent catch
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAuthenticated, location.pathname]);

  const hasMultipleRoles = roles.includes('renter') && roles.includes('owner');
  const isAdmin = roles.includes('admin');

  // Navigation Links based on active role
  const getNavLinks = () => {
    if (currentRole === 'owner') {
      return [
        { label: 'Home', path: '/', icon: Home },
        { label: 'Dashboard', path: '/owner', icon: LayoutDashboard },
        { label: 'My Vehicles', path: '/owner/vehicles', icon: Car },
        { label: 'Bookings', path: '/owner/bookings', icon: CalendarCheck },
        { label: 'Earnings', path: '/owner/earnings', icon: DollarSign },
      ];
    }

    if (currentRole === 'admin') {
      return [
        { label: 'Home', path: '/', icon: Home },
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Verification', path: '/admin/verification', icon: FileCheck },
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Vehicles', path: '/admin/vehicles', icon: Car },
        { label: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
        { label: 'Payments', path: '/admin/payments', icon: CreditCard },
      ];
    }

    // Default: Renter
    return [
      { label: 'Home', path: '/', icon: Home },
      { label: 'Explore Cars', path: '/cars', icon: Car },
      { label: 'Compare', path: '/compare', icon: Scale, badge: compareCount > 0 ? compareCount : null },
      { label: 'My Bookings', path: '/bookings', icon: CalendarCheck, authOnly: true },
    ];
  };

  const navLinks = getNavLinks();
  const compareNavLink = {
    label: 'Compare Vehicles',
    path: '/compare',
    icon: Scale,
    badge: compareCount > 0 ? compareCount : null,
  };
  const compactNavLinks = navLinks.some((link) => link.path === '/compare')
    ? navLinks
    : [...navLinks, compareNavLink];
  const activeNavPath = compactNavLinks
    .filter((link) => location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(`${link.path}/`)))
    .sort((a, b) => b.path.length - a.path.length)[0]?.path;

  return (
    <header className="sticky top-0 z-40 bg-rx-page/95 backdrop-blur-md border-b border-rx-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 2xl:max-w-[1600px] 2xl:px-8">
        <div className="flex items-center gap-3 2xl:gap-8 h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 2xl:gap-6 shrink-0">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-rx-card border border-rx-border flex items-center justify-center text-rx-accent shadow-md group-hover:border-rx-accent/60 transition-colors">
                <Car className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-rx-main leading-none">
                  Ride<span className={isDark ? 'text-rx-accent' : 'text-rx-accent'}>X</span>
                </span>
                <span className="hidden 2xl:block text-[10px] uppercase font-bold tracking-widest text-rx-muted mt-0.5">
                  Automotive Marketplace
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden 2xl:flex flex-1 min-w-0 items-center justify-center gap-1.5 2xl:gap-2 ml-2">
            {navLinks.map((link) => {
              if (link.authOnly && !isAuthenticated) return null;
              const isActive = link.path === activeNavPath;
              const Icon = link.icon;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-2.5 2xl:px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-rx-card text-rx-accent border border-rx-border'
                      : 'text-rx-muted hover:text-rx-main hover:bg-rx-card/60'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-80" />
                  <span>{link.label}</span>
                  {link.badge ? (
                    <span className="ml-1 px-1.5 py-0.2 bg-rx-accent text-rx-on-accent rounded-full text-[10px] font-extrabold">
                      {link.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* Compact icon navigation for desktop widths where labels do not fit */}
          <nav className="hidden lg:flex 2xl:!hidden flex-1 min-w-0 items-center justify-center gap-0.5 ml-2">
            {compactNavLinks.map((link) => {
              if (link.authOnly && !isAuthenticated) return null;
              const isActive = link.path === activeNavPath;
              const Icon = link.icon;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  title={link.label}
                  aria-label={link.label}
                  className={`relative flex items-center justify-center rounded-xl transition-all ${
                    isActive
                      ? 'gap-2 px-2.5 py-2 bg-rx-card text-rx-accent border border-rx-border'
                      : 'p-2 text-rx-muted hover:text-rx-main hover:bg-rx-card/60'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4 opacity-80" />
                  {isActive && <span className="text-xs font-bold whitespace-nowrap">{link.label}</span>}
                  {link.badge ? (
                    <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-rx-accent text-rx-on-accent rounded-full text-[9px] font-extrabold flex items-center justify-center">
                      {link.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2 2xl:gap-3 shrink-0">
            {/* Compare Quick Access */}
            {currentRole !== 'renter' && (
              <Link
                to="/compare"
                className="relative p-2 text-rx-muted hover:text-rx-main hover:bg-rx-card rounded-xl transition-colors hidden sm:flex lg:hidden 2xl:flex items-center justify-center border border-rx-transparent hover:border-rx-border"
                title="Compare Vehicles"
                aria-label="Compare Vehicles"
              >
                <Scale className="w-5 h-5" />
                {compareCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rx-accent text-rx-on-accent text-[10px] font-extrabold flex items-center justify-center">
                    {compareCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notification Bell (Authenticated Only) */}
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="relative p-2 text-rx-muted hover:text-rx-main hover:bg-rx-card rounded-xl transition-colors flex items-center justify-center border border-rx-transparent hover:border-rx-border"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rx-accent text-rx-on-accent text-[10px] font-extrabold flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </Link>
            )}

            {/* Theme Quick Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden sm:flex p-2 text-rx-muted hover:text-rx-accent hover:bg-rx-card rounded-xl transition-colors items-center justify-center border border-rx-transparent hover:border-rx-border cursor-pointer"
              title={`Switch to ${isDark ? 'Slate & Burnt Orange' : 'Dark Luxury'} theme`}
              aria-label="Toggle visual theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-rx-accent" />
              ) : (
                <Moon className="w-5 h-5 text-rx-main" />
              )}
            </button>

            {/* User Dropdown / Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-rx-card border border-rx-border transition-colors cursor-pointer 2xl:gap-2.5 2xl:p-1.5 2xl:pr-3"
                >
                  <div className="w-8 h-8 rounded-full bg-rx-surface border border-rx-border text-rx-accent flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="text-left hidden 2xl:block">
                    <div className="text-sm font-bold text-rx-main leading-tight truncate max-w-[110px]">
                      {user?.name?.split(' ')[0]}
                    </div>
                    <div className="text-xs font-bold text-rx-accent capitalize">
                      {currentRole}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-rx-muted" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-rx-card rounded-2xl border border-rx-border shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-rx-main">
                    <div className="px-4 py-3 border-b border-rx-border">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-rx-muted">Signed in as</p>
                      <p className="text-sm font-bold text-rx-main truncate mt-0.5">{user?.name}</p>
                      <p className="text-xs text-rx-muted truncate">{user?.email}</p>

                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {roles.map((r) => (
                          <span
                            key={r}
                            className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase border ${
                              r === 'admin'
                                ? 'bg-rx-accent-soft/60 text-rx-accent border-rx-accent-border'
                                : r === 'owner'
                                ? 'bg-rx-accent-soft/60 text-rx-accent border-rx-accent-border'
                                : 'bg-rx-surface text-rx-muted border-rx-border'
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Role Switcher in Dropdown */}
                    {hasMultipleRoles && (
                      <div className="px-4 py-2 border-b border-rx-border">
                        <span className="text-[9px] uppercase font-bold text-rx-muted block mb-1.5">
                          Switch Experience
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              switchRole('renter');
                              navigate('/');
                            }}
                            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg text-center cursor-pointer transition-colors ${
                              currentRole === 'renter'
                                ? 'bg-rx-accent text-rx-on-accent'
                                : 'bg-rx-surface text-rx-muted hover:bg-rx-border'
                            }`}
                          >
                            Renter
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              switchRole('owner');
                              navigate('/owner');
                            }}
                            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg text-center cursor-pointer transition-colors ${
                              currentRole === 'owner'
                                ? 'bg-rx-accent text-rx-on-accent'
                                : 'bg-rx-surface text-rx-muted hover:bg-rx-border'
                            }`}
                          >
                            Owner
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Admin Switcher */}
                    {isAdmin && currentRole !== 'admin' && (
                      <div className="px-2 py-1 border-b border-rx-border">
                        <button
                          type="button"
                          onClick={() => {
                            switchRole('admin');
                            navigate('/admin');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rx-accent hover:bg-rx-surface rounded-lg text-left cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-rx-accent" />
                          Admin Console
                        </button>
                      </div>
                    )}

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rx-muted hover:bg-rx-surface hover:text-rx-main transition-colors"
                      >
                        <User className="w-4 h-4 text-rx-muted" />
                        Account Profile
                      </Link>

                      {/* Prompt to become an owner if only renter */}
                      {!roles.includes('owner') && !roles.includes('admin') && (
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rx-accent hover:bg-rx-surface transition-colors"
                        >
                          <PlusCircle className="w-4 h-4 text-rx-accent" />
                          List your car on RideX
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rx-accent hover:bg-rx-accent-soft/20 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 text-rx-accent" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-bold text-rx-muted hover:text-rx-main transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-rx-on-accent bg-rx-accent hover:bg-rx-accent-hover rounded-xl transition-colors shadow-md"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-rx-muted hover:bg-rx-card hover:text-rx-main transition-colors cursor-pointer border border-rx-border"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-rx-border bg-rx-page px-4 pt-3 pb-6 space-y-3">
          {/* Mobile Theme Switcher */}
          <div className="flex items-center justify-between p-2.5 bg-rx-card rounded-xl border border-rx-border">
            <span className="text-xs font-bold text-rx-muted">Appearance:</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-lg bg-rx-surface text-rx-accent border border-rx-border"
            >
              {isDark ? (
                <>
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark Luxury</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5" />
                  <span>Slate & Burnt Orange</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-1">
            {compactNavLinks.map((link) => {
              if (link.authOnly && !isAuthenticated) return null;
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold ${
                    isActive
                      ? 'bg-rx-card text-rx-accent border border-rx-border'
                      : 'text-rx-muted hover:bg-rx-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 opacity-80" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge ? (
                    <span className="px-2 py-0.5 bg-rx-accent text-rx-on-accent rounded-full text-[10px] font-extrabold">
                      {link.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>

          {!isAuthenticated && (
            <div className="pt-3 border-t border-rx-border flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-rx-card text-rx-muted border border-rx-border"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-rx-accent text-rx-on-accent"
              >
                Create an Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
