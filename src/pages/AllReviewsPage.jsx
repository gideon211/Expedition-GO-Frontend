import { useRef, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from '@/components/homepage/Navbar';
import { NewExperiencesCard } from '@/components/homepage/NewExperiencesCard';
import { peopleReviews } from '@/components/homepage/ReviewsCarousel';
import { sidebarTopRated, lastMinuteDeals } from '@/components/homepage/data';

const REVIEWS_PER_PAGE = 6;

export default function AllReviewsPage() {
  const similarScrollRef = useRef(null);
  const [activeReview, setActiveReview] = useState(null);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(peopleReviews.length / REVIEWS_PER_PAGE);
  const pagedReviews = useMemo(
    () => peopleReviews.slice(page * REVIEWS_PER_PAGE, (page + 1) * REVIEWS_PER_PAGE),
    [page],
  );

  const scroll = (ref, direction) => {
    const el = ref.current;
    if (!el) return;
    const amount = 300;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const similarTours = [...lastMinuteDeals.slice(0, 4), ...sidebarTopRated.slice(0, 4)];

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <div className="h-[var(--navbar-offset)] shrink-0" aria-hidden />

      <main className="flex-1">
        <div className="mx-auto max-w-[1520px] px-4 pt-8 sm:px-6 lg:px-8 lg:pt-12">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem('eg_splash_shown');
              window.location.href = '/';
            }}
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
        >
        <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8 pb-12">

          {/* Page Title */}
          <h1 className="mb-8 text-[28px] font-extrabold leading-tight text-slate-900 sm:text-[34px] lg:text-[38px]">
            Reviews
          </h1>

          {/* All Reviews Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {pagedReviews.map((review, idx) => (
                  <article
                    key={`${review.title}-${page}-${idx}`}
                    className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                <div className="mb-3 flex items-start gap-3">
                  <img
                    src={review.image}
                    alt={review.title}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    loading="lazy"
                  />
                  <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-slate-900">
                    {review.title}
                  </h3>
                </div>
                <p className="mb-1 text-lg text-emerald-500">★★★★★</p>
                <p className="mb-3 text-xs text-slate-500">{review.author}</p>
                <p className="mb-1 text-sm font-semibold text-slate-800">{review.headline}</p>
                <p className="mb-3 flex-1 text-sm leading-relaxed text-slate-600">{review.body}</p>
                <button
                  type="button"
                  onClick={() => setActiveReview(review)}
                  className="self-start text-sm font-semibold text-slate-900 underline transition hover:text-emerald-700"
                >
                  Read more
                </button>
              </article>
            ))}
          </div>
            </motion.div>
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mb-16 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
                className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePageChange(i)}
                  className={`grid size-9 place-items-center rounded-full text-sm font-semibold transition ${
                    i === page
                      ? 'bg-emerald-700 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1}
                className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}

          {/* Similar Experiences Section */}
          <section className="py-4 md:py-4 xl:py-5">
            <div className="section-header-row relative z-30 isolate mb-[0.6375rem] flex items-start justify-between gap-4 md:mb-2.5 xl:mb-3">
              <div className="min-w-0 flex-1">
                <h2
                  className="truncate font-bold tracking-tight text-slate-900 leading-[1.15]"
                  style={{ fontSize: 'clamp(1.2rem, 1.2vw + 0.5rem, 1.375rem)' }}
                  title="Similar Experiences"
                >
                  Similar Experiences
                </h2>
              </div>
              <div className="section-header-actions">
                <div className="section-header-scroll-arrows">
                  <button
                    onClick={() => scroll(similarScrollRef, 'left')}
                    className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    onClick={() => scroll(similarScrollRef, 'right')}
                    className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
            <div
              ref={similarScrollRef}
              className="flex gap-3 overflow-x-auto xl:overflow-x-hidden overflow-y-hidden overscroll-x-contain scrollbar-hide pb-1"
            >
              {similarTours.map((tour, index) => (
                <div
                  key={`${tour.title}-${index}`}
                  className="w-[280px] shrink-0"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <NewExperiencesCard {...tour} />
                </div>
              ))}
            </div>
          </section>
        </div>
        </motion.div>
      </main>

      {/* Read More Modal */}
      {activeReview && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
          onClick={() => setActiveReview(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveReview(null)}
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="size-4" />
            </button>

            <div className="mb-4 flex items-start gap-3 pr-8">
              <img
                src={activeReview.image}
                alt={activeReview.title}
                className="h-12 w-12 shrink-0 rounded-lg object-cover"
              />
              <div>
                <h3 className="text-sm font-semibold leading-tight text-slate-900">
                  {activeReview.title}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">{activeReview.author}</p>
              </div>
            </div>

            <p className="mb-3 text-lg text-emerald-500">★★★★★</p>
            <h4 className="mb-2 text-sm font-semibold text-slate-800">{activeReview.headline}</h4>
            <p className="text-sm leading-relaxed text-slate-700">{activeReview.fullText}</p>
          </div>
        </div>
      )}
    </div>
  );
}
