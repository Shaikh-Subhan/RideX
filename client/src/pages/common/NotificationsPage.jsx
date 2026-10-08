import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  CalendarCheck,
  CreditCard,
  FileCheck,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';
import notificationApi from '../../api/notificationApi';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { formatDateTime } from '../../utils/format';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error: toastError } = useToast();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getMyNotifications();
      setNotifications(res?.notifications || []);
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      toastError('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      success('All notifications marked as read');
    } catch (err) {
      toastError('Failed to mark all as read');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type) => {
    if (type?.includes('booking')) {
      return <CalendarCheck className="w-5 h-5 text-rx-accent" />;
    }
    if (type?.includes('payment')) {
      return <CreditCard className="w-5 h-5 text-rx-accent" />;
    }
    if (type?.includes('verification')) {
      return <FileCheck className="w-5 h-5 text-rx-accent" />;
    }
    return <Info className="w-5 h-5 text-rx-accent" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 text-rx-main">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-rx-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-rx-main tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rx-accent text-rx-on-accent text-xs font-bold">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-rx-muted">
            Real-time updates regarding your reservations, vehicle verifications, and payments
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rx-card hover:bg-rx-surface text-rx-muted border border-rx-border text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-rx-accent" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse p-5 bg-rx-card rounded-2xl border border-rx-border flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-rx-surface shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-rx-surface rounded-md w-48" />
                <div className="h-3 bg-rx-surface rounded-md w-full max-w-md" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                n.isRead
                  ? 'bg-rx-card border-rx-border opacity-90'
                  : 'bg-rx-accent-soft/20 border-rx-accent/40 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rx-surface border border-rx-border flex items-center justify-center shrink-0 shadow-xs">
                  {getNotificationIcon(n.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-rx-main text-sm">{n.title}</h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-rx-accent inline-block" />
                    )}
                  </div>
                  <p className="text-xs text-rx-muted leading-relaxed">{n.message}</p>
                  
                  {/* Action Link based on notification type */}
                  {n.type === 'vehicle_verification_requested' && (
                    <div className="pt-2">
                      <Link
                        to="/admin/verification"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent text-xs font-bold rounded-lg transition-colors shadow-xs"
                      >
                        <span>Review & Verify Vehicle Documents</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}

                  {(n.type === 'vehicle_verification_approved' || n.type === 'vehicle_verification_rejected') && (
                    <div className="pt-2">
                      <Link
                        to="/owner/vehicles"
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-rx-surface hover:bg-rx-border text-rx-main border border-rx-border text-xs font-bold rounded-lg transition-colors"
                      >
                        <span>Go to My Vehicles</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}

                  {(n.type === 'booking_requested' || n.type === 'booking_approved') && (
                    <div className="pt-2">
                      <Link
                        to="/owner/bookings"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent text-xs font-bold rounded-lg transition-colors shadow-xs"
                      >
                        <span>View Booking Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}

                  <span className="text-[10px] text-rx-muted block pt-1">
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>
              </div>

              {!n.isRead && (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(n._id)}
                  className="p-1.5 text-rx-muted hover:text-rx-main rounded-lg hover:bg-rx-surface transition-colors cursor-pointer shrink-0"
                  title="Mark as read"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="All Caught Up!"
          description="You don't have any notifications right now. Trip updates and messages will appear here."
        />
      )}
    </div>
  );
};

export default NotificationsPage;
