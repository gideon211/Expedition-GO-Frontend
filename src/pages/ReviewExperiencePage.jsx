import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  ChevronDown,
  ChevronRight,
  Info,
  Sparkles,
  Camera,
  Image,
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { AppleCalendarPicker } from '@/components/ui/apple-calendar-picker';
import { Navbar } from '@/components/homepage/Navbar';
import { createReview } from '@/api/reviews';
import { getMyBookings } from '@/api/bookings';
import { PlaceCard } from '@/components/ui/card-22';
import { setAuthReturnTo } from '@/lib/auth';
import { slugify } from '@/lib/slugify';

const REVIEW_DRAFT_STORAGE_PREFIX = 'eg_review_draft:';
const REVIEW_SUBMISSION_STORAGE_PREFIX = 'eg_submitted_review:';

function getReviewDraftKey(tourTitle) {
  return `${REVIEW_DRAFT_STORAGE_PREFIX}${encodeURIComponent(tourTitle || 'unknown-tour')}`;
}

function readReviewDraft(tourTitle) {
  try {
    const raw = sessionStorage.getItem(getReviewDraftKey(tourTitle));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeReviewDraft(tourTitle, draft) {
  try {
    sessionStorage.setItem(getReviewDraftKey(tourTitle), JSON.stringify(draft));
  } catch {
    // Ignore storage failures; the review can still be submitted in the current page session.
  }
}

function clearReviewDraft(tourTitle) {
  try {
    sessionStorage.removeItem(getReviewDraftKey(tourTitle));
  } catch {
    // Ignore storage failures.
  }
}

function getReviewSubmissionKeys(tourTitle, tourId) {
  return [
    tourId ? `${REVIEW_SUBMISSION_STORAGE_PREFIX}tour:${tourId}` : null,
    tourTitle ? `${REVIEW_SUBMISSION_STORAGE_PREFIX}title:${encodeURIComponent(tourTitle)}` : null,
  ].filter(Boolean);
}

function writeSubmittedReviewHandoff(tourTitle, tourId, review) {
  try {
    for (const key of getReviewSubmissionKeys(tourTitle, tourId)) {
      sessionStorage.setItem(key, JSON.stringify(review));
    }
  } catch {
    // Ignore storage failures; route state still carries the submitted review when available.
  }
}

function parseDraftDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getBookingIdFromStateBooking(booking) {
  if (!booking) return null;
  if (booking.id) return booking.id;
  if (Array.isArray(booking.bookings) && booking.bookings[0]?.id) return booking.bookings[0].id;
  return null;
}

function isHomeReturnPath(path) {
  return path === '/' || path.startsWith('/#') || path.startsWith('/?');
}

function titleFromSlug(slug) {
  if (!slug) return '';
  if (/\s/.test(slug)) return slug;
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function StarRating({ value, onChange, count = 5 }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          className="transition-transform hover:scale-110"
        >
          <svg
            className={`size-8 ${i < value ? 'text-emerald-600' : 'text-slate-200'}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}


function CompanionToggle({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-5 py-2 text-[14px] font-medium transition ${
        active
          ? 'border-slate-800 bg-slate-800 text-white'
          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
      }`}
    >
      {label}
    </button>
  );
}

// Month names for date display
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ReviewExperiencePage() {
  const { tourTitle: tourSlugParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const stateTour = location.state?.tour;
  const routeSlug = tourSlugParam ? decodeURIComponent(tourSlugParam) : '';
  const normalizedRouteSlug = routeSlug && /\s/.test(routeSlug) ? slugify(routeSlug) : routeSlug;
  const draftKey = stateTour?.slug || normalizedRouteSlug || stateTour?.title || 'unknown-tour';
  const savedDraft = useMemo(() => readReviewDraft(draftKey), [draftKey]);
  const decodedTitle =
    stateTour?.title ||
    savedDraft?.tour?.title ||
    titleFromSlug(routeSlug) ||
    'Cape Coast Castle, Elmina Castle & Kakum National Park Day Tour';
  const tourSlug = stateTour?.slug || savedDraft?.tour?.slug || normalizedRouteSlug || slugify(decodedTitle);
  const returnTo = location.state?.returnTo || savedDraft?.returnTo || `/tour/${tourSlug}#reviews`;
  const tour = useMemo(
    () =>
      stateTour ||
      savedDraft?.tour || {
        title: decodedTitle,
        rating: 4.8,
        reviews: 248,
        duration: '8h',
        price: 85,
        image:
          'https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&w=600&q=80',
        location: 'Accra, Ghana',
        slug: tourSlug,
        supplierName: 'Expedition-Go Tours Ltd',
        supplierLogo:
          'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=120&q=80',
      },
    [decodedTitle, savedDraft?.tour, stateTour, tourSlug],
  );
  const tourCardImages = [
    tour.image,
    ...(Array.isArray(tour.images) ? tour.images : []),
  ].filter(Boolean);
  const supplierName =
    tour.supplierName ||
    tour.operatorName ||
    tour.supplier?.name ||
    tour.supplier?.companyName ||
    'Expedition-Go Tours Ltd';
  const supplierLogo =
    tour.supplierLogo ||
    tour.supplier?.logo ||
    tour.supplier?.photoURL ||
    'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=120&q=80';

  const [overallRating, setOverallRating] = useState(savedDraft?.overallRating || 0);
  const [subRatings, setSubRatings] = useState({
    valueForMoney: savedDraft?.subRatings?.valueForMoney || 0,
    guide: savedDraft?.subRatings?.guide || 0,
    meeting: savedDraft?.subRatings?.meeting || 0,
  });
  const [selectedDate, setSelectedDate] = useState(() => parseDraftDate(savedDraft?.selectedDate));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [companions, setCompanions] = useState({
    business: Boolean(savedDraft?.companions?.business),
    couples: Boolean(savedDraft?.companions?.couples),
    family: Boolean(savedDraft?.companions?.family),
    friends: Boolean(savedDraft?.companions?.friends),
    solo: Boolean(savedDraft?.companions?.solo),
  });
  const [reviewText, setReviewText] = useState(savedDraft?.reviewText || '');
  const [reviewTitle, setReviewTitle] = useState(savedDraft?.reviewTitle || '');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [certified, setCertified] = useState(Boolean(savedDraft?.certified));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const tourId = stateTour?.tourId || stateTour?.id || savedDraft?.tourId || null;
  const initialBookingId = stateTour?.bookingId || getBookingIdFromStateBooking(location.state?.booking);
  const [resolvedBookingId, setResolvedBookingId] = useState(initialBookingId || savedDraft?.resolvedBookingId || null);
  const [bookingLookupChecked, setBookingLookupChecked] = useState(false);

  useEffect(() => {
    const hasDraftContent =
      overallRating ||
      subRatings.valueForMoney ||
      subRatings.guide ||
      subRatings.meeting ||
      selectedDate ||
      Object.values(companions).some(Boolean) ||
      reviewText.trim() ||
      reviewTitle.trim() ||
      certified;

    if (!hasDraftContent) return;

    writeReviewDraft(draftKey, {
      tour,
      tourId,
      resolvedBookingId,
      overallRating,
      subRatings,
      selectedDate: selectedDate ? selectedDate.toISOString() : null,
      companions,
      reviewText,
      reviewTitle,
      certified,
      returnTo,
    });
  }, [
    certified,
    companions,
    draftKey,
    decodedTitle,
    overallRating,
    resolvedBookingId,
    reviewText,
    reviewTitle,
    returnTo,
    selectedDate,
    subRatings,
    tour,
    tourId,
  ]);

  useEffect(() => {
    if (!tourId || !user) return;
    let cancelled = false;
    setBookingLookupChecked(false);
    getMyBookings({ tourId, status: 'COMPLETED', reviewed: 'false', limit: 1 })
      .then((data) => {
        if (!cancelled) {
          setResolvedBookingId(data?.bookings?.[0]?.id || null);
          setBookingLookupChecked(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResolvedBookingId(null);
          setBookingLookupChecked(true);
        }
      });
    return () => { cancelled = true; };
  }, [tourId, user]);

  const handleSubmitReview = async () => {
    if (!overallRating) {
      toast.error('Please select an overall rating');
      return;
    }
    if (!reviewText.trim() || reviewText.trim().length < 20) {
      toast.error('Please write at least 20 characters in your review');
      return;
    }
    if (!certified) {
      toast.error('Please certify that this review is based on your own experience');
      return;
    }
    if (!tourId) {
      toast.error('Tour information is missing. Please try again from the tour page.');
      return;
    }
    if (!user) {
      const authReturnTo = window.location.pathname + window.location.search + window.location.hash;
      writeReviewDraft(draftKey, {
        tour,
        tourId,
        resolvedBookingId,
        overallRating,
        subRatings,
        selectedDate: selectedDate ? selectedDate.toISOString() : null,
        companions,
        reviewText,
        reviewTitle,
        certified,
        returnTo,
      });
      setAuthReturnTo(authReturnTo);
      toast.info('Please log in to submit your review. Your draft has been saved.');
      navigate(`/signin?returnTo=${encodeURIComponent(authReturnTo)}`);
      return;
    }
    if (!bookingLookupChecked) {
      toast.info('Checking your eligible booking. Please try again in a moment.');
      return;
    }
    if (!resolvedBookingId) {
      toast.error('No completed unreviewed booking was found for this tour.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('rating', String(overallRating));
      fd.append('tourId', tourId);
      if (resolvedBookingId) fd.append('bookingId', resolvedBookingId);
      if (reviewTitle.trim()) fd.append('title', reviewTitle.trim());
      fd.append('comment', reviewText.trim());
      if (subRatings.valueForMoney) fd.append('valueForMoneyRating', String(subRatings.valueForMoney));
      if (subRatings.guide) fd.append('guideRating', String(subRatings.guide));
      if (subRatings.meeting) fd.append('meetingRating', String(subRatings.meeting));
      if (selectedDate) {
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const formattedDate = `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
        fd.append('travelMonth', formattedDate);
      }
      const selectedCompanions = Object.entries(companions)
        .filter(([, v]) => v)
        .map(([k]) => k);
      if (selectedCompanions.length) fd.append('companions', selectedCompanions.join(','));
      for (const photo of uploadedPhotos) {
        fd.append('photos', photo);
      }

      const result = await createReview(fd);
      const created = result?.review || result;
      const submittedReview = {
        id: created?.id || `submitted-${Date.now()}`,
        name: created?.customer?.name || user?.name || user?.email?.split('@')[0] || 'You',
        tag: created?.verified ? 'Verified' : 'Traveler',
        title: created?.title || reviewTitle.trim() || null,
        date: created?.createdAt
          ? new Date(created.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        rating: created?.rating || overallRating,
        text: created?.comment || reviewText.trim(),
        photos: created?.photos || [],
        supplierResponse: created?.supplierResponse || null,
        supplierResponseAt: created?.supplierResponseAt || null,
        valueForMoneyRating: created?.valueForMoneyRating || subRatings.valueForMoney || null,
        guideRating: created?.guideRating || subRatings.guide || null,
        meetingRating: created?.meetingRating || subRatings.meeting || null,
        travelMonth: created?.travelMonth || null,
        companions: created?.companions || selectedCompanions,
        tourId,
        tourTitle: decodedTitle,
      };

      writeSubmittedReviewHandoff(decodedTitle, tourId, submittedReview);
      clearReviewDraft(decodedTitle);
      clearReviewDraft(draftKey);
      toast.success('Review submitted successfully!');
      navigate(returnTo, {
        replace: true,
        state: {
          submittedReview,
          submittedReviewTourId: tourId,
          submittedReviewTourTitle: decodedTitle,
          ...(isHomeReturnPath(returnTo)
            ? {
                reviewReturnHomeSkeleton: true,
                handoffId: Date.now(),
              }
            : {}),
        },
      });
    } catch (err) {
      toast.error(err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    'Experience',
    'Admission fee',
    'Length of visit',
    'Atmosphere',
    'Crowd size',
    'Staff',
    'Best for',
  ];

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setUploadedPhotos((prev) => [...prev, ...files].slice(0, 10));
    setPhotoPreviews((prev) => [...prev, ...newPreviews].slice(0, 10));
  };

  const removePhoto = (index) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <div className="h-[var(--navbar-offset)] shrink-0" aria-hidden />

      <main className="flex-1">
        <div className="mx-auto max-w-[1280px] px-4 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-slate-600 transition hover:text-emerald-700"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{ overflow: 'visible' }}
        >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-12">

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
          {/* ========== LEFT COLUMN ========== */}
          <aside className="shrink-0 lg:w-[340px] lg:pr-10">
            {/* Page Heading */}
            <h1 className="mb-6 text-[28px] font-black leading-[1.1] tracking-tight text-slate-900 sm:text-[34px] lg:text-[42px]">
              Tell Us, How Was Your Trip
            </h1>
            <div className="review-sidebar space-y-6 lg:border-r lg:border-slate-200 lg:-mr-10 lg:pr-10">
              <PlaceCard
                images={tourCardImages}
                rating={tour.rating}
                title={tour.title}
                supplierName={supplierName}
                supplierLogo={supplierLogo}
                location={tour.location}
                duration={tour.duration}
              />

              {/* Change Activity Link */}
              <Link
                to="/tours"
                className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-slate-700 transition hover:text-emerald-700"
              >
                Not the right one? Change activity
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </aside>

          {/* ========== RIGHT COLUMN ========== */}
          <div className="min-w-0 flex-1 space-y-10 lg:pl-10">
            {/* Section: Overall Rating */}
            <section>
              <h2 className="mb-4 text-[17px] font-bold text-slate-900">
                How would you rate your experience?
              </h2>
              <StarRating
                value={overallRating}
                onChange={setOverallRating}
              />
            </section>

            {/* Section: Sub-ratings */}
            <section>
              <h2 className="mb-3 text-[17px] font-bold text-slate-900">
                How would you rate these?
              </h2>
              <div className="divide-y divide-slate-100">
                <div className="flex items-center justify-between py-2">
                  <span className="text-[15px] font-medium text-slate-800">Value for money</span>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSubRatings((p) => ({ ...p, valueForMoney: i + 1 }))}
                        className="transition-transform hover:scale-110"
                      >
                        <svg
                          className={`size-6 ${i < subRatings.valueForMoney ? 'text-emerald-600' : 'text-slate-200'}`}
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[15px] font-medium text-slate-800">Guide</span>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSubRatings((p) => ({ ...p, guide: i + 1 }))}
                        className="transition-transform hover:scale-110"
                      >
                        <svg
                          className={`size-6 ${i < subRatings.guide ? 'text-emerald-600' : 'text-slate-200'}`}
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[15px] font-medium text-slate-800">Meeting or pickup</span>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSubRatings((p) => ({ ...p, meeting: i + 1 }))}
                        className="transition-transform hover:scale-110"
                      >
                        <svg
                          className={`size-6 ${i < subRatings.meeting ? 'text-emerald-600' : 'text-slate-200'}`}
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Date */}
            <section>
              <h2 className="mb-3 text-[17px] font-bold text-slate-900">
                When did you go?
              </h2>
              <div className="relative w-full max-w-[320px] sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="review-date-input w-full cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white py-3 pl-4 pr-12 text-[15px] font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-emerald-600 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 sm:min-w-[260px] text-left"
                >
                  {selectedDate ? (
                    `${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
                  ) : (
                    <span className="text-slate-400">Select month and year</span>
                  )}
                </button>
                <Calendar className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-emerald-700" />
                
                {/* Apple Calendar Dropdown */}
                <AppleCalendarPicker
                  isOpen={isCalendarOpen}
                  onClose={() => setIsCalendarOpen(false)}
                  onDateSelect={(date) => setSelectedDate(date)}
                  initialDate={selectedDate}
                />
              </div>
            </section>

            {/* Section: Travel Companions */}
            <section>
              <h2 className="mb-3 text-[17px] font-bold text-slate-900">
                Who did you go with?
              </h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(companions).map(([key, active]) => (
                  <CompanionToggle
                    key={key}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    active={active}
                    onClick={() =>
                      setCompanions((prev) => ({ ...prev, [key]: !prev[key] }))
                    }
                  />
                ))}
              </div>
            </section>

            {/* Divider */}
            <hr className="border-slate-200" />

            {/* Section: Write your review */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-[17px] font-bold text-slate-900">
                  Write your review
                </h2>
                <button
                  type="button"
                  className="grid size-5 place-items-center rounded-full border border-slate-300 text-slate-400 transition hover:border-slate-400 hover:text-slate-600"
                  title="Your review helps other travellers make informed decisions."
                >
                  <Info className="size-3" />
                </button>
              </div>

              {/* Category Tabs */}
              <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="text-[13px] font-medium text-slate-600"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              {/* Review Textarea */}
              <div className="relative">
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience..."
                  rows={6}
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white p-4 text-[15px] leading-relaxed text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <div className="mt-2 flex items-center justify-end">
                  <span className="text-[12px] text-slate-400">
                    {reviewText.length}/25 min
                  </span>
                </div>
              </div>
            </section>

            {/* Section: Title Your Review */}
            <section>
              <h2 className="mb-2 text-[17px] font-bold text-slate-900">
                Title your review
              </h2>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Give us the gist of your experience"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[15px] text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </section>

            {/* Section: Add Photos */}
            <section>
              <h2 className="mb-1 text-[17px] font-bold text-slate-900">
                Add some photos
              </h2>
              <p className="mb-4 text-[13px] text-slate-500">Optional</p>

              <div className="mb-4 flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-200 text-slate-500">
                  <Camera className="size-5" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-slate-800">
                    Reach a Photos milestone
                  </p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-slate-600">
                    Upload your first photo to start your journey as a top contributor.
                  </p>
                </div>
              </div>

              {/* Photo Upload Area */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-10 transition hover:border-slate-400 hover:bg-slate-100"
              >
                <div className="flex flex-col items-center gap-2">
                  <Image className="size-8 text-slate-400" />
                  <span className="text-[14px] font-semibold text-slate-700">
                    Click to add photos
                  </span>
                  <span className="text-[12px] text-slate-400">
                    or drag and drop
                  </span>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {/* Uploaded Photos Preview */}
              {uploadedPhotos.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {photoPreviews.map((url, i) => (
                    <div key={i} className="relative">
                      <img
                        src={url}
                        alt={`Upload ${i + 1}`}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-slate-800 text-[10px] text-white transition hover:bg-slate-900"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Section: Certification Checkbox */}
            <section>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={certified}
                  onChange={(e) => setCertified(e.target.checked)}
                  className="mt-0.5 size-5 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-[13px] leading-relaxed text-slate-600">
                  I certify that this review is based on my own experience and is my
                  genuine opinion of this tour experience. I understand that TravioAfrica
                  has a zero-tolerance policy on fake reviews and that my review may be
                  removed if found to violate these terms.
                </span>
              </label>
            </section>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={isSubmitting || !overallRating || !certified}
              className="w-full rounded-xl bg-emerald-700 py-3.5 text-[16px] font-bold text-white transition hover:bg-emerald-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit review'}
            </button>
          </div>
        </div>
      </div>
        </motion.div>
      </main>
    </div>
  );
}
