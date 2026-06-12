/**
 * @file DestinationsSection.jsx
 * @description Homepage destinations carousel with "View all" modal trigger.
 *   Data from data.js destinations. Uses PopularDestinationsCard and DestinationsModal.
 *
 * @see components/homepage/PopularDestinationsCard.jsx
 */
import { useRef, useState, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { destinations as staticDestinations } from "./data";
import { PopularDestinationsCard } from "./PopularDestinationsCard";
import { DestinationsModal } from "./DestinationsModal";
import { CarouselClipTrack } from "@/components/ui/CarouselClipTrack";

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

const destinationCoords = {
  "Accra": { lat: 5.6037, lng: -0.1870 },
  "Cape Coast": { lat: 5.1053, lng: -1.2466 },
  "Kakum National Park": { lat: 5.3500, lng: -1.3833 },
  "Kumasi": { lat: 6.6885, lng: -1.6244 },
  "Elmina": { lat: 5.0833, lng: -1.3500 },
  "Mole National Park": { lat: 9.2833, lng: -1.8500 },
  "Wli Waterfalls": { lat: 7.0833, lng: 0.5833 },
  "Aburi Botanical Gardens": { lat: 5.8500, lng: -0.1833 },
  "Ada Foah": { lat: 5.7833, lng: 0.6333 },
  "Boti Falls": { lat: 6.1500, lng: -0.2500 },
  "Busua Beach": { lat: 4.8667, lng: -2.3000 },
  "Larabanga Mosque": { lat: 9.1167, lng: -1.7833 },
  "Nzulezu Stilt Village": { lat: 5.1667, lng: -2.6667 },
  "Shai Hills Reserve": { lat: 5.8333, lng: -0.0667 },
  "Paga Crocodile Pond": { lat: 10.9833, lng: -0.7167 },
  "Akosombo": { lat: 6.2667, lng: 0.2500 },
  "Tafi Atome Monkey Sanctuary": { lat: 7.1333, lng: 0.4833 },
  "Biriwa Beach": { lat: 5.1333, lng: -1.1667 },
};

const CAROUSEL_ARROW_SCROLL_MS = 260;

/** Arrow-driven scroll; stale runs stop when generation bumps (rapid clicks). */
function smoothScrollTo(element, target, duration, generationRef, generation, onComplete) {
  const start = element.scrollLeft;
  const distance = target - start;

  const invokeComplete = () => {
    if (generationRef.current === generation) {
      onComplete?.();
    }
  };

  if (Math.abs(distance) < 0.5) {
    requestAnimationFrame(invokeComplete);
    return;
  }

  let startTime = null;
  const originalSnap = element.style.scrollSnapType;

  element.style.scrollSnapType = "none";

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const finishSnap = () => {
    if (generationRef.current !== generation) {
      element.style.scrollSnapType = originalSnap;
      return;
    }
    element.style.scrollSnapType = originalSnap;
    invokeComplete();
  };

  const step = (timestamp) => {
    if (generationRef.current !== generation) {
      element.style.scrollSnapType = originalSnap;
      return;
    }
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);

    element.scrollLeft = start + distance * easeOutCubic(progress);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      requestAnimationFrame(finishSnap);
    }
  };

  requestAnimationFrame(step);
}

export function DestinationsSection({ apiDestinations = [] }) {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const viewAllTriggerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const mobileScrollRef = useRef(null);
  const isScrollingRef = useRef(false);
  const scrollGenerationRef = useRef(0);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    );
  }, []);

  const mergedDestinations = useMemo(() => {
    const base = apiDestinations.length === 0 ? staticDestinations : (() => {
      const seen = new Set();
      const merged = [];
      for (const d of apiDestinations) {
        if (!seen.has(d.title)) { seen.add(d.title); merged.push(d); }
      }
      for (const d of staticDestinations) {
        if (!seen.has(d.title)) { seen.add(d.title); merged.push(d); }
      }
      return merged;
    })();

    if (!userLocation) return base;

    const withDistance = base.map((d) => {
      const coords = destinationCoords[d.title];
      const distance = coords
        ? haversineDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng)
        : Infinity;
      return { ...d, distance };
    });
    withDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    return withDistance;
  }, [apiDestinations, userLocation]);

  const infiniteDestinations = [...mergedDestinations, ...mergedDestinations, ...mergedDestinations];
  const cardWidth = 280;
  const gap = 12;
  const singleSetWidth = mergedDestinations.length * (cardWidth + gap);

  const nudgeMobileInfiniteLoop = useCallback(() => {
    const container = mobileScrollRef.current;
    if (!container || mergedDestinations.length === 0 || isScrollingRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 0) return;

    const threshold = cardWidth * 0.5;

    if (scrollLeft <= threshold) {
      isScrollingRef.current = true;
      const originalSnap = container.style.scrollSnapType;
      container.style.scrollSnapType = "none";
      container.scrollLeft = scrollLeft + singleSetWidth;
      container.style.scrollSnapType = originalSnap;
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    } else if (scrollLeft >= maxScroll - threshold) {
      isScrollingRef.current = true;
      const originalSnap = container.style.scrollSnapType;
      container.style.scrollSnapType = "none";
      container.scrollLeft = scrollLeft - singleSetWidth;
      container.style.scrollSnapType = originalSnap;
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    }
  }, [cardWidth, singleSetWidth]);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    scrollGenerationRef.current += 1;
    const gen = scrollGenerationRef.current;

    const scrollAmount = cardWidth + gap;
    const currentScroll = container.scrollLeft;

    let newScrollPosition;

    if (direction === "left") {
      newScrollPosition = currentScroll - scrollAmount;
      if (newScrollPosition < scrollAmount) {
        const originalSnap = container.style.scrollSnapType;
        container.style.scrollSnapType = "none";
        container.scrollLeft = singleSetWidth + newScrollPosition;
        container.style.scrollSnapType = originalSnap;
        return;
      }
    } else {
      newScrollPosition = currentScroll + scrollAmount;
      if (newScrollPosition > singleSetWidth * 2 - scrollAmount) {
        const originalSnap = container.style.scrollSnapType;
        container.style.scrollSnapType = "none";
        container.scrollLeft = singleSetWidth + (newScrollPosition - singleSetWidth * 2);
        container.style.scrollSnapType = originalSnap;
        return;
      }
    }

    smoothScrollTo(
      container,
      newScrollPosition,
      CAROUSEL_ARROW_SCROLL_MS,
      scrollGenerationRef,
      gen,
    );
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollLeft = singleSetWidth;
  }, [singleSetWidth]);

  useLayoutEffect(() => {
    const el = mobileScrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    el.scrollLeft = Math.min(singleSetWidth, maxScroll);
  }, [singleSetWidth]);

  useEffect(() => {
    const el = mobileScrollRef.current;
    if (!el) return;

    let rafId = null;

    const onScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        nudgeMobileInfiniteLoop();
        rafId = null;
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      el.removeEventListener("scroll", onScroll);
    };
  }, [nudgeMobileInfiniteLoop]);

  return (
    <section id="destinations" className="py-4 md:py-4 xl:py-5">
      <div className="section-header-row mb-[0.6375rem] md:mb-2.5 xl:mb-3 flex items-center justify-between gap-3">
        <h2
          className="whitespace-nowrap font-bold leading-[1.15] tracking-tight text-slate-900"
          style={{ fontSize: "clamp(1.2rem, 1.2vw + 0.5rem, 1.375rem)" }}
        >
          {t("sections.destinations")}
        </h2>

        <div className="section-header-actions">
          <Link
            to="/tours?category=destinations"
            onClick={(e) => {
              e.preventDefault();
              setIsModalOpen(true);
            }}
            className="group inline-flex shrink-0 touch-manipulation items-center gap-1 whitespace-nowrap rounded-md py-2 pl-2 pr-1.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-100/90 hover:text-slate-950 sm:text-[13px] lg:py-1.5 lg:px-2 lg:text-[14px]"
          >
            <span className="relative">
              {t("sections.viewAll")}
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[color:var(--brand-green)] transition-all duration-300 group-hover:w-full" />
            </span>
            <ChevronRight className="size-4 text-slate-500 transition group-hover:text-[color:var(--brand-green)]" />
          </Link>
          <div className="section-header-scroll-arrows">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
              aria-label="Scroll left"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
              aria-label="Scroll right"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <CarouselClipTrack
        ref={scrollContainerRef}
        className="hidden xl:block"
        cardWidth={280}
        gap={12}
        clipAt="xl"
        syncSectionClipWidth
        trackClassName="gap-3 overflow-x-auto overscroll-x-contain scrollbar-hide"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {infiniteDestinations.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="min-w-[280px] shrink-0"
            style={{ scrollSnapAlign: "start" }}
          >
            <PopularDestinationsCard {...item} />
          </div>
        ))}
      </CarouselClipTrack>

      <CarouselClipTrack
        ref={mobileScrollRef}
        className="xl:hidden"
        cardWidth={280}
        gap={12}
        clipAt={false}
        trackClassName="gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-hide"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "x mandatory",
        }}
      >
        {infiniteDestinations.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="w-[280px] min-w-[280px] shrink-0"
            style={{ scrollSnapAlign: "start" }}
          >
            <PopularDestinationsCard {...item} />
          </div>
        ))}
      </CarouselClipTrack>

      <DestinationsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        triggerRef={viewAllTriggerRef}
      />
    </section>
  );
}
