/**
 * @file components/ui/NotificationBell.jsx
 * @description Bell icon button with unread count badge + dropdown of recent notifications.
 *   Used in the global navbar for both desktop and mobile.
 *
 * @see contexts/NotificationContext.jsx — unreadCount, notifications, markRead, markAllRead
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, X, LoaderCircle, Info, CalendarCheck, Star, CreditCard, MessageSquare, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotifications } from '@/contexts/NotificationContext';

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
    <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${read ? 'opacity-60' : ''} ${colorClass}`}>
      <Icon className="size-5" />
    </div>
  );
}

function timeAgo(dateString) {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NotificationBell() {
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleToggle = useCallback(() => setOpen((prev) => !prev), []);

  const handleMarkAllRead = useCallback(async () => {
    await markAllRead();
  }, [markAllRead]);

  const handleNotificationClick = useCallback(
    (notif) => {
      if (!notif.read) markRead(notif.id);
      setOpen(false);
    },
    [markRead]
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="group relative flex flex-col items-center gap-1 p-2 text-slate-700 transition hover:text-slate-950 xl:p-0"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <div className="relative">
          <Bell className="size-5 transition group-hover:text-[color:var(--brand-green)]" />
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <span className="hidden text-xs font-semibold xl:block">
          <span className="relative">
            Notifications
            <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-(--brand-green) transition-[width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:w-full" />
          </span>
        </span>
      </button>

      {open && (
        <div
          ref={dropdownRef}
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full z-50 mt-2 w-[380px] origin-top-right rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                  {unreadCount} new
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-700 transition hover:text-emerald-800"
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-[360px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <LoaderCircle className="size-6 animate-spin text-slate-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="relative mb-3">
                  {/* Pulse effect */}
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-0 -m-1 rounded-full bg-slate-200"
                  />
                  
                  {/* Bell with swing */}
                  <motion.div
                    animate={{
                      rotate: [0, -10, 10, -8, 8, -5, 5, 0],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      repeatDelay: 2,
                      ease: 'easeInOut',
                    }}
                    style={{ transformOrigin: 'top center' }}
                  >
                    <Bell className="size-10 text-slate-300" strokeWidth={2} />
                  </motion.div>
                </div>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm font-medium text-slate-500"
                >
                  No notifications yet
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-0.5 text-xs text-slate-400"
                >
                  We'll notify you when something arrives
                </motion.p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {notifications.slice(0, 10).map((notif) => (
                  <li key={notif.id}>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notif)}
                      className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${
                        !notif.read ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <NotificationIcon type={notif.type} read={notif.read} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm leading-tight ${
                              !notif.read ? 'font-semibold text-slate-900' : 'text-slate-700'
                            }`}
                          >
                            {notif.title}
                          </p>
                          <span className="shrink-0 text-[11px] text-slate-400">
                            {timeAgo(notif.createdAt)}
                          </span>
                        </div>
                        {notif.message && (
                          <p className="mt-0.5 text-xs leading-relaxed text-slate-500 line-clamp-2">
                            {notif.message}
                          </p>
                        )}
                        {!notif.read && (
                          <span className="mt-1 inline-block size-1.5 rounded-full bg-emerald-500" />
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer — View all */}
          <div className="border-t border-slate-100 px-4 py-2.5">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
