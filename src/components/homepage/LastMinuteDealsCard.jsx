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
      className="group relative h-full contain-none touch-manipulation overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition duration-300 hover:shadow-md"
    >
      <div className="relative z-0 h-40 xl:h-44 overflow-hidden">
        <img
          src={image}
          alt=""
          aria-hidden={true}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-red-500 px-2 py-1 text-[11px] font-bold text-white xl:text-[10px]">
          {discount}
        </span>
      </div>
      <CardContent className="relative z-0 p-4 xl:p-3.5">
        <p className="line-clamp-2 text-[15px] font-bold leading-tight text-slate-900 xl:text-[14px]">
          {title}
        </p>

        {location && (
          <div className="mt-1 flex items-center gap-1 text-black">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate text-[16px] font-semibold">{location}</span>
          </div>
        )}

        {rating && (
          <div className="mt-1.5 flex items-center gap-1 text-[#39AD6C]">
            <Star className="size-3 fill-current" />
            <span className="text-[11px] font-bold text-slate-900">{rating}</span>
            <span className="text-[10px] text-slate-500">({reviews})</span>
          </div>
        )}

        {/* Price and Timer Row */}
        <div className="mt-3 flex items-end justify-between gap-2">
          {/* Timer Badge */}
          <div className="deal-timer-glow shrink-0">
            <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-50 to-red-50 px-2 py-0.5 border border-orange-200/50">
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

          {/* Price Section */}
          <div className="flex flex-col gap-0.5 flex-1 min-w-0 items-end">
            <span className="text-[9px] font-medium text-slate-500">
              {t('common.from')}
            </span>
            <div className="flex items-baseline gap-1 flex-wrap justify-end">
              <span className="text-[8px] text-slate-400 line-through decoration-slate-300">
                {convertedOldPrice.formatted}
              </span>
              <span
                className="font-bold text-black"
                style={{ fontSize: 'clamp(0.75rem, 0.7vw + 0.3rem, 0.875rem)' }}
              >
                {convertedPrice.formatted}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <Link
        to={detailTo}
        onClick={handleDetailLinkClick}
        aria-label={`${t('common.viewDetails', { defaultValue: 'View details' })}: ${title}`}
        className="absolute inset-0 z-[5] rounded-[14px] outline-none ring-inset xl:focus-visible:ring-2 xl:focus-visible:ring-slate-400"
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
