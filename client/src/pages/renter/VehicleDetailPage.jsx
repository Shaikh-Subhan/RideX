import React, { useState, useEffect } from 'react';
import { getVehicleImageUrls } from '../../utils/vehicleImage';
import { useParams, Link } from 'react-router-dom';
import {
  Car,
  Users,
  Gauge,
  Fuel,
  MapPin,
  CheckCircle2,
  Scale,
  ShieldCheck,
  ArrowLeft,
  Share2,
  Sparkles
} from 'lucide-react';
import vehicleApi from '../../api/vehicleApi';
import { formatCurrency, formatDate } from '../../utils/format';
import reviewApi from '../../api/reviewApi';
import RatingStars from '../../components/common/RatingStars';
import BookingWidget from '../../components/renter/BookingWidget';
import Skeleton from '../../components/common/Skeleton';
import { useComparison } from '../../context/ComparisonContext';
import { useToast } from '../../context/ToastContext';

export const VehicleDetailPage = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const { isInComparison, toggleVehicle } = useComparison();
  const { info } = useToast();

  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        const [vehicleData, reviewData] = await Promise.all([
          vehicleApi.getVehicleById(id),
          reviewApi.getVehicleReviews(id).catch(() => ({ reviews: [] })),
        ]);

        if (isMounted) {
          setVehicle(vehicleData.vehicle);
          setReviews(reviewData?.reviews || []);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMsg(err.response?.data?.message || 'Vehicle not found or no longer available');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-96 w-full rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (errorMsg || !vehicle) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center text-rx-main">
        <Car className="w-16 h-16 text-rx-muted mb-4" />
        <h2 className="text-xl font-bold text-rx-main mb-2">Vehicle Unavailable</h2>
        <p className="text-sm text-rx-muted max-w-sm mb-6 leading-relaxed">
          {errorMsg || 'This vehicle might have been removed or is pending verification.'}
        </p>
        <Link
          to="/cars"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rx-accent text-rx-on-accent rounded-xl text-xs font-bold shadow-xs hover:bg-rx-accent-hover"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse Other Cars
        </Link>
      </div>
    );
  }

  const isCompared = isInComparison(vehicle._id);
  const images = getVehicleImageUrls(vehicle);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 text-rx-main">
      {/* Top Navigation & Action Controls */}
      <div className="flex items-center justify-between">
        <Link
          to="/cars"
          className="inline-flex items-center gap-2 text-xs font-bold text-rx-muted hover:text-rx-main transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleVehicle(vehicle)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs ${
              isCompared
                ? 'bg-rx-accent text-rx-on-accent border-rx-accent'
                : 'bg-rx-card text-rx-muted border-rx-border hover:border-rx-accent/60'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>{isCompared ? 'In Comparison' : 'Compare Car'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              info('Link copied to clipboard');
            }}
            className="p-2 rounded-xl border border-rx-border bg-rx-card text-rx-muted hover:text-rx-main transition-colors shadow-xs"
            title="Share vehicle"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Gallery */}
      <div className="space-y-3">
        <div className="relative aspect-16/9 md:aspect-21/9 w-full rounded-3xl overflow-hidden bg-rx-page border border-rx-border shadow-2xl">
          {images.length > 0 ? (
            <img
              src={images[activeImageIndex] || images[0]}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.visibility = 'hidden';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-rx-muted">
              <Car className="w-16 h-16" />
            </div>
          )}
          {vehicle.verification?.status === 'verified' && (
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-rx-page/90 text-rx-accent border border-rx-accent-border/60 text-xs font-bold backdrop-blur-md shadow-md">
              <CheckCircle2 className="w-4 h-4 text-rx-accent" />
              Verified Vehicle
            </div>
          )}
        </div>

        {/* Thumbnails strip */}
        {images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto py-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  activeImageIndex === idx
                    ? 'border-rx-accent scale-105 shadow-md'
                    : 'border-rx-border opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Grid: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 Cols): Details, Specifications, Features, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-rx-surface text-rx-accent border border-rx-border">
                {vehicle.vehicleType}
              </span>
              <span className="text-xs font-medium text-rx-muted">&bull;</span>
              <span className="text-xs font-bold text-rx-muted">{vehicle.year} Model</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-rx-main tracking-tight">
              {vehicle.make} {vehicle.model}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-rx-muted">
              <RatingStars
                rating={vehicle.averageRating || 0}
                totalReviews={vehicle.totalReviews || 0}
                showNumber
                size="md"
              />
              {vehicle.location && (
                <div className="flex items-center gap-1.5 text-rx-muted font-medium">
                  <MapPin className="w-4 h-4 text-rx-accent shrink-0" />
                  <span>{vehicle.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Key Specifications Grid */}
          <div className="bg-rx-card rounded-3xl border border-rx-border p-6 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rx-muted mb-4">
              Vehicle Engineering Specifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-rx-surface rounded-2xl border border-rx-border">
                <Gauge className="w-5 h-5 text-rx-accent mb-1.5" />
                <span className="text-rx-muted block text-[10px] uppercase font-bold">Transmission</span>
                <span className="font-bold text-rx-main capitalize text-sm">{vehicle.transmission}</span>
              </div>
              <div className="p-3.5 bg-rx-surface rounded-2xl border border-rx-border">
                <Fuel className="w-5 h-5 text-rx-accent mb-1.5" />
                <span className="text-rx-muted block text-[10px] uppercase font-bold">Powertrain</span>
                <span className="font-bold text-rx-main capitalize text-sm">{vehicle.fuelType}</span>
              </div>
              <div className="p-3.5 bg-rx-surface rounded-2xl border border-rx-border">
                <Users className="w-5 h-5 text-rx-accent mb-1.5" />
                <span className="text-rx-muted block text-[10px] uppercase font-bold">Capacity</span>
                <span className="font-bold text-rx-main text-sm">{vehicle.seatingCapacity} Passengers</span>
              </div>
              <div className="p-3.5 bg-rx-surface rounded-2xl border border-rx-border">
                <Sparkles className="w-5 h-5 text-rx-accent mb-1.5" />
                <span className="text-rx-muted block text-[10px] uppercase font-bold">Fuel Economy</span>
                <span className="font-bold text-rx-main text-sm">{vehicle.mileage || 'Standard'} km/l</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {vehicle.description && (
            <div className="bg-rx-card rounded-3xl border border-rx-border p-6 shadow-xl space-y-3">
              <h3 className="text-base font-bold text-rx-main">Vehicle Overview</h3>
              <p className="text-xs sm:text-sm text-rx-muted leading-relaxed whitespace-pre-line">
                {vehicle.description}
              </p>
            </div>
          )}

          {/* Features Checklist */}
          {vehicle.features && vehicle.features.length > 0 && (
            <div className="bg-rx-card rounded-3xl border border-rx-border p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-rx-main">Installed Amenities & Equipment</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {vehicle.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-rx-muted">
                    <CheckCircle2 className="w-4 h-4 text-rx-accent shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Host / Owner Information */}
          {vehicle.owner && typeof vehicle.owner === 'object' && (
            <div className="bg-rx-card rounded-3xl border border-rx-border p-6 shadow-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rx-surface border border-rx-border flex items-center justify-center text-rx-accent font-extrabold text-lg uppercase">
                  {vehicle.owner.name?.charAt(0) || 'H'}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rx-muted">
                    Hosted by
                  </span>
                  <h4 className="text-base font-bold text-rx-main">{vehicle.owner.name}</h4>
                  <p className="text-xs text-rx-muted">Verified RideX Fleet Host</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-rx-accent font-semibold bg-rx-accent-soft/40 px-3 py-1.5 rounded-xl border border-rx-accent-border/60">
                <ShieldCheck className="w-4 h-4 text-rx-accent" />
                <span>Identity Verified</span>
              </div>
            </div>
          )}

          {/* Vehicle Reviews List */}
          <div className="bg-rx-card rounded-3xl border border-rx-border p-6 shadow-xl space-y-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-bold text-rx-main">
                Vehicle Reviews ({reviews.length})
              </h3>
              <RatingStars rating={vehicle.averageRating || 0} showNumber size="sm" />
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-rx-muted py-5 text-center bg-rx-surface rounded-2xl border border-rx-border">
                No driver reviews submitted yet. Ratings appear after completed bookings.
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev._id} className="p-4 bg-rx-surface rounded-2xl border border-rx-border space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-rx-card border border-rx-border text-rx-accent flex items-center justify-center text-xs font-bold uppercase">
                          {rev.renter?.name?.charAt(0) || 'R'}
                        </div>
                        <span className="text-xs font-bold text-rx-main">
                          {rev.renter?.name || 'Verified Renter'}
                        </span>
                      </div>
                      <RatingStars rating={rev.rating} size="sm" />
                    </div>
                    {rev.review && (
                      <p className="text-xs text-rx-muted leading-relaxed">{rev.review}</p>
                    )}
                    <span className="text-[10px] text-rx-muted block">
                      {formatDate(rev.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Interactive Booking Panel */}
        <div className="lg:col-span-1 w-full">
          <BookingWidget vehicle={vehicle} />
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailPage;
