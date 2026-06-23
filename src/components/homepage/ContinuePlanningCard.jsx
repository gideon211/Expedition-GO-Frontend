import { Star, StarHalf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';

import { useCurrency } from '@/contexts/CurrencyContext';
import { slugify } from '@/lib/slugify';
import { useNavigationLoader } from '@/contexts/NavigationContext';

export function ContinuePlanningCard({
  title,
  slug,
  duration,
  price,
  rating,
  reviews,
  image,
  location,
}) {
  const { t } = useTranslation();
  const { convertPrice } = useCurrency();
  const { navigateWithLoader } = useNavigationLoader();

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
    panRef.current = { active: false, originX: 0, originY: 0, maxAbsDx: 0, maxAbsDy: 0 };
  };

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    panRef.current = { active: true, originX: e.clientX, originY: e.clientY, maxAbsDx: 0, maxAbsDy: 0 };
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

  const detailTo = `/tour/${slug || slugify(title)}`;

  const numRating = Number(rating) || 0;
  const fullStars = Math.floor(numRating);
  const hasHalf = numRating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  const starElements = [];
  for (let i = 0; i < fullStars; i++) {
    starElements.push(<Star key={`f-${i}`} className="size-3.5 fill-[#39AD6C] text-[#39AD6C]" />);
  }
  if (hasHalf) {
    starElements.push(<StarHalf key="h" className="size-3.5 fill-[#39AD6C] text-[#39AD6C]" />);
  }
  for (let i = 0; i < emptyStars; i++) {
    starElements.push(<Star key={`e-${i}`} className="size-3.5 text-[#D1D5DB]" />);
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointerGesture}
      onPointerCancel={endPointerGesture}
      className="group relative touch-manipulation overflow-hidden rounded-xl border border-slate-200 bg-white font-card shadow-sm transition duration-200 h-[400px] md:h-auto"
    >
      {/* Mobile: vertical layout */}
      <div className="flex flex-col md:hidden h-full">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <img
            src={image || undefined}
            alt=""
            aria-hidden={true}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col justify-between p-4">
          <h3 className="text-[15px] font-bold leading-snug text-[#111827] line-clamp-2">
            {title}
          </h3>
          <div className="flex flex-col gap-2">
            <p className="text-[12px] text-[#6B7280]">
              {duration}{' '}&bull;{' '}{t('features.freeCancellation')}
            </p>
            <div className="flex items-center gap-1">
              {starElements}
              <span className="ml-1 text-[12px] font-bold text-[#1F2937]">{rating}</span>
              <span className="text-[11px] text-[#6B7280]">({reviews})</span>
            </div>
            <p className="text-[18px] font-bold text-[#111827]">
              <span className="text-[12px] font-normal text-[#6B7280]">{t('common.from')} </span>
              {convertedPrice.formatted}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop: horizontal layout — getyourguide style */}
      <div className="hidden md:flex md:flex-row h-[145px]">
        <div className="relative w-[145px] shrink-0 h-[145px] p-3">
          <img
            src={image || undefined}
            alt=""
            aria-hidden={true}
            className="h-full w-full rounded-lg object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between py-3 pr-4">
          <h3 className="text-[15px] font-bold leading-snug text-[#111827] line-clamp-2">
            {title}
          </h3>
          <p className="text-[13px] text-[#6B7280]">
            {duration}{' '}&bull;{' '}{t('features.freeCancellation')}
          </p>
          <div className="flex items-center gap-0.5">
            {starElements}
            <span className="ml-1.5 text-[13px] font-bold text-[#1F2937]">{rating}</span>
            <span className="text-[12px] text-[#6B7280]">({reviews})</span>
          </div>
          <p className="text-[18px] font-bold text-[#111827]">
            <span className="text-[13px] font-normal text-[#6B7280]">{t('common.from')} </span>
            {convertedPrice.formatted}
          </p>
        </div>
      </div>

      <Link
        to={detailTo}
        onClick={handleDetailLinkClick}
        aria-label={`${t('common.viewDetails', { defaultValue: 'View details' })}: ${title}`}
        className="absolute inset-0 z-[5] rounded-xl outline-none ring-inset xl:focus-visible:ring-2 xl:focus-visible:ring-slate-400"
      />
    </div>
  );
}
