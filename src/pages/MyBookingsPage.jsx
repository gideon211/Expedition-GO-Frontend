/**
 * @file MyBookingsPage.jsx
 * @description Displays the user's upcoming and past bookings fetched from the backend.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, Users, ChevronRight, ArrowLeft, LoaderCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getMyBookings } from '@/api/bookings';
import { useAuth } from '@/components/auth/AuthProvider';
import { Navbar } from '@/components/homepage/Navbar';
import { Footer } from '@/components/homepage/Footer';
import { Button } from '@/components/ui/button';

const statusConfig = {
  PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-emerald-100 text-emerald-800' },
  ACTIVE: { label: 'Active', className: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Completed', className: 'bg-slate-100 text-slate-700' },
  CANCELLED: { label: 'Cancelled', className: 'bg-rose-100 text-rose-700' },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    let cancelled = false;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyBookings({ limit: 50 });
        if (!cancelled) {
          setBookings(data?.bookings || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Failed to load bookings.');
          toast.error('Could not load your bookings.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBookings();
    return () => { cancelled = true; };
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--page-bg)] text-slate-900">
      <Navbar />
      <div className="h-[var(--navbar-offset)] shrink-0" aria-hidden />

      <main className="mx-auto w-full flex-1 max-w-[960px] px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/')}
            className="group mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-[color:var(--brand-green)]/30 hover:bg-[color:var(--brand-mist)] hover:text-[color:var(--brand-green)]"
          >
            <ArrowLeft className="size-4 transition group-hover:-translate-x-0.5" />
            Back to Home
          </button>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">My Bookings</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Track your upcoming experiences and past adventures
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoaderCircle className="size-8 animate-spin text-[color:var(--brand-green)]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 grid size-16 place-items-center rounded-full bg-rose-50">
              <CalendarDays className="size-8 text-rose-400" />
            </div>
            <p className="text-lg font-semibold text-slate-900">Something went wrong</p>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-6"
            >
              Try again
            </Button>
          </div>
        ) : bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="mb-4 grid size-16 place-items-center rounded-full bg-slate-100">
              <CalendarDays className="size-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">No bookings yet</h2>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              When you book a tour, it will appear here. Start exploring our experiences!
            </p>
            <Link
              to="/tours"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-green)] px-6 py-2.5 text-sm font-semibold !text-white transition hover:bg-[color:var(--brand-green)]/90"
            >
              Browse tours
              <ChevronRight className="size-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => {
              const status = statusConfig[booking.status] || statusConfig.PENDING;
              const tourImage = booking.tour?.photos?.[0] || null;
              const travelerCount = (booking.travelers?.adults || 0) + (booking.travelers?.children || 0);

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="relative h-40 w-full shrink-0 bg-slate-100 sm:h-auto sm:w-48">
                      {tourImage ? (
                        <img
                          src={tourImage}
                          alt={booking.tour?.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <MapPin className="size-10 text-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                            {booking.tour?.title || 'Tour'}
                          </h3>
                          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                            {status.label}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 sm:text-sm">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="size-3.5 shrink-0" />
                            {formatDate(booking.selectedDate)}
                          </span>
                          {booking.selectedTime && (
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="size-3.5 shrink-0" />
                              {booking.selectedTime}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="size-3.5 shrink-0" />
                            {travelerCount} {travelerCount === 1 ? 'traveler' : 'travelers'}
                          </span>
                        </div>

                        {booking.bookingNumber && (
                          <p className="mt-2 text-xs text-slate-400">
                            Ref: {booking.bookingNumber}
                          </p>
                        )}
                      </div>

                      {booking.tour?.title && (
                        <div className="mt-4 flex items-center gap-2">
                          <Link
                            to={`/review/${encodeURIComponent(booking.tour.title)}`}
                            state={{
                              booking,
                              tour: {
                                title: booking.tour.title,
                                tourId: booking.tour?.id,
                                image: tourImage,
                                duration: '',
                                location: '',
                                price: booking.total || 0,
                                rating: 0,
                                reviews: 0,
                              },
                            }}
                            className="inline-flex items-center gap-1 rounded-full border border-[color:var(--brand-green)] px-3 py-1.5 text-xs font-semibold text-[color:var(--brand-green)] transition hover:bg-emerald-50"
                          >
                            Write a review
                          </Link>
                          {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                            <Link
                              to={`/tour/${encodeURIComponent(booking.tour.title)}`}
                              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100"
                            >
                              View tour
                              <ChevronRight className="size-3" />
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
