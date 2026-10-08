import React, { useState } from 'react';
import { ShieldCheck, Award } from 'lucide-react';
import Modal from '../common/Modal';
import trustApi from '../../api/trustApi';
import { useToast } from '../../context/ToastContext';
import TrustScoreBadge from '../common/TrustScoreBadge';

export const ReviewRenterModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const [trustScore, setTrustScore] = useState(85);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  if (!booking) return null;

  const renter = booking.renter || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await trustApi.createRenterTrustReview({
        renterId: renter._id || renter,
        bookingId: booking._id,
        trustScore: Number(trustScore),
        review: review.trim(),
      });

      success('Renter trust evaluation submitted successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to submit trust review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Evaluate Renter Trust"
      subtitle={`Trust review for ${renter.name || 'Renter'}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-rx-main">
        <div className="p-5 bg-rx-surface rounded-2xl border border-rx-border text-center space-y-3">
          <p className="text-xs font-semibold text-rx-muted">
            Assign a Trust Score based on return punctuality, car cleanliness, and communication.
          </p>

          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-extrabold text-rx-accent">{trustScore}</span>
            <span className="text-sm font-semibold text-rx-muted">/ 100</span>
          </div>

          <div className="flex justify-center">
            <TrustScoreBadge score={trustScore} size="lg" />
          </div>

          <div className="px-4 pt-2">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={trustScore}
              onChange={(e) => setTrustScore(Number(e.target.value))}
              className="w-full accent-rx-accent cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-rx-muted font-bold uppercase mt-1">
              <span>0 (Poor)</span>
              <span>50 (Fair)</span>
              <span>100 (Perfect)</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-rx-muted">Host Feedback / Comments</label>
          <textarea
            rows="3"
            placeholder="e.g. Returned vehicle clean, full tank on time, excellent communication throughout the trip..."
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
            {submitting ? 'Submitting...' : 'Submit Trust Evaluation'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewRenterModal;
