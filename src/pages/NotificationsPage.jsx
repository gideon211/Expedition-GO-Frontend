/**
 * @file pages/NotificationsPage.jsx
 * @description Full notification history page at /notifications.
 *   Shows all notifications with pagination, mark-as-read, mark-all-read, and delete.
 *
 * @see contexts/NotificationContext.jsx — notifications state
 * @see api/notifications.js — REST API
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  ArrowLeft,
  Info,
  CalendarCheck,
  Star,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  X,
  LoaderCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Navbar } from '@/components/homepage/Navbar';
import { Footer } from '@/components/homepage/Footer';
import { useNotifications } from '@/contexts/NotificationContext';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '@/api/notifications';

const TYPE_ICONS = {
  BOOKING_CONFIRMED: CalendarCheck,
  BOOKING_CANCELLED: X,
  REVIEW_RECEIVED: Star,
  PAYOUT_PROCESSED: CreditCard,
  PAYOUT_FAILED: AlertTriangle,
  NEW_MESSAGE: MessageSquare,
  TOUR_APPROVED: CheckCheck,
  APPLICATION_REVIEWED: Info,
  APPLICATION_APPROVED: CheckCheck,
  APPLICATION_REJECTED: X,
};

const TYPE_COLORS = {
  BOOKING_CONFIRMED: 'text-emerald-600 bg-emerald-50',
  BOOKING_CANCELLED: 'text-rose-600 bg-rose-50',
  REVIEW_RECEIVED: 'text-amber-600 bg-amber-50',
  PAYOUT_PROCESSED: 'text-blue-600 bg-blue-50',
  PAYOUT_FAILED: 'text-rose-600 bg-rose-50',
  NEW_MESSAGE: 'text-violet-600 bg-violet-50',
  TOUR_APPROVED: 'text-emerald-600 bg-emerald-50',
  APPLICATION_REVIEWED: 'text-sky-600 bg-sky-50',
  APPLICATION_APPROVED: 'text-emerald-600 bg-emerald-50',
  APPLICATION_REJECTED: 'text-rose-600 bg-rose-50',
};

function NotificationIcon({ type, read }) {
  const Icon = TYPE_ICONS[type] || Info;
  const colorClass = TYPE_COLORS[type] || 'text-slate-600 bg-slate-100';
  return (
    <div className={`flex size-11 shrink-0 items-center justify-center rounded-full ${read ? 'opacity-60' : ''} ${colorClass}`}>
      <Icon className="size-5.5" />
    </div>
  );
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDay === 0) {
    return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }
  if (diffDay === 1) {
    return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }
  if (diffDay < 7) {
    return `${diffDay} days ago`;
  }
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export default function NotificationsPage() {
  const { unreadCount } = useNotifications();
  const [allNotifs, setAllNotifs] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const limit = 20;

  const loadPage = useCallback(async (pageNum, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const result = await fetchNotifications({ page: pageNum, limit });
      const notifs = result.notifications || [];
      const pag = result.pagination || null;
      setPagination(pag);
      setAllNotifs((prev) => (append ? [...prev, ...notifs] : notifs));
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  const handleMarkRead = useCallback(
    async (id) => {
      setAllNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      try {
        await markNotificationRead(id);
      } catch {
        setAllNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
      }
    },
    []
  );

  const handleMarkAllRead = useCallback(async () => {
    setAllNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await markAllNotificationsRead();
      toast.success('All notifications marked as read');
    } catch {
      loadPage(page);
    }
  }, [loadPage, page]);

  const handleDelete = useCallback(
    async (id) => {
      setDeleting(id);
      setAllNotifs((prev) => prev.filter((n) => n.id !== id));
      try {
        await deleteNotification(id);
      } catch {
        loadPage(page);
      } finally {
        setDeleting(null);
      }
    },
    [loadPage, page]
  );

  const handleNextPage = useCallback(() => {
    const next = page + 1;
    setPage(next);
    loadPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, loadPage]);

  const handlePrevPage = useCallback(() => {
    const prev = page - 1;
    setPage(prev);
    loadPage(prev);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, loadPage]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-[820px] px-4 pb-20 pt-24 sm:px-6 lg:px-8 lg:pt-28">
        {/* Page header */}
        <div className="mb-8">
          <Link
            to="/settings"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-700"
          >
            <ArrowLeft className="size-4" />
            Back to Settings
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Notifications</h1>
              <p className="mt-1 text-sm text-slate-500">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                  : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                <CheckCheck className="size-4" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <LoaderCircle className="size-8 animate-spin text-slate-400" />
            <p className="mt-3 text-sm text-slate-500">Loading notifications...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && allNotifs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center"
          >
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-slate-100">
              <Bell className="size-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">No notifications yet</h2>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              We'll send you updates about your bookings, reviews, and more. Check back later!
            </p>
          </motion.div>
        )}

        {/* Notification list */}
        {!loading && allNotifs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {allNotifs.map((notif) => (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group relative flex items-start gap-4 rounded-xl border p-4 transition ${
                  notif.read
                    ? 'border-slate-200 bg-white'
                    : 'border-emerald-200 bg-emerald-50/40'
                }`}
              >
                <NotificationIcon type={notif.type} read={notif.read} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3
                        className={`text-sm leading-tight ${
                          !notif.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'
                        }`}
                      >
                        {notif.title}
                      </h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                        {formatDate(notif.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {!notif.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(notif.id)}
                          className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-emerald-100 hover:text-emerald-700 group-hover:opacity-100"
                          aria-label="Mark as read"
                        >
                          <CheckCheck className="size-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(notif.id)}
                        disabled={deleting === notif.id}
                        className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-rose-100 hover:text-rose-600 group-hover:opacity-100 disabled:cursor-wait"
                        aria-label="Delete notification"
                      >
                        {deleting === notif.id ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {notif.message && (
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {notif.message}
                    </p>
                  )}
                </div>

                {!notif.read && (
                  <span className="absolute left-2 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-emerald-500" />
                )}
              </motion.div>
            ))}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 pt-6">
                <p className="text-sm text-slate-500">
                  Page {pagination.currentPage} of {pagination.totalPages}
                  {' · '}
                  {pagination.totalCount} notification{pagination.totalCount !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={pagination.currentPage <= 1}
                    className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={!pagination.hasNextPage}
                    className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}

            {loadingMore && (
              <div className="flex justify-center py-4">
                <LoaderCircle className="size-5 animate-spin text-slate-400" />
              </div>
            )}
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}
