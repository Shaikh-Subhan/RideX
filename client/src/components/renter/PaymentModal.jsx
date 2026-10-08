import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, DollarSign, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import paymentApi from '../../api/paymentApi';
import { useToast } from '../../context/ToastContext';

export const PaymentModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [payAmount, setPayAmount] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successPayment, setSuccessPayment] = useState(null);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    if (!isOpen || !booking) return;

    let isMounted = true;
    setErrorMsg('');
    setSuccessPayment(null);

    const initPayment = async () => {
      try {
        setLoading(true);
        const res = await paymentApi.createPayment({ bookingId: booking._id });
        if (isMounted && res?.payment) {
          setPayment(res.payment);
          setPayAmount(res.payment.remainingAmount || res.payment.totalAmount || booking.totalAmount);
        }
      } catch (err) {
        try {
          const existingRes = await paymentApi.getPaymentByBooking(booking._id);
          if (isMounted && existingRes?.payment) {
            setPayment(existingRes.payment);
            setPayAmount(existingRes.payment.remainingAmount);
          } else {
            setErrorMsg(err.response?.data?.message || 'Failed to initiate payment');
          }
        } catch (fetchErr) {
          setErrorMsg(fetchErr.response?.data?.message || err.response?.data?.message || 'Failed to initiate payment');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initPayment();
    return () => {
      isMounted = false;
    };
  }, [isOpen, booking]);

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!payment?._id) return;

    const amountNum = Number(payAmount);
    if (!amountNum || amountNum <= 0) {
      toastError('Please enter a valid payment amount');
      return;
    }

    try {
      setPaying(true);
      setErrorMsg('');
      const res = await paymentApi.processDemoPayment(payment._id, { amount: amountNum });

      success('Payment processed successfully!');
      setSuccessPayment(res.payment);
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment processing failed';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setPaying(false);
    }
  };

  const handleCloseAfterSuccess = () => {
    if (successPayment && onSuccess) {
      onSuccess(successPayment);
    }
    onClose();
  };

  if (!booking) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={successPayment ? handleCloseAfterSuccess : onClose}
      title="Secure Checkout"
      subtitle={`Booking Reference #${booking._id.substring(booking._id.length - 8).toUpperCase()}`}
      maxWidth="max-w-md"
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-rx-accent border-t-rx-transparent rounded-full animate-spin" />
          <p className="text-xs text-rx-muted font-medium">Preparing payment invoice...</p>
        </div>
      ) : successPayment ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rx-accent-soft/50 border border-rx-accent-border/60 text-rx-accent flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-rx-main">Payment Confirmed</h4>
            <p className="text-xs text-rx-muted mt-1">
              Your transaction has been recorded on the RideX ledger.
            </p>
          </div>

          <div className="p-4 bg-rx-surface rounded-2xl border border-rx-border text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-rx-muted">Transaction ID:</span>
              <span className="font-mono font-bold text-rx-main">
                {successPayment.transactionId || 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-rx-muted">Total Paid:</span>
              <span className="font-bold text-rx-accent">${successPayment.paidAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-rx-muted">Remaining Balance:</span>
              <span className="font-semibold text-rx-muted">${successPayment.remainingAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-rx-muted">Status:</span>
              <span className="font-bold uppercase text-rx-accent">{successPayment.status}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseAfterSuccess}
            className="w-full py-2.5 rounded-xl bg-rx-accent text-rx-on-accent font-bold text-xs hover:bg-rx-accent-hover transition-colors cursor-pointer shadow-md"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleProcessPayment} className="space-y-5 text-rx-main">
          {errorMsg && (
            <div className="p-3 bg-rx-accent-soft/50 border border-rx-accent-border/60 rounded-xl flex items-start gap-2 text-xs text-rx-accent">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rx-accent" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Payment Summary Box */}
          <div className="p-4 bg-rx-surface rounded-2xl border border-rx-border space-y-2.5 text-xs">
            <div className="flex justify-between text-rx-muted">
              <span>Vehicle:</span>
              <span className="font-bold text-rx-main">
                {booking.vehicle?.make} {booking.vehicle?.model}
              </span>
            </div>
            <div className="flex justify-between text-rx-muted">
              <span>Total Booking Amount:</span>
              <span className="font-bold text-rx-main">${payment?.totalAmount ?? booking.totalAmount}</span>
            </div>
            <div className="flex justify-between text-rx-muted">
              <span>Already Paid:</span>
              <span className="font-semibold text-rx-accent">${payment?.paidAmount ?? 0}</span>
            </div>
            <div className="pt-2 border-t border-rx-border flex justify-between items-baseline">
              <span className="font-bold text-rx-main">Remaining Due:</span>
              <span className="text-xl font-extrabold text-rx-accent">
                ${payment?.remainingAmount ?? booking.totalAmount}
              </span>
            </div>
          </div>

          {/* Method selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-rx-muted block">Select Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'card', label: 'Debit / Credit Card' },
                { id: 'upi', label: 'Instant UPI' },
                { id: 'netbanking', label: 'Net Banking' },
                { id: 'wallet', label: 'Digital Wallet' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                    paymentMethod === m.id
                      ? 'bg-rx-accent-soft/40 border-rx-accent text-rx-accent shadow-sm'
                      : 'bg-rx-surface border-rx-border text-rx-muted hover:border-rx-accent/40'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-rx-muted">Amount to Pay ($)</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-rx-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                step="1"
                min="1"
                max={payment?.remainingAmount || booking.totalAmount}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-rx-surface border border-rx-border rounded-xl text-sm font-bold text-rx-main focus:outline-none focus:border-rx-accent"
              />
            </div>
            <p className="text-[10px] text-rx-muted">
              Simulation gateway allows full or partial checkout demonstration.
            </p>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-rx-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-rx-muted bg-rx-surface hover:bg-rx-border rounded-xl transition-colors cursor-pointer border border-rx-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={paying || !payment}
              className="px-5 py-2.5 text-xs font-bold text-rx-on-accent bg-rx-accent hover:bg-rx-accent-hover rounded-xl transition-colors shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {paying ? 'Authorizing Payment...' : `Pay $${payAmount} Now`}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-rx-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-rx-accent" />
            <span>256-Bit Encrypted Simulation Gateway</span>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default PaymentModal;
