/**
 * @file LastMinuteDealsCard.jsx
 * @description Deal/discount card for homepage sidebar last-minute offers section.
 */
import { Heart, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigationLoader } from '@/contexts/NavigationContext';

export function LastMinuteDealsCard({
  title,
  slug,
  oldPrice,
  price,
  discount,
  countdown,
  image,
  location,
  rating,
  reviews,
}) {
  const { t } = useTranslation();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { convertPrice } = useCurrency();
  const { navigateWithLoader } = useNavigationLoader();
  const isFavorited = isInWishlist(title);

  const panRef = useRef({
    active: false,
    originX: 0,
    originY: 0,
    maxAbsDx: 0,
    maxAbsDy: 0,
  });
  const lastGestureWasPanRef = useRef(false);

  const resetPanTracking = () => {
    panRef.current = {
      active: false,
      originX: 0,
      originY: 0,
      maxAbsDx: 0,
      maxAbsDy: 0,
    };
  };

  // Convert prices
  const convertedOldPrice = convertPrice(oldPrice);
  const convertedPrice = convertPrice(price);

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      title,
      price,
      image,
      duration: countdown,
      rating: '4.8',
      reviews: '120',
    });
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

  return (
    <Card
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointerGesture}
      onPointerCancel={endPointerGesture}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/50 bg-white font-card shadow-sm transition-shadow duration-300 hover:shadow-md contain-none touch-manipulation"
    >
      <div className="relative z-0 h-32 sm:h-40 xl:h-44 shrink-0 overflow-hidden bg-slate-100">
        <img
          src={image}
          alt=""
          aria-hidden={true}
          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
          style={{ minHeight: '100%' }}
        />
        <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-red-500 px-2 py-1 text-[11px] font-bold text-white xl:text-[10px]">
          {discount}
        </span>
      </div>
      <CardContent className="relative z-0 flex flex-1 flex-col gap-2 p-4 pb-6 min-h-[190px] sm:p-4 sm:pb-5 xl:p-4 xl:pb-5">
        {/* Location + Timer inline row */}
        <div className="flex items-center justify-between gap-2">
          {location ? (
            <div className="flex items-center gap-1 min-w-0">
              <MapPin className="size-3 shrink-0 text-slate-400" />
              <span className="truncate text-[13px] font-bold text-slate-500 sm:text-[15px] xl:text-[14px]">{location}</span>
            </div>
          ) : (
            <div />
          )}
          <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-orange-50 to-red-50 px-2 py-0.5 border border-orange-200/50">
            <svg
              className="size-2.5 text-orange-500 animate-pulse"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-[9px] font-bold text-orange-600 whitespace-nowrap">
              {countdown}
            </span>
          </div>
        </div>

        <p className="line-clamp-3 min-h-[4em] text-[18px] leading-[24px] tracking-normal font-bold text-slate-900">
          {title}
        </p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Rating (left) + Price (right) — bottom row, matching FeaturedExperiencesCard */}
        <div className="flex items-end justify-between gap-3">
          <div className="flex items-center gap-1 text-[13px] text-[#39AD6C] xl:text-[12px]">
            <Star className="size-4 fill-current" />
            <span className="text-[15px] font-bold text-slate-900 xl:text-[14px]">{rating}</span>
            <span className="text-[13px] text-slate-500 xl:text-[12px]">({reviews})</span>
          </div>
          <div className="text-right">
            <p className="text-[13px] font-bold text-slate-500 xl:text-[12px]">
              {t('common.from')}{' '}
              <span className="text-[12px] text-slate-400 line-through xl:text-[11px]">
                {convertedOldPrice.formatted}
              </span>{' '}
              <span className="text-[20px] leading-[24px] tracking-normal font-bold text-red-600 xl:text-[18px]">
                {convertedPrice.formatted}
              </span>
            </p>
          </div>
        </div>
      </CardContent>
      <Link
        to={detailTo}
        onClick={handleDetailLinkClick}
        aria-label={`${t('common.viewDetails', { defaultValue: 'View details' })}: ${title}`}
        className="absolute inset-0 z-[5] rounded-xl outline-none ring-inset xl:focus-visible:ring-2 xl:focus-visible:ring-slate-400"
      />
      <button
        type="button"
        onClick={handleHeartClick}
        className="absolute right-2 top-2 z-[10] grid size-6 place-items-center rounded-full bg-white/88 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white hover:scale-110"
      >
        <Heart
          className={`size-3 transition-colors ${
            isFavorited ? 'fill-[color:var(--brand-green)] text-[color:var(--brand-green)]' : ''
          }`}
        />
      </button>
    </Card>
  );
}
