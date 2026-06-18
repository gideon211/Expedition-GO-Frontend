import { Star, CircleCheck, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';

import { useCurrency } from '@/contexts/CurrencyContext';
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

  const detailTo = slug ? `/tour/${slug}` : `/tour/${encodeURIComponent(title)}`;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointerGesture}
      onPointerCancel={endPointerGesture}
      className="group relative touch-manipulation overflow-hidden rounded-xl border border-slate-200 bg-white font-card shadow-md transition duration-200 hover:shadow-lg h-[400px] md:h-full"
    >
      {/* Mobile: vertical layout (image top, content below) */}
      <div className="flex flex-col md:hidden h-full">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <img
            src={image}
            alt=""
            aria-hidden={true}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <h3 className="text-[14px] font-bold leading-snug text-slate-900">
            {title}
          </h3>
          <div className="mt-auto flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <CircleCheck className="size-3.5 text-emerald-500" />
                <span className="text-[11px] font-semibold text-slate-600">
                  {t('features.freeCancellation')}
                </span>
              </div>
              <p className="text-[12px] text-slate-500">{duration}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-[#39AD6C] text-[#39AD6C]" />
                <span className="text-[13px] font-bold text-slate-900">{rating}</span>
                <span className="text-[11px] text-slate-500">({reviews})</span>
              </div>
              <div className="text-right">
                <p className="text-[20px] leading-[24px] tracking-normal font-bold text-slate-900">
                  <span className="text-[10px] font-normal text-slate-500">{t('common.from')} </span>
                  {convertedPrice.formatted}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: horizontal layout (image left, content right) — getyourguide style */}
      <div className="hidden md:flex md:min-h-[172px] md:flex-row h-full">
        <div className="relative w-[130px] shrink-0 overflow-hidden bg-slate-100">
          <img
            src={image}
            alt=""
            aria-hidden={true}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
          <div className="min-w-0">
            <h3 className="text-[14px] font-bold leading-snug text-slate-900">
              {title}
            </h3>
            {location && (
              <div className="mt-1 flex items-center gap-1">
                <MapPin className="size-3 shrink-0 text-slate-400" />
                <span className="truncate text-[13px] font-bold text-slate-500">{location}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <CircleCheck className="size-3.5 text-emerald-500" />
                <span className="text-[11px] font-semibold text-slate-600">
                  {t('features.freeCancellation')}
                </span>
              </div>
              <p className="text-[12px] text-slate-500">{duration}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-[#39AD6C] text-[#39AD6C]" />
                <span className="text-[13px] font-bold text-slate-900">{rating}</span>
                <span className="text-[11px] text-slate-500">({reviews})</span>
              </div>
              <div className="text-right">
                <p className="text-[20px] leading-[24px] tracking-normal font-bold text-slate-900">
                  <span className="text-[10px] font-normal text-slate-500">{t('common.from')} </span>
                  {convertedPrice.formatted}
                </p>
              </div>
            </div>
          </div>
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
