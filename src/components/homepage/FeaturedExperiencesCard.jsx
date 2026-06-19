/**
 * @file FeaturedExperiencesCard.jsx
 * @description Reusable tour listing card. Used in carousels and AllToursPage grid.
 *   Links to /tour/:title. Supports wishlist toggle and swipe-to-reveal on mobile.
 *
 *   Layout follows bootstrap Card pattern:
 *   Card.Img (top) → Card.Body { Card.Title → Card.Subtitle → Card.Text → CTA }
 */
import { Heart, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigationLoader } from '@/contexts/NavigationContext';

export function FeaturedExperiencesCard({
  title,
  slug,
  duration,
  price,
  rating,
  reviews,
  image,
  location,
  discount,
  _disableTracking = false,
  variant = 'default',
  badge = 'duration',
}) {
  const { t } = useTranslation();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { convertPrice } = useCurrency();
  const { navigateWithLoader } = useNavigationLoader();
  const isFavorited = isInWishlist(title);
  /** Tracks this pointer gesture so carousel horizontal scroll does not cancel every tap. */
  const panRef = useRef({
    active: false,
    originX: 0,
    originY: 0,
    maxAbsDx: 0,
    maxAbsDy: 0,
  });
  /** Set in pointerup/cancel before click; true = user was panning the carousel, not tapping. */
  const lastGestureWasPanRef = useRef(false);

  // Convert price
  const convertedPrice = convertPrice(price);

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({ title, duration, price, rating, reviews, image, discount });
  };

  const resetPanTracking = () => {
    panRef.current = {
      active: false,
      originX: 0,
      originY: 0,
      maxAbsDx: 0,
      maxAbsDy: 0,
    };
  };

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    panRef.current = {
      active: true,
      originX: e.clientX,
      originY: e.clientY,
      maxAbsDx: 0,
      maxAbsDy: 0,
    };
    lastGestureWasPanRef.current = false;
  };

  const handlePointerMove = (e) => {
    if (!panRef.current.active) return;

    const dx = Math.abs(e.clientX - panRef.current.originX);
    const dy = Math.abs(e.clientY - panRef.current.originY);
    panRef.current.maxAbsDx = Math.max(panRef.current.maxAbsDx, dx);
    panRef.current.maxAbsDy = Math.max(panRef.current.maxAbsDy, dy);
  };

  const endPointerGesture = () => {
    if (!panRef.current.active) return;
    const { maxAbsDx, maxAbsDy } = panRef.current;
    resetPanTracking();
    // Only treat as "carousel pan" if movement clearly dominated horizontal (not finger jitter).
    const PAN_MIN_PX = 20;
    const HORIZONTAL_DOMINANCE = 1.35;
    lastGestureWasPanRef.current =
      maxAbsDx >= PAN_MIN_PX && maxAbsDx > maxAbsDy * HORIZONTAL_DOMINANCE;
  };

  const handleDetailLinkClick = (e) => {
    if (lastGestureWasPanRef.current) {
      e.preventDefault();
      lastGestureWasPanRef.current = false;
      return;
    }
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigateWithLoader(detailTo);
  };

  const detailTo = slug ? `/tour/${slug}` : `/tour/${encodeURIComponent(title)}`;

  const imageHeightClass =
    variant === 'allTours'
      ? 'h-36 sm:h-[10.25rem] xl:h-[11.1rem]'
      : 'h-36 sm:h-40 xl:h-44';

  const bodyPaddingClass =
    variant === 'allTours' ? 'p-3 sm:p-[0.85rem]' : 'p-3 pb-4 sm:p-4 sm:pb-5 xl:p-4 xl:pb-5';

  return (
    <Card
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointerGesture}
      onPointerCancel={endPointerGesture}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/50 bg-white font-card shadow-sm transition-shadow duration-300 hover:shadow-md contain-none touch-manipulation"
    >
      {/* ---- Card.Img (top) ---- */}
      <div className={`relative z-0 shrink-0 ${imageHeightClass} overflow-hidden bg-slate-100`}>
        <img
          src={image}
          alt=""
          aria-hidden={true}
          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
          style={{ minHeight: '100%' }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" />
        {badge === 'new' ? (
          <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-white/95 px-2 py-1 text-[11px] font-bold text-slate-900 shadow-sm backdrop-blur-sm xl:text-[10px]">
            {t('sections.newBadge')}
          </span>
        ) : (
          <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-slate-900/75 px-2 py-1 text-[11px] font-bold text-white shadow-sm xl:text-[10px]">
            {duration}
          </span>
        )}
        {discount && (
          <span className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-red-500 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
            {discount}
          </span>
        )}
      </div>

      {/* ---- Card.Body ---- */}
      <CardContent className={`relative z-0 flex flex-1 flex-col gap-2 ${bodyPaddingClass}`}>
        {/* Card.Subtitle — Location (muted, above title) */}
        <div className="flex items-center gap-1 min-h-[20px]">
          {location ? (
            <>
              <MapPin className="size-3 shrink-0 text-slate-400" />
              <span className="truncate text-[13px] font-bold text-slate-500 sm:text-[15px] xl:text-[14px]">
                {location}
              </span>
            </>
          ) : null}
        </div>

        {/* Card.Title */}
        <h5
          className="line-clamp-3 min-h-[4em] text-[18px] leading-[24px] tracking-normal font-bold text-slate-900"
        >
          {title}
        </h5>

        {/* Card.Text — Features */}
        <div
          className="flex items-center gap-1"
          style={{
            fontSize:
              variant === 'allTours'
                ? 'clamp(0.75rem, 0.6vw + 0.4rem, 0.8125rem)'
                : 'clamp(0.6875rem, 0.5vw + 0.4rem, 0.75rem)',
          }}
        >
          <span className="font-semibold text-slate-700">{t('features.freeCancellation')}</span>
          <span className="font-semibold text-slate-700">•</span>
          <span className="font-semibold text-slate-700">{t('tourDetail.pickupIncluded')}</span>
        </div>

        {/* Rating (left) + Price (right) — inline bottom row */}
        <div
          className={
            variant === 'allTours'
              ? 'mt-auto flex items-end justify-between gap-3'
              : 'mt-auto flex items-end justify-between gap-3'
          }
        >
          <div
            className={
              variant === 'allTours'
                ? 'flex items-center gap-1 text-[13px] text-[#39AD6C] xl:text-[12px]'
                : 'flex items-center gap-1 text-[13px] text-[#39AD6C] xl:text-[12px]'
            }
          >
            <Star className="size-4 fill-current" />
            <span
              className={
                variant === 'allTours'
                  ? 'text-[15px] font-bold text-slate-900 xl:text-[14px]'
                  : 'text-[15px] font-bold text-slate-900 xl:text-[14px]'
              }
            >
              {rating}
            </span>
            <span
              className={
                variant === 'allTours'
                  ? 'text-[13px] text-slate-500 xl:text-[12px]'
                  : 'text-[13px] text-slate-500 xl:text-[12px]'
              }
            >
              ({reviews})
            </span>
          </div>
          <p
            className={
              variant === 'allTours'
                ? 'text-[13px] font-bold text-slate-500 xl:text-[12px]'
                : 'text-[13px] font-bold text-slate-500 xl:text-[12px]'
            }
          >
            {t('common.from')}{' '}
            <span
              className="text-[20px] leading-[24px] tracking-normal text-slate-900"
            >
              {convertedPrice.formatted}
            </span>
          </p>
        </div>
      </CardContent>

      {/* ---- Whole-card clickable overlay ---- */}
      <Link
        to={detailTo}
        onClick={handleDetailLinkClick}
        aria-label={`${t('common.viewDetails', { defaultValue: 'View details' })}: ${title}`}
        className="absolute inset-0 z-[5] rounded-xl outline-none ring-inset xl:focus-visible:ring-2 xl:focus-visible:ring-slate-400"
      />

      {/* ---- Wishlist heart ---- */}
      <button
        type="button"
        onClick={handleHeartClick}
        className="absolute right-2 top-2 z-[10] grid size-7 place-items-center rounded-full bg-white/88 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white hover:scale-110"
      >
        <Heart
          className={`size-3.5 transition-colors ${
            isFavorited ? 'fill-[color:var(--brand-green)] text-[color:var(--brand-green)]' : ''
          }`}
        />
      </button>
    </Card>
  );
}
