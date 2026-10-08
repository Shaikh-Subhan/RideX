import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
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
      const data = await login({ email: email.trim(), password });
      success(`Welcome back, ${data.user?.name || 'Driver'}!`);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Invalid email or password. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: '' }));
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-rx-main">
      <div className="max-w-md w-full bg-rx-card rounded-3xl border border-rx-border shadow-2xl p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-10 h-10 rounded-2xl bg-rx-surface border border-rx-border flex items-center justify-center text-rx-accent shadow-md group-hover:border-rx-accent/60 transition-colors">
              <Car className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-rx-main">
              Ride<span className="text-rx-accent">X</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-rx-main">Driver Login</h2>
          <p className="text-xs text-rx-muted mt-1">
            Access your bookings, vehicle listings, and account profile.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-rx-accent-soft/50 border border-rx-accent-border/60 rounded-xl flex items-start gap-2.5 text-xs text-rx-accent animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rx-accent" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
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

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-rx-muted">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-rx-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
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
            className="w-full mt-2 py-3 px-4 rounded-xl bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-rx-border border-t-rx-transparent rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <>
                <span>Sign in to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-rx-border text-center text-xs text-rx-muted">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-rx-accent hover:underline">
            Register on RideX
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
