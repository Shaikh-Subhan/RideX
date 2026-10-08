import React, { useState } from 'react';
import { Star } from 'lucide-react';
import Modal from '../common/Modal';
import RatingStars from '../common/RatingStars';
import reviewApi from '../../api/reviewApi';
import { useToast } from '../../context/ToastContext';

export const ReviewVehicleModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  if (!booking) return null;

  const vehicle = booking.vehicle || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toastError('Please select a star rating between 1 and 5');
      return;
    }

    try {
      setSubmitting(true);
      await reviewApi.createVehicleReview({
        vehicleId: vehicle._id || vehicle,
        bookingId: booking._id,
        rating,
        review: review.trim(),
      });

      success('Thank you! Your vehicle review was submitted successfully.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rate this Vehicle"
      subtitle={`Review for ${vehicle.make || 'Vehicle'} ${vehicle.model || ''}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-rx-main">
        <div className="text-center py-4 bg-rx-surface rounded-2xl border border-rx-border">
          <p className="text-xs font-semibold text-rx-muted mb-3">
            How was your driving experience?
          </p>
          <div className="flex justify-center">
            <RatingStars
              rating={rating}
              size="xl"
              interactive
              onChange={(newRating) => setRating(newRating)}
            />
          </div>
          <span className="text-xs font-bold text-rx-accent mt-2 block">
            {rating} of 5 Stars
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-rx-muted">Written Review (Optional)</label>
          <textarea
            rows="4"
            placeholder="Share details about performance, comfort, handling, and fuel efficiency..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full p-3 bg-rx-surface border border-rx-border rounded-xl text-xs text-rx-main placeholder-rx-muted focus:outline-none focus:border-rx-accent transition-all"
          />
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
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-xs font-bold text-rx-on-accent bg-rx-accent hover:bg-rx-accent-hover rounded-xl transition-colors shadow-md cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewVehicleModal;
