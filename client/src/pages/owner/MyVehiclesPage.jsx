import React, { useState, useEffect } from 'react';
import { getVehicleImageUrl } from '../../utils/vehicleImage';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car,
  PlusCircle,
  Calendar,
  FileCheck,
  Edit3,
  Trash2,
  ExternalLink
} from 'lucide-react';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import vehicleApi from '../../api/vehicleApi';
import Badge from '../../components/common/Badge';
import RatingStars from '../../components/common/RatingStars';
import VehicleAvailabilityModal from '../../components/owner/VehicleAvailabilityModal';
import VehicleVerificationModal from '../../components/owner/VehicleVerificationModal';
import { ConfirmDialog } from '../../components/common/Modal';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const MyVehiclesPage = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedVehicleForAvail, setSelectedVehicleForAvail] = useState(null);
  const [selectedVehicleForVerif, setSelectedVehicleForVerif] = useState(null);
  const [deletingVehicleId, setDeletingVehicleId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await vehicleApi.getMyVehicles();
      setVehicles(res?.vehicles || []);
    } catch (err) {
      console.warn('Failed to load my vehicles:', err.message);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDelete = async () => {
    if (!deletingVehicleId) return;
    try {
      setDeleting(true);
      await vehicleApi.deleteVehicle(deletingVehicleId);
      success('Vehicle deleted successfully');
      setDeletingVehicleId(null);
      fetchVehicles();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to delete vehicle');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-rx-main">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <OwnerSidebar />

        <div className="flex-1 min-w-0 w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-rx-border">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-rx-main tracking-tight">
                My Vehicles
              </h1>
              <p className="text-xs sm:text-sm text-rx-muted mt-1">
                Manage vehicle specs, availability schedule, and official verification
              </p>
            </div>

            <Link
              to="/owner/vehicles/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent text-xs font-extrabold transition-all shadow-md self-start sm:self-auto cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Vehicle</span>
            </Link>
          </div>

          {/* Table / Grid */}
          {loading ? (
            <div className="bg-rx-card rounded-3xl border border-rx-border p-8 shadow-xl">
              <table className="w-full">
                <tbody>
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                </tbody>
              </table>
            </div>
          ) : vehicles.length > 0 ? (
            <div className="bg-rx-card rounded-3xl border border-rx-border shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-rx-page/50 border-b border-rx-border text-rx-muted font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-4 px-5">Vehicle</th>
                      <th className="py-4 px-4">Daily Rate</th>
                      <th className="py-4 px-4">Location</th>
                      <th className="py-4 px-4">Rating</th>
                      <th className="py-4 px-4">Verification</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rx-border">
                    {vehicles.map((v) => {
                      const verifStatus = v.verification?.status || 'pending';
                      return (
                        <tr key={v._id} className="hover:bg-rx-surface/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <img
                                src={getVehicleImageUrl(v)}
                                alt={v.model}
                                className="w-14 h-10 object-cover rounded-xl shrink-0 border border-rx-border"
                              />
                              <div>
                                <h4 className="font-bold text-rx-main text-sm flex items-center gap-2">
                                  <span>{v.make} {v.model}</span>
                                  {v.vehicleNumber && (
                                    <span className="px-1.5 py-0.5 rounded bg-rx-page text-rx-accent border border-rx-border text-[9px] font-mono font-bold uppercase">
                                      {v.vehicleNumber}
                                    </span>
                                  )}
                                </h4>
                                <span className="text-rx-muted text-[11px]">
                                  {v.year} &bull; {v.vehicleType}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-bold text-rx-accent text-sm">
                              ${v.rentalPricePerDay}
                            </span>
                            <span className="text-rx-muted text-[10px]">/day</span>
                          </td>

                          <td className="py-4 px-4 text-rx-muted font-medium">
                            {v.location || 'Not set'}
                          </td>

                          <td className="py-4 px-4">
                            <RatingStars rating={v.averageRating || 0} showNumber size="sm" />
                          </td>

                          <td className="py-4 px-4">
                            <Badge status={verifStatus}>{verifStatus}</Badge>
                          </td>

                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Submit or re-submit verification */}
                              {verifStatus !== 'verified' && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedVehicleForVerif(v)}
                                  className="p-1.5 text-rx-accent hover:bg-rx-surface rounded-lg transition-colors cursor-pointer"
                                  title="Submit verification docs"
                                >
                                  <FileCheck className="w-4 h-4" />
                                </button>
                              )}

                              {/* Availability Editor */}
                              <button
                                type="button"
                                onClick={() => setSelectedVehicleForAvail(v)}
                                className="p-1.5 text-rx-muted hover:text-rx-main hover:bg-rx-surface rounded-lg transition-colors cursor-pointer"
                                title="Manage availability dates"
                              >
                                <Calendar className="w-4 h-4" />
                              </button>

                              {/* Edit Vehicle */}
                              <Link
                                to={`/owner/vehicles/${v._id}/edit`}
                                className="p-1.5 text-rx-muted hover:text-rx-main hover:bg-rx-surface rounded-lg transition-colors"
                                title="Edit vehicle details"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Link>

                              {/* View on Marketplace */}
                              <Link
                                to={`/cars/${v._id}`}
                                className="p-1.5 text-rx-muted hover:text-rx-main hover:bg-rx-surface rounded-lg transition-colors"
                                title="View public page"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>

                              {/* Delete Vehicle */}
                              <button
                                type="button"
                                onClick={() => setDeletingVehicleId(v._id)}
                                className="p-1.5 text-rx-accent hover:bg-rx-accent-soft/20 rounded-lg transition-colors cursor-pointer"
                                title="Delete vehicle"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Car}
              title="No Vehicles Added Yet"
              description="Start renting out your car on RideX. Add your vehicle, submit verification docs, and start accepting booking requests."
              actionLabel="Add Your First Car"
              onAction={() => navigate('/owner/vehicles/new')}
            />
          )}
        </div>
      </div>

      {/* Availability Modal */}
      {selectedVehicleForAvail && (
        <VehicleAvailabilityModal
          isOpen={!!selectedVehicleForAvail}
          onClose={() => setSelectedVehicleForAvail(null)}
          vehicle={selectedVehicleForAvail}
          onSuccess={fetchVehicles}
        />
      )}

      {/* Verification Modal */}
      {selectedVehicleForVerif && (
        <VehicleVerificationModal
          isOpen={!!selectedVehicleForVerif}
          onClose={() => setSelectedVehicleForVerif(null)}
          vehicle={selectedVehicleForVerif}
          onSuccess={fetchVehicles}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingVehicleId}
        onClose={() => setDeletingVehicleId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        isDanger
        title="Delete Vehicle?"
        message="Are you sure you want to permanently delete this vehicle from your fleet? Any existing history will be archived."
        confirmText="Yes, Delete Vehicle"
      />
    </div>
  );
};

export default MyVehiclesPage;
