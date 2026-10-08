import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  PlusCircle,
  LogOut,
  Save,
  Car,
  KeyRound,
  Sun,
  Moon,
  Sparkles,
  Check,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import TrustScoreBadge from '../../components/common/TrustScoreBadge';
import Badge from '../../components/common/Badge';

export const ProfilePage = () => {
  const { user, roles, currentRole, switchRole, addRole, updateProfile, logout } = useAuth();
  const { success, error: toastError } = useToast();
  const { theme, setTheme, isDark } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [addingRole, setAddingRole] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toastError('Name cannot be empty');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      success('Profile updated successfully!');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddOwnerRole = async () => {
    try {
      setAddingRole(true);
      await addRole('owner');
      success('Congratulations! Owner capabilities activated on your account.');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to add owner role');
    } finally {
      setAddingRole(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    success(`Theme switched to ${newTheme === 'dark' ? 'Navy & Teal Dark' : 'Navy & Teal Light'}`);
  };

  const isRenter = roles.includes('renter');
  const isOwner = roles.includes('owner');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 text-rx-main">
      {/* Header */}
      <div className="pb-6 border-b border-rx-border">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-rx-main tracking-tight">
          Account Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-rx-muted mt-1.5">
          Manage your personal credentials, workspace theme, and verified roles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Column: Avatar & Trust / Role Overview */}
        <div className="space-y-6">
          <div className="bg-rx-card rounded-2xl border border-rx-border p-6 shadow-md text-center space-y-4">
            <div className="relative inline-block mx-auto">
              <div className="w-20 h-20 rounded-2xl bg-rx-surface border-2 border-rx-accent/60 text-rx-accent flex items-center justify-center font-extrabold text-2xl uppercase shadow-md">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rx-accent-soft border-2 border-rx-border flex items-center justify-center text-rx-on-accent" title="Verified Account">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-rx-main">{user?.name}</h3>
              <p className="text-xs text-rx-muted font-mono mt-0.5">{user?.email}</p>
            </div>

            {/* Roles Badges */}
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {roles.map((r) => (
                <Badge key={r} status={r}>
                  {r}
                </Badge>
              ))}
            </div>

            {/* Renter Trust Score (Shown strictly for renters) */}
            {isRenter && (
              <div className="pt-4 border-t border-rx-border space-y-2">
                <span className="text-[10px] font-bold text-rx-muted uppercase tracking-wider block">
                  Renter Trust Score
                </span>
                <div className="flex justify-center">
                  <TrustScoreBadge score={user?.trustScore ?? 100} size="md" />
                </div>
                <p className="text-[11px] text-rx-muted leading-relaxed">
                  Evaluated by hosts following completed bookings. Maintains priority booking status.
                </p>
              </div>
            )}
          </div>

          {/* Become an Owner Card if currently only renter */}
          {!isOwner && (
            <div className="bg-rx-card border border-rx-border rounded-2xl p-6 shadow-md space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-rx-accent/5 rounded-full blur-2xl pointer-events-none" />
              <div className="w-10 h-10 rounded-xl bg-rx-surface border border-rx-border text-rx-accent flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-rx-main">Earn with Your Vehicle</h4>
              <p className="text-xs text-rx-muted leading-relaxed">
                Activate your Host account on RideX with one click. List your cars, manage bookings, and earn passive income.
              </p>
              <button
                type="button"
                onClick={handleAddOwnerRole}
                disabled={addingRole}
                className="w-full py-2.5 px-4 bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {addingRole ? 'Activating...' : 'Activate Owner Account'}
              </button>
            </div>
          )}

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 p-3 bg-rx-accent-soft/10 hover:bg-rx-accent-soft/20 text-rx-main rounded-xl text-xs font-bold border border-rx-accent-border/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out of RideX</span>
          </button>
        </div>

        {/* Right Column: Theme Selector + Editable Profile Form */}
        <div className="md:col-span-2 space-y-6">
          {/* THEME SELECTION SECTION */}
          <div className="bg-rx-card rounded-2xl border border-rx-border p-6 sm:p-7 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-rx-border pb-4">
              <div>
                <h3 className="text-base font-bold text-rx-main flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rx-accent" />
                  <span>Appearance & Theme</span>
                </h3>
                <p className="text-xs text-rx-muted mt-0.5">
                  Choose your preferred RideX automotive visual style
                </p>
              </div>
              <span className="text-[11px] font-semibold text-rx-main px-2.5 py-1 rounded-md bg-rx-surface border border-rx-border">
                {theme === 'dark' ? 'Navy & Teal Dark Active' : 'Navy & Teal Light Active'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Dark Automotive Luxury */}
              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                  theme === 'dark'
                    ? 'bg-rx-surface border-rx-accent shadow-md shadow-rx'
                    : 'bg-rx-card border-rx-border hover:border-rx-border-strong'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rx-page border border-rx-border flex items-center justify-center text-rx-accent">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-rx-main block">Navy & Teal Dark</span>
                      <span className="text-[10px] text-rx-main font-semibold">Automotive Night</span>
                    </div>
                  </div>
                  {theme === 'dark' && (
                    <div className="w-5 h-5 rounded-full bg-rx-accent flex items-center justify-center text-rx-on-accent">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-xs text-rx-muted leading-relaxed mb-4">
                  Navy (#2F4156), teal (#567C8D), and sky blue (#C8D9E6) accents over a deep blue night canvas.
                </p>

                {/* Swatch preview */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-rx-border/60">
                  <span className="w-4 h-4 rounded-full bg-[#142336] border border-rx-border" title="#142336 Canvas" />
                  <span className="w-4 h-4 rounded-full bg-[#2f4156] border border-rx-border" title="#2F4156 Navy" />
                  <span className="w-4 h-4 rounded-full bg-[#567c8d]" title="#567C8D Teal" />
                  <span className="w-4 h-4 rounded-full bg-[#c8d9e6]" title="#C8D9E6 Sky Blue" />
                  <span className="text-[10px] text-rx-muted ml-auto font-mono">Dark mode</span>
                </div>
              </button>

              {/* Option 2: Slate & Burnt Orange Studio */}
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                  theme === 'light'
                    ? 'bg-rx-surface border-rx-accent shadow-md shadow-rx'
                    : 'bg-rx-card border-rx-border hover:border-rx-border-strong'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rx-surface border border-rx-border flex items-center justify-center text-rx-accent">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-rx-main block">Navy & Teal Light</span>
                      <span className="text-[10px] text-rx-main font-semibold">Beige Studio</span>
                    </div>
                  </div>
                  {theme === 'light' && (
                    <div className="w-5 h-5 rounded-full bg-rx-accent flex items-center justify-center text-rx-on-accent">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-xs text-rx-muted leading-relaxed mb-4">
                  Beige (#F5EFEB) canvas, white cards, navy (#2F4156) controls, and soft sky-blue (#C8D9E6) surfaces.
                </p>

                {/* Swatch preview */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-rx-border/60">
                  <span className="w-4 h-4 rounded-full bg-[#f5efeb] border border-rx-border" title="#F5EFEB Beige Canvas" />
                  <span className="w-4 h-4 rounded-full bg-[#ffffff] border border-rx-border" title="#FFFFFF Card Surface" />
                  <span className="w-4 h-4 rounded-full bg-[#2f4156]" title="#2F4156 Navy Accent" />
                  <span className="w-4 h-4 rounded-full bg-[#c8d9e6]" title="#C8D9E6 Sky Blue Surface" />
                  <span className="text-[10px] text-rx-muted ml-auto font-mono">Light mode</span>
                </div>
              </button>
            </div>
          </div>

          {/* PERSONAL INFORMATION FORM */}
          <form
            onSubmit={handleUpdate}
            className="bg-rx-card rounded-2xl border border-rx-border p-6 sm:p-7 shadow-md space-y-5"
          >
            <div className="border-b border-rx-border pb-4">
              <h3 className="text-base font-bold text-rx-main">Personal Information</h3>
              <p className="text-xs text-rx-muted mt-0.5">
                Update your contact details for booking coordination
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-rx-muted">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-rx-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full pl-10 pr-4 py-2.5 bg-rx-surface border border-rx-border rounded-xl text-xs sm:text-sm text-rx-main placeholder-rx-muted/60 focus:outline-none focus:border-rx-accent focus:ring-1 focus:ring-rx-accent transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-rx-muted">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-rx-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 bg-rx-surface/60 border border-rx-border rounded-xl text-xs sm:text-sm text-rx-muted cursor-not-allowed select-none"
                />
              </div>
              <p className="text-[10px] text-rx-muted">
                Account email is permanently linked to your verified credentials.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-rx-muted">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-rx-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-2.5 bg-rx-surface border border-rx-border rounded-xl text-xs sm:text-sm text-rx-main placeholder-rx-muted/60 focus:outline-none focus:border-rx-accent focus:ring-1 focus:ring-rx-accent transition-colors"
                />
              </div>
            </div>

            {/* Multi-role Switcher if user has both */}
            {isRenter && isOwner && (
              <div className="pt-4 border-t border-rx-border space-y-2">
                <label className="text-xs font-semibold text-rx-muted block">
                  Active Experience Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => switchRole('renter')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      currentRole === 'renter'
                        ? 'bg-rx-accent text-rx-on-accent border-rx-accent shadow-sm'
                        : 'bg-rx-surface text-rx-muted border-rx-border hover:text-rx-main'
                    }`}
                  >
                    Renter Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => switchRole('owner')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      currentRole === 'owner'
                        ? 'bg-rx-accent text-rx-on-accent border-rx-accent shadow-sm'
                        : 'bg-rx-surface text-rx-muted border-rx-border hover:text-rx-main'
                    }`}
                  >
                    Owner Mode
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-rx-border">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving changes...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
