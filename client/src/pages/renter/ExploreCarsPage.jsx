import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Car, ChevronLeft, ChevronRight } from 'lucide-react';
import vehicleApi from '../../api/vehicleApi';
import VehicleCard from '../../components/renter/VehicleCard';
import FilterSidebar from '../../components/renter/FilterSidebar';
import CustomSelect from '../../components/common/CustomSelect';
import { VehicleCardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

export const ExploreCarsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [vehicles, setVehicles] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    totalVehicles: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [loading, setLoading] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Extract filter parameters from URL query
  const getFiltersFromURL = () => ({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    vehicleType: searchParams.get('vehicleType') || '',
    fuelType: searchParams.get('fuelType') || '',
    transmission: searchParams.get('transmission') || '',
    minSeats: searchParams.get('minSeats') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    driverAvailable: searchParams.get('driverAvailable') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page')) || 1,
    limit: 9,
  });

  const [filters, setFilters] = useState(getFiltersFromURL);

  useEffect(() => {
    setFilters(getFiltersFromURL());
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const data = await vehicleApi.getAllVehicles(filters);
        if (isMounted) {
          setVehicles(data.vehicles || []);
          if (data.pagination) {
            setPagination(data.pagination);
          }
        }
      } catch (err) {
        console.error('Failed to fetch vehicles:', err.message);
        if (isMounted) setVehicles([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchVehicles();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    const updated = { ...newFilters };
    const params = new URLSearchParams();

    Object.keys(updated).forEach((key) => {
      if (updated[key] && updated[key] !== 'all') {
        params.set(key, updated[key]);
      }
    });

    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-rx-main">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-rx-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-rx-main tracking-tight">
            Explore Fleet
          </h1>
          <p className="text-xs sm:text-sm text-rx-muted mt-1">
            Browse verified cars from top hosts with transparent daily pricing
          </p>
        </div>

        {/* Top Controls: Mobile Filter Button & Sorting */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-rx-card border border-rx-border rounded-xl text-xs font-bold text-rx-main shadow-xs hover:border-rx-accent/60 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-rx-accent" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-bold min-w-[180px]">
            <span className="hidden sm:inline text-rx-muted shrink-0">Sort:</span>
            <CustomSelect
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'priceLow', label: 'Price: Low to High' },
                { value: 'priceHigh', label: 'Price: High to Low' },
                { value: 'rating', label: 'Highest Rated' },
                { value: 'oldest', label: 'Oldest First' },
              ]}
              value={filters.sort || 'newest'}
              onChange={(val) => handleFilterChange({ ...filters, sort: val })}
              placeholder="Sort fleet"
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-72 bg-rx-card rounded-3xl border border-rx-border shadow-xl p-6 shrink-0 sticky top-24">
          <FilterSidebar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Mobile Filter Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-rx-page/85 backdrop-blur-xs"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div className="relative ml-auto w-full max-w-xs bg-rx-card h-full shadow-2xl overflow-y-auto p-4 z-10 animate-in slide-in-from-right duration-200 border-l border-rx-border">
              <FilterSidebar
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
                isMobileDrawer
                onCloseMobile={() => setMobileDrawerOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Vehicles Grid */}
        <div className="flex-1 w-full space-y-8">
          <div className="flex items-center justify-between text-xs text-rx-muted font-medium">
            <span>
              Showing{' '}
              <strong className="text-rx-main font-bold">{vehicles.length}</strong> of{' '}
              <strong className="text-rx-main font-bold">{pagination.totalVehicles || vehicles.length}</strong> available listings
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <VehicleCardSkeleton key={i} />
              ))}
            </div>
          ) : vehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle._id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Car}
              title="No vehicles match your search criteria"
              description="Try loosening your filters, changing location, or selecting different dates to view available vehicles."
              actionLabel="Reset All Filters"
              onAction={handleResetFilters}
            />
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pt-8 border-t border-rx-border flex items-center justify-between">
              <button
                type="button"
                disabled={!pagination.hasPreviousPage}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rx-border bg-rx-card text-xs font-bold text-rx-muted hover:text-rx-main hover:border-rx-accent transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-xs font-semibold text-rx-muted">
                Page <strong className="text-rx-accent font-bold">{pagination.page}</strong> of{' '}
                <strong className="text-rx-main font-bold">{pagination.totalPages}</strong>
              </span>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rx-border bg-rx-card text-xs font-bold text-rx-muted hover:text-rx-main hover:border-rx-accent transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreCarsPage;
