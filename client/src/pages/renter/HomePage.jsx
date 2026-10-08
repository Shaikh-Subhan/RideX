import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  ShieldCheck,
  Award,
  ArrowRight,
  Car,
  HeartHandshake,
  Flame
} from 'lucide-react';
import vehicleApi from '../../api/vehicleApi';
import VehicleCard from '../../components/renter/VehicleCard';
import { VehicleCardSkeleton } from '../../components/common/Skeleton';
import { useTheme } from '../../context/ThemeContext';

export const HomePage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const data = await vehicleApi.getAllVehicles({ limit: 6, sort: 'rating' });
        if (isMounted) {
          setFeaturedVehicles(data.vehicles || []);
        }
      } catch (err) {
        console.warn('Could not load featured vehicles:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchVehicles();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (location.trim()) query.set('location', location.trim());
    if (startDate) query.set('startDate', startDate);
    if (endDate) query.set('endDate', endDate);
    navigate(`/cars?${query.toString()}`);
  };

  const categories = [
    { name: 'SUV', count: 'Luxury Performance & Space', icon: '🚙', query: 'suv' },
    { name: 'Sedan', count: 'Executive Comfort & Range', icon: '🚗', query: 'sedan' },
    { name: 'Electric', count: 'Instant Torque & Tech', icon: '⚡', query: 'electric' },
    { name: 'Luxury', count: 'Exotic & Bespoke Fleet', icon: '✨', query: 'luxury' },
    { name: 'Hatchback', count: 'Agile Urban Performance', icon: '🚘', query: 'hatchback' },
    { name: 'Convertible', count: 'Open Air Grand Tourer', icon: '🏎️', query: 'convertible' },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      {/* Hero Section */}
      <section className={`relative overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 border shadow-2xl transition-colors duration-200 ${
        isDark
          ? 'bg-rx-page text-rx-main border-rx-border'
          : 'bg-rx-surface text-rx-main border-rx-border shadow-rx-soft'
      }`}>
        <div
          className={`absolute inset-0 z-0 ${
            isDark ? 'bg-rx-page' : 'bg-rx-surface'
          }`}
        />
        <div className={`absolute inset-0 z-0 transition-colors ${
          isDark
            ? 'bg-gradient-to-r from-rx-page via-rx-page/85 to-rx-transparent'
            : 'bg-gradient-to-r from-rx-surface via-rx-surface/95 to-rx-transparent'
        }`} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 sm:py-24 lg:py-28 text-center sm:text-left">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-md mb-6 transition-colors ${
            isDark
              ? 'bg-rx-card/80 border border-rx-border text-rx-accent'
              : 'bg-rx-accent-soft border border-rx-accent-border text-rx-accent'
          }`}>
            <Flame className={`w-3.5 h-3.5 ${isDark ? 'text-rx-accent' : 'text-rx-accent'}`} />
            <span>High-Performance Peer-to-Peer Car Rental</span>
          </div>

          <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-2xl leading-[1.12] transition-colors ${
            isDark ? 'text-rx-main' : 'text-rx-main'
          }`}>
            Find the perfect car for your journey
          </h1>
          <p className={`mt-4 text-sm sm:text-lg max-w-xl font-normal leading-relaxed transition-colors ${
            isDark ? 'text-rx-muted' : 'text-rx-muted'
          }`}>
            Rent cars from trusted owners near you. Compare verified vehicles, self-drive or with a dedicated professional driver.
          </p>

          {/* Search Panel */}
          <form
            onSubmit={handleSearchSubmit}
            className={`mt-10 p-3 sm:p-4 backdrop-blur-md rounded-2xl border shadow-2xl grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-center transition-colors ${
              isDark
                ? 'bg-rx-card/95 border-rx-border'
                : 'bg-rx-card/95 border-rx-border shadow-rx-soft'
            }`}
          >
            {/* Location */}
            <div className="p-2 sm:p-3 text-left">
              <label className={`text-[10px] font-extrabold uppercase tracking-wider block mb-1 flex items-center gap-1 ${
                isDark ? 'text-rx-muted' : 'text-rx-muted'
              }`}>
                <MapPin className={`w-3 h-3 ${isDark ? 'text-rx-accent' : 'text-rx-accent'}`} />
                Where
              </label>
              <input
                type="text"
                placeholder="City, airport, or address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`w-full text-xs sm:text-sm font-semibold focus:outline-none bg-rx-transparent ${
                  isDark ? 'text-rx-main placeholder-rx-muted' : 'text-rx-main placeholder-rx-muted'
                }`}
              />
            </div>

            {/* Pickup Date */}
            <div className={`p-2 sm:p-3 text-left border-t sm:border-t-0 sm:border-l ${
              isDark ? 'border-rx-border' : 'border-rx-border'
            }`}>
              <label className={`text-[10px] font-extrabold uppercase tracking-wider block mb-1 flex items-center gap-1 ${
                isDark ? 'text-rx-muted' : 'text-rx-muted'
              }`}>
                <Calendar className={`w-3 h-3 ${isDark ? 'text-rx-accent' : 'text-rx-accent'}`} />
                Pickup Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full text-xs sm:text-sm font-semibold focus:outline-none bg-rx-transparent ${
                  isDark ? 'text-rx-main' : 'text-rx-main'
                }`}
              />
            </div>

            {/* Return Date */}
            <div className={`p-2 sm:p-3 text-left border-t sm:border-t-0 sm:border-l ${
              isDark ? 'border-rx-border' : 'border-rx-border'
            }`}>
              <label className={`text-[10px] font-extrabold uppercase tracking-wider block mb-1 flex items-center gap-1 ${
                isDark ? 'text-rx-muted' : 'text-rx-muted'
              }`}>
                <Calendar className={`w-3 h-3 ${isDark ? 'text-rx-accent' : 'text-rx-accent'}`} />
                Return Date
              </label>
              <input
                type="date"
                min={startDate || new Date().toISOString().split('T')[0]}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full text-xs sm:text-sm font-semibold focus:outline-none bg-rx-transparent ${
                  isDark ? 'text-rx-main' : 'text-rx-main'
                }`}
              />
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-3 lg:col-span-1 pt-1 sm:pt-0">
              <button
                type="submit"
                className={`w-full py-3 sm:py-3.5 px-6 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isDark
                    ? 'bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent shadow-lg shadow-rx'
                    : 'bg-rx-accent hover:bg-rx-accent-hover text-rx-main shadow-lg shadow-rx'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Search Fleet</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Vehicle Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-rx-main tracking-tight">
              Vehicle Classes
            </h2>
            <p className="text-xs sm:text-sm text-rx-muted mt-1">
              Select your preferred category engineered for performance and purpose
            </p>
          </div>
          <Link
            to="/cars"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-rx-accent hover:text-rx-accent"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/cars?vehicleType=${cat.query}`}
              className="group p-5 bg-rx-card rounded-2xl border border-rx-border hover:border-rx-accent/60 hover:shadow-xl transition-all text-center flex flex-col items-center justify-center"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <h3 className="font-bold text-sm text-rx-main group-hover:text-rx-accent transition-colors">
                {cat.name}
              </h3>
              <p className="text-[10px] text-rx-muted mt-0.5 line-clamp-1">{cat.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured & Popular Cars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-rx-accent mb-1">
              <Award className="w-4 h-4" />
              <span>Highest Rated Fleet</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-rx-main tracking-tight">
              Featured Marketplace Listings
            </h2>
            <p className="text-xs sm:text-sm text-rx-muted mt-1">
              Top-rated models with verified vehicle documents and host ratings
            </p>
          </div>

          <Link
            to="/cars"
            className="flex items-center gap-1.5 text-xs font-bold text-rx-accent hover:text-rx-accent shrink-0"
          >
            <span>View All ({featuredVehicles.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
          </div>
        ) : featuredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-rx-card rounded-3xl border border-rx-border p-8 shadow-sm">
            <Car className="w-12 h-12 text-rx-muted mx-auto mb-3" />
            <h3 className="font-bold text-rx-main text-base">No vehicles listed yet</h3>
            <p className="text-xs text-rx-muted max-w-sm mx-auto mt-1 mb-4">
              Be the first car owner to list your vehicle on RideX!
            </p>
            <Link
              to="/owner/vehicles/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-rx-accent text-rx-on-accent rounded-xl text-xs font-bold"
            >
              List a Vehicle
            </Link>
          </div>
        )}
      </section>

      {/* Trust & Verification Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-rx-card text-rx-main rounded-3xl p-8 sm:p-12 lg:p-14 border border-rx-border shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mb-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-rx-accent">
              The RideX Standard
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-rx-main tracking-tight mt-2">
              Uncompromising vehicle verification and driver accountability
            </h2>
            <p className="text-xs sm:text-sm text-rx-muted mt-3 leading-relaxed">
              We separate vehicle ratings from driver reputation. Vehicles earn 1-5 star reviews from drivers, while renters build a 0-100 verified Trust Score.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10">
            <div className="p-6 bg-rx-surface rounded-2xl border border-rx-border">
              <div className="w-10 h-10 rounded-xl bg-rx-accent-soft/50 border border-rx-accent-border/60 text-rx-accent flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-rx-main mb-1.5">Admin-Verified Fleet</h3>
              <p className="text-xs text-rx-muted leading-relaxed">
                Registration documents and insurance policies are vetted by administrators before any vehicle appears in marketplace listings.
              </p>
            </div>

            <div className="p-6 bg-rx-surface rounded-2xl border border-rx-border">
              <div className="w-10 h-10 rounded-xl bg-rx-accent-soft/50 border border-rx-accent-border/60 text-rx-accent flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-rx-main mb-1.5">Renter Trust Score (0-100)</h3>
              <p className="text-xs text-rx-muted leading-relaxed">
                Car hosts evaluate renters on punctuality and cleanliness after every booking. High trust scores unlock exclusive premium models.
              </p>
            </div>

            <div className="p-6 bg-rx-surface rounded-2xl border border-rx-border">
              <div className="w-10 h-10 rounded-xl bg-rx-card border border-rx-border text-rx-accent flex items-center justify-center mb-4">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-rx-main mb-1.5">Authentic Star Reviews</h3>
              <p className="text-xs text-rx-muted leading-relaxed">
                Vehicle ratings (1–5 stars) come exclusively from verified completed trips, ensuring authentic insights on comfort and performance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
