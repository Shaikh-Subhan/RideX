import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('renter'); // Allowed: renter or owner
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const { register } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = 'Full name is required';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (phone.trim().length < 7) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
      });

      success(`Account created successfully as ${role}!`);
      navigate(role === 'owner' ? '/owner' : '/');
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Registration failed. An account with this email may already exist.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: '' }));
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: '' }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-rx-main">
      <div className="max-w-lg w-full bg-rx-card rounded-3xl border border-rx-border shadow-2xl p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-10 h-10 rounded-2xl bg-rx-surface border border-rx-border flex items-center justify-center text-rx-accent shadow-md group-hover:border-rx-accent/60 transition-colors">
              <Car className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-rx-main">
              Ride<span className="text-rx-accent">X</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-rx-main">Create Account</h2>
          <p className="text-xs text-rx-muted mt-1">
            Join the premier peer-to-peer automotive rental network.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-rx-accent-soft/50 border border-rx-accent-border/60 rounded-xl flex items-start gap-2.5 text-xs text-rx-accent animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rx-accent" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Role Selection (Renter vs Owner) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-rx-muted block">
              I want to use RideX as a:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('renter')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  role === 'renter'
                    ? 'bg-rx-accent-soft/30 border-rx-accent text-rx-main shadow-sm'
                    : 'bg-rx-surface border-rx-border text-rx-muted hover:border-rx-border-strong'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Renter</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      role === 'renter' ? 'border-rx-accent bg-rx-accent' : 'border-rx-border'
                    }`}
                  >
                    {role === 'renter' && <div className="w-1.5 h-1.5 rounded-full bg-rx-page" />}
                  </div>
                </div>
                <p className="text-[11px] text-rx-muted font-normal">
                  Find, compare, and reserve vehicles for your travels.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  role === 'owner'
                    ? 'bg-rx-accent-soft/30 border-rx-accent text-rx-main shadow-sm'
                    : 'bg-rx-surface border-rx-border text-rx-muted hover:border-rx-border-strong'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Car Owner</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      role === 'owner' ? 'border-rx-accent bg-rx-accent' : 'border-rx-border'
                    }`}
                  >
                    {role === 'owner' && <div className="w-1.5 h-1.5 rounded-full bg-rx-page" />}
                  </div>
                </div>
                <p className="text-[11px] text-rx-muted font-normal">
                  List your cars, approve bookings, and earn revenue.
                </p>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-rx-muted">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-rx-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                value={name}
                onChange={handleNameChange}
                className={`w-full pl-10 pr-4 py-2.5 bg-rx-surface border rounded-xl text-xs text-rx-main placeholder-rx-muted focus:outline-none transition-all ${
                  fieldErrors.name
                    ? 'border-rx-accent-border/80 focus:border-rx-accent-border focus:ring-1 focus:ring-rx-accent-border'
                    : 'border-rx-border focus:border-rx-accent'
                }`}
              />
            </div>
            {fieldErrors.name && (
              <p className="text-[11px] text-rx-accent font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.name}</span>
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-rx-muted">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-rx-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={handleEmailChange}
                className={`w-full pl-10 pr-4 py-2.5 bg-rx-surface border rounded-xl text-xs text-rx-main placeholder-rx-muted focus:outline-none transition-all ${
                  fieldErrors.email
                    ? 'border-rx-accent-border/80 focus:border-rx-accent-border focus:ring-1 focus:ring-rx-accent-border'
                    : 'border-rx-border focus:border-rx-accent'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-[11px] text-rx-accent font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.email}</span>
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-rx-muted">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-rx-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                autoComplete="tel"
                placeholder="e.g. +1 415 555 0100"
                value={phone}
                onChange={handlePhoneChange}
                className={`w-full pl-10 pr-4 py-2.5 bg-rx-surface border rounded-xl text-xs text-rx-main placeholder-rx-muted focus:outline-none transition-all ${
                  fieldErrors.phone
                    ? 'border-rx-accent-border/80 focus:border-rx-accent-border focus:ring-1 focus:ring-rx-accent-border'
                    : 'border-rx-border focus:border-rx-accent'
                }`}
              />
            </div>
            {fieldErrors.phone && (
              <p className="text-[11px] text-rx-accent font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.phone}</span>
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-rx-muted">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-rx-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full pl-10 pr-10 py-2.5 bg-rx-surface border rounded-xl text-xs text-rx-main placeholder-rx-muted focus:outline-none transition-all ${
                  fieldErrors.password
                    ? 'border-rx-accent-border/80 focus:border-rx-accent-border focus:ring-1 focus:ring-rx-accent-border'
                    : 'border-rx-border focus:border-rx-accent'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rx-muted hover:text-rx-main cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[11px] text-rx-accent font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.password}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 px-4 rounded-xl bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-rx-border border-t-rx-transparent rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-rx-border text-center text-xs text-rx-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-rx-accent hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
