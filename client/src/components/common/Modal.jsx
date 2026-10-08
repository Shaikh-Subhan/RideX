import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-rx-page/85 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidth} bg-rx-card rounded-2xl border border-rx-border shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200 my-8 text-rx-main`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-rx-border">
          <div>
            <h3 className="text-lg font-bold text-rx-main">{title}</h3>
            {subtitle && <p className="text-xs text-rx-muted mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-rx-muted hover:text-rx-main hover:bg-rx-surface transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <p className="text-xs sm:text-sm text-rx-muted mb-6 leading-relaxed">{message}</p>
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-rx-border">
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-rx-muted bg-rx-surface hover:bg-rx-border transition-colors cursor-pointer border border-rx-border"
        >
          {cancelText}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md ${
            isDanger
              ? 'bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent'
              : 'bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent'
          }`}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default Modal;
