/**
 * @file NewExperiencesCard.jsx
 * @description Smaller tour card for sidebar and dense layouts. Same data shape as FeaturedExperiencesCard.
 *   Links to /tour/:title with wishlist and currency support.
 */
import { Heart, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRef } from "react";

import { useWishlist } from "@/contexts/WishlistContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useNavigationLoader } from "@/contexts/NavigationContext";

/**
 * Compact Tour Card - Vertical layout for sidebar sections
 * @param {"duration" | "new"} badge - Top-left badge: tour duration or localized "New"
 */
export function NewExperiencesCard({
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
  badge = "duration",
}) {
  const { t } = useTranslation();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { convertPrice } = useCurrency();
  const { navigateWithLoader } = useNavigationLoader();
  const isFavorited = isInWishlist(title);

  const convertedPrice = convertPrice(price);

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

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({ title, duration, price, rating, reviews, image, discount });
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
    <div 
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointerGesture}
      onPointerCancel={endPointerGesture}
      className="group relative h-full contain-none touch-manipulation overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition duration-300 hover:shadow-md"
    >
      {/* Vertical Image */}
      <div className="relative z-0 h-40 xl:h-44 overflow-hidden bg-slate-100">
        <img 
          src={image} 
          alt=""
          aria-hidden={true}
          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105" 
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        {badge === "new" ? (
          <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-bold text-slate-900 shadow-sm backdrop-blur-sm">
            {t("sections.newBadge")}
          </span>
        ) : (
          <span className="pointer-events-none absolute left-2 top-2 rounded bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-slate-900 shadow-sm backdrop-blur-sm">
            {duration}
          </span>
        )}
      </div>

      {/* Vertical Content */}
      <div className="relative z-0 p-2.5">
        {/* Title - 2 lines max, matching FeaturedExperiencesCard font size */}
        <h3 
          className="line-clamp-2 font-bold leading-tight tracking-tight text-slate-900 min-h-[2.4em]"
          style={{ fontSize: 'clamp(0.875rem, 0.7vw + 0.5rem, 0.9375rem)' }}
        >
          {title}
        </h3>
        
        {location && (
          <div className="mt-1 flex items-center gap-1 text-slate-500">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate text-[11px]">{location}</span>
          </div>
        )}

        {/* Rating & Price Row */}
        <div className="mt-2 flex items-center justify-between gap-2">
          {/* Rating */}
          <div className="flex items-center gap-0.5 text-amber-500">
            <Star className="size-3 fill-current" />
            <span className="text-[12px] font-semibold text-slate-900">{rating}</span>
            <span className="text-[11px] text-slate-500">({reviews})</span>
          </div>
          
          {/* Price */}
          <div className="text-right">
            <p className="text-[11px] text-slate-500 leading-none">
              {t('common.from')}
            </p>
            <p className="text-[14px] font-bold text-slate-900 leading-tight">
              {convertedPrice.formatted}
            </p>
          </div>
        </div>
      </div>
      <Link
        to={detailTo}
        onClick={handleDetailLinkClick}
        aria-label={`${t("common.viewDetails", { defaultValue: "View details" })}: ${title}`}
        className="absolute inset-0 z-[5] rounded-lg outline-none ring-inset xl:focus-visible:ring-2 xl:focus-visible:ring-slate-400"
      />
      <button 
        type="button"
        onClick={handleHeartClick}
        className="absolute right-2 top-2 z-[10] grid size-6 place-items-center rounded-full bg-white/95 text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-white hover:scale-110"
      >
        <Heart 
          className={`size-3 transition-colors ${
            isFavorited ? 'fill-[color:var(--brand-green)] text-[color:var(--brand-green)]' : ''
          }`} 
        />
      </button>
    </div>
  );
}
