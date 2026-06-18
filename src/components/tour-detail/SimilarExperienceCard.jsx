/**
 * @file SimilarExperienceCard.jsx
 * @description Card component for the Similar Experiences carousel on TourDetailPage.
 */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Star } from 'lucide-react';

import { useWishlist } from '@/contexts/WishlistContext';
import { useCurrency } from '@/contexts/CurrencyContext';

export function parseReviewsDisplay(value) {
  if (value == null) return '0';
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  const s = String(value).replace(/,/g, '').trim();
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? String(n) : String(value);
}

export function SimilarExperienceCard({ tour, index, onImageError }) {
  const { t } = useTranslation();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { convertPrice } = useCurrency();
  const detailTo = tour.slug ? `/tour/${tour.slug}` : `/tour/${encodeURIComponent(tour.title)}`;
  const converted = convertPrice(tour.price);
  const reviewsDisplay = parseReviewsDisplay(tour.reviews);
  const isFav = isInWishlist(tour.title);

  return (
    <article className="w-[260px] shrink-0 sm:w-[280px]">
        <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/50 bg-white font-card shadow-[0_1px_4px_rgba(15,23,42,0.08)] transition hover:shadow-md">
        <div className="relative">
          <Link
            to={detailTo}
            className="block overflow-hidden rounded-t-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand-green)]"
          >
            <div className="relative aspect-[4/3] bg-slate-100">
              <img
                src={tour.image}
                alt=""
                className="h-full w-full object-cover pointer-events-none"
                data-fallback-offset={index}
                onError={onImageError}
              />
              <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-slate-700/95 px-2 py-1 text-[11px] font-bold text-white shadow-sm sm:text-[10px]">
                {tour.duration}
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() =>
              toggleWishlist({
                title: tour.title,
                slug: tour.slug,
                duration: tour.duration,
                price: tour.price,
                rating: tour.rating,
                reviews: tour.reviews,
                image: tour.image,
              })
            }
            className="absolute right-2 top-2 z-10 grid size-9 place-items-center rounded-full border border-slate-200/90 bg-white text-slate-700 shadow-sm transition hover:scale-105"
            aria-label={t('nav.wishlist')}
          >
            <Heart
              className={`size-4 ${isFav ? 'fill-[color:var(--brand-green)] text-[color:var(--brand-green)]' : 'fill-none'}`}
              strokeWidth={2}
            />
          </button>
        </div>

        <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5 sm:px-3.5 sm:pb-3.5 sm:pt-3">
          <Link
            to={detailTo}
            className="line-clamp-2 min-h-[2.5rem] text-[18px] leading-[24px] tracking-normal font-bold text-slate-900 hover:underline"
          >
            {tour.title}
          </Link>

          <p className="mt-1.5 text-[12px] font-semibold leading-snug text-slate-500 sm:text-[11px]">
            {t('features.freeCancellation')}
            <span className="mx-1 text-slate-400" aria-hidden>
              •
            </span>
            {t('tourDetail.pickupIncluded')}
          </p>

          <div className="mt-auto flex items-end justify-between gap-2 pt-3">
            <div className="flex min-w-0 items-center gap-1">
              <Star
                className="size-4 shrink-0 fill-[#39AD6C] text-[#39AD6C]"
                strokeWidth={1.5}
                aria-hidden
              />
              <span className="text-[13px] font-bold tabular-nums text-slate-900 sm:text-[12px]">
                {tour.rating}
              </span>
              <span className="text-[12px] font-semibold text-slate-500 sm:text-[11px]">({reviewsDisplay})</span>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[11px] font-semibold leading-none text-slate-500">
                {t('common.from')}
              </p>
              <p className="mt-0.5 text-[20px] leading-[24px] tracking-normal font-bold text-slate-900">
                {converted.formatted}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
