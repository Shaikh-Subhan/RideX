import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg) => showToast(msg, 'success'), [showToast]);
  const error = useCallback((msg) => showToast(msg, 'error', 5000), [showToast]);
  const warning = useCallback((msg) => showToast(msg, 'warning'), [showToast]);
  const info = useCallback((msg) => showToast(msg, 'info'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => {
          let bg = 'bg-rx-card text-rx-main border-rx-border-strong';
          let icon = <Info className="w-5 h-5 text-rx-accent shrink-0" />;

          if (toast.type === 'success') {
            bg = 'bg-rx-accent-dark/95 text-rx-accent border-rx-accent-border';
            icon = <CheckCircle2 className="w-5 h-5 text-rx-accent shrink-0" />;
          } else if (toast.type === 'error') {
            bg = 'bg-rx-accent-dark/95 text-rx-accent border-rx-accent-border';
            icon = <AlertCircle className="w-5 h-5 text-rx-accent shrink-0" />;
          } else if (toast.type === 'warning') {
            bg = 'bg-rx-accent-dark/95 text-rx-accent border-rx-accent-border';
            icon = <AlertTriangle className="w-5 h-5 text-rx-accent shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${bg}`}
            >
              {icon}
              <div className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 transition-opacity p-0.5"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
