import React, { useState } from 'react';
import { Calendar, Plus, Trash2, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import vehicleApi from '../../api/vehicleApi';
import { useToast } from '../../context/ToastContext';

export const VehicleAvailabilityModal = ({ isOpen, onClose, vehicle, onSuccess }) => {
  const [ranges, setRanges] = useState(() => {
    if (vehicle?.availability && Array.isArray(vehicle.availability)) {
      return vehicle.availability.map((r) => ({
        startDate: r.startDate ? new Date(r.startDate).toISOString().split('T')[0] : '',
        endDate: r.endDate ? new Date(r.endDate).toISOString().split('T')[0] : '',
      }));
    }
    return [];
  });

  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { success, error: toastError } = useToast();

  const handleAddRange = () => {
    setErrorMsg('');
    if (!newStart || !newEnd) {
      setErrorMsg('Both start and end dates are required');
      return;
    }
    if (new Date(newStart) >= new Date(newEnd)) {
      setErrorMsg('Start date must be before end date');
      return;
    }

    setRanges((prev) => [...prev, { startDate: newStart, endDate: newEnd }]);
    setNewStart('');
    setNewEnd('');
  };

  const handleRemoveRange = (index) => {
    setRanges((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setErrorMsg('');
    try {
      setSubmitting(true);
      await vehicleApi.updateAvailability(vehicle._id, ranges);
      success('Vehicle availability updated successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update availability';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Availability Windows"
      subtitle={`${vehicle?.make || 'Vehicle'} ${vehicle?.model || ''}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5 text-rx-main">
        {errorMsg && (
          <div className="p-3 bg-rx-accent-soft/50 border border-rx-accent-border/60 rounded-xl flex items-start gap-2 text-xs text-rx-accent">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rx-accent" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Existing Ranges List */}
        <div>
          <h4 className="text-[10px] font-bold text-rx-muted uppercase tracking-wider mb-2">
            Active Availability Windows
          </h4>
          {ranges.length === 0 ? (
            <p className="text-xs text-rx-muted py-3 text-center bg-rx-surface rounded-xl border border-rx-border">
              No restrictions added. Car is available for reservation.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {ranges.map((range, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-rx-surface border border-rx-border rounded-xl text-xs font-medium text-rx-muted"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-rx-accent" />
                    <span>
                      {range.startDate} &rarr; {range.endDate}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRange(idx)}
                    className="p-1 text-rx-muted hover:text-rx-accent rounded-lg transition-colors cursor-pointer"
                    title="Remove window"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Range Form */}
        <div className="p-4 bg-rx-surface border border-rx-border rounded-2xl space-y-3">
          <span className="text-xs font-bold text-rx-main block">Add Availability Window</span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-rx-muted font-semibold block mb-0.5">Start Date</span>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-rx-card border border-rx-border rounded-xl text-xs text-rx-main focus:outline-none focus:border-rx-accent"
              />
            </div>
            <div>
              <span className="text-[10px] text-rx-muted font-semibold block mb-0.5">End Date</span>
              <input
                type="date"
                min={newStart || new Date().toISOString().split('T')[0]}
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-rx-card border border-rx-border rounded-xl text-xs text-rx-main focus:outline-none focus:border-rx-accent"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddRange}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-rx-card hover:bg-rx-border border border-rx-border text-rx-accent text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Window
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-rx-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-rx-muted bg-rx-surface hover:bg-rx-border rounded-xl transition-colors cursor-pointer border border-rx-border"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            className="px-5 py-2 text-xs font-bold text-rx-on-accent bg-rx-accent hover:bg-rx-accent-hover rounded-xl transition-colors shadow-md cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VehicleAvailabilityModal;
