import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

import { useWishlist } from '@/contexts/WishlistContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigationLoader } from '@/contexts/NavigationContext';
import { CarouselClipTrack } from '@/components/ui/CarouselClipTrack';
import { attractionsNearby } from './data';

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function AttractionCard({ title, slug, price, image, location }) {
  const { t } = useTranslation();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { convertPrice } = useCurrency();
  const { navigateWithLoader } = useNavigationLoader();
  const isFavorited = isInWishlist(title);
  const convertedPrice = convertPrice(price);

  const detailTo = slug ? `/tour/${slug}` : `/tour/${encodeURIComponent(title)}`;

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({ title, price, image });
  };

  const handleDetailLinkClick = (e) => {
    e.preventDefault();
    navigateWithLoader(detailTo);
  };

  return (
    <div className="group relative h-[18.75rem] xl:h-[21rem] contain-none overflow-hidden rounded-lg border border-slate-200 font-card shadow-sm transition duration-300 hover:shadow-md">
      <img
        src={image}
        alt=""
        aria-hidden={true}
        className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-[color:var(--brand-green)]/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm">
        Attractions
      </span>

      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-1 p-2.5">
        {location && (
          <div className="flex items-center gap-1">
            <MapPin className="size-3 shrink-0 text-amber-300" />
            <span className="truncate text-[13px] font-bold text-amber-300">{location}</span>
          </div>
        )}
        <div className="flex items-end justify-between gap-2">
          <h3
            className="line-clamp-2 text-[18px] leading-[24px] tracking-normal font-bold text-white drop-shadow-md"
          >
            {title}
          </h3>

          <div className="shrink-0 text-right">
            <p className="text-[11px] text-white/70 leading-none">{t('common.from')}</p>
            <p className="text-[20px] leading-[24px] tracking-normal font-bold text-amber-300 drop-shadow-sm">
              {convertedPrice.formatted}
            </p>
          </div>
        </div>
      </div>

      <Link
        to={detailTo}
        onClick={handleDetailLinkClick}
        aria-label={`${t('common.viewDetails', { defaultValue: 'View details' })}: ${title}`}
        className="absolute inset-0 z-[5] rounded-lg outline-none ring-inset focus-visible:ring-2 focus-visible:ring-white/50"
      />
      <button
        type="button"
        onClick={handleHeartClick}
        className="absolute right-2 top-2 z-[10] grid size-6 place-items-center rounded-full bg-white/95 text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-white hover:scale-110"
      >
        <svg
          className={`size-3 transition-colors ${
            isFavorited ? 'fill-[color:var(--brand-green)] text-[color:var(--brand-green)]' : ''
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>
  );
}

export function TopAttractionsNearby() {
  const { t } = useTranslation();
  const { navigateWithLoader } = useNavigationLoader();
  const scrollRef = useRef(null);
  const [sortedAttractions, setSortedAttractions] = useState([]);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      setSortedAttractions(attractionsNearby);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const withDistance = attractionsNearby.map((a) => ({
          ...a,
          distance: haversineDistance(latitude, longitude, a.lat, a.lng),
        }));
        withDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        setSortedAttractions(withDistance);
      },
      () => {
        setLocationError('Location access denied');
        setSortedAttractions(attractionsNearby);
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    );
  }, []);

  const scrollCarousel = useCallback((direction) => {
    const container = scrollRef.current;
    if (!container) return;
    const amount = 280 + 12;
    const target = container.scrollLeft + (direction === 'left' ? -amount : amount);
    container.scrollTo({ left: target, behavior: 'smooth' });
  }, []);

  if (sortedAttractions.length === 0) return null;

  return (
    <section className="py-4 md:py-4 xl:py-5">
      <div className="section-header-row relative z-30 isolate mb-[0.6375rem] flex items-start justify-between gap-4 md:mb-2.5 xl:mb-3">
        <div className="min-w-0 flex-1">
          <h2
            className="truncate font-bold tracking-tight text-slate-900 leading-[1.15]"
            style={{ fontSize: 'clamp(1.2rem, 1.2vw + 0.5rem, 1.375rem)' }}
            title="Top Attractions Nearby"
          >
            Top Attractions Nearby
          </h2>
          {locationError && (
            <p className="mt-0.5 text-[12px] text-slate-500">
              Showing all attractions (location unavailable)
            </p>
          )}
        </div>
        <div className="section-header-actions">
          <Link
            to="/tours?category=attractions&title=Top%20Attractions%20Nearby"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'auto' });
              navigateWithLoader('/tours?category=attractions&title=Top%20Attractions%20Nearby');
            }}
            className="group relative inline-flex min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center gap-1 whitespace-nowrap rounded-md py-2 pl-2 pr-1.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-100/90 hover:text-slate-950 sm:text-[13px] lg:min-h-0 lg:min-w-0 lg:py-1.5 lg:px-2 lg:text-[14px]"
          >
            <span className="relative">
              {t('sections.viewAll')}
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[color:var(--brand-green)] transition-all duration-300 group-hover:w-full" />
            </span>
            <ChevronRight className="size-4 text-slate-500 transition group-hover:text-[color:var(--brand-green)]" />
          </Link>
          <div className="section-header-scroll-arrows">
            <button
              onClick={() => scrollCarousel('left')}
              className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
              aria-label="Scroll left"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
              aria-label="Scroll right"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
      <CarouselClipTrack
        ref={scrollRef}
        cardWidth={280}
        gap={12}
        syncSectionClipWidth
        trackClassName="gap-3 overflow-x-auto xl:overflow-x-hidden overflow-y-hidden overscroll-x-contain pb-1 scrollbar-hide"
      >
        {sortedAttractions.map((attraction, index) => (
          <div
            key={`${attraction.title}-${index}`}
            className="w-[280px] shrink-0 snap-start"
            style={{ scrollSnapAlign: 'start' }}
          >
            <AttractionCard {...attraction} />
          </div>
        ))}
      </CarouselClipTrack>
    </section>
  );
}
