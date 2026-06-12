import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useTourSearch } from "@/hooks/useTourSearch";
import { recommendedTours } from "@/components/homepage/data";
import { CarouselClipTrack } from "@/components/ui/CarouselClipTrack";
import { CarouselCardsSkeleton } from "@/components/homepage/skeletons/CarouselCardsSkeleton";
import { SimilarExperienceCard } from "./SimilarExperienceCard";

const MIN_CARDS = 6;
const CARD_GAP_PX = 16;
const CARD_WIDTH_SM = 260;
const CARD_WIDTH_MD = 280;

export function SimilarExperiencesCarousel({
  excludeTitle,
  onImageError,
  searchQuery = "",
  category = "all",
  sortBy = "popularity",
}) {
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const canScrollLeftRef = useRef(false);
  const canScrollRightRef = useRef(false);
  const scrollBtnLeftRef = useRef(null);
  const scrollBtnRightRef = useRef(null);

  const { data: tourResults = [], isLoading } = useTourSearch({
    category,
    search: searchQuery,
    sortBy,
    limit: 12,
  });

  const items = tourResults.filter(
    (tour) => tour.title !== excludeTitle
  );

  // Pad with static fallback tours to ensure minimum cards for scroll arrows
  const paddedItems = (() => {
    if (items.length >= MIN_CARDS) return items;
    const fallback = recommendedTours
      .filter((t) => t.title !== excludeTitle && !items.some((i) => i.title === t.title))
      .map((t) => ({ ...t, slug: t.slug || "" }));
    return [...items, ...fallback].slice(0, MIN_CARDS);
  })();

  const updateScrollEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const max = scrollWidth - clientWidth;
    const eps = 6;
    const left = scrollLeft > eps;
    const right = max > eps && scrollLeft < max - eps;
    canScrollLeftRef.current = left;
    canScrollRightRef.current = right;
    if (scrollBtnLeftRef.current) {
      scrollBtnLeftRef.current.style.opacity = left ? "1" : "0";
      scrollBtnLeftRef.current.style.pointerEvents = left ? "auto" : "none";
    }
    if (scrollBtnRightRef.current) {
      scrollBtnRightRef.current.style.opacity = right ? "1" : "0";
      scrollBtnRightRef.current.style.pointerEvents = right ? "auto" : "none";
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(updateScrollEdges);
    el.addEventListener("scroll", updateScrollEdges, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateScrollEdges) : null;
    ro?.observe(el);
    window.addEventListener("resize", updateScrollEdges);
    return () => {
      el.removeEventListener("scroll", updateScrollEdges);
      ro?.disconnect();
      window.removeEventListener("resize", updateScrollEdges);
    };
    }, [paddedItems.length, updateScrollEdges]);

  const scrollByDirection = useCallback((dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = window.innerWidth >= 640 ? CARD_WIDTH_MD : CARD_WIDTH_SM;
    const step = card + CARD_GAP_PX;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const target = Math.max(0, Math.min(maxScroll, el.scrollLeft + dir * step * 1.35));
    el.scrollTo({ left: target, behavior: "smooth" });
  }, []);

  if (!isLoading && paddedItems.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          ref={scrollBtnLeftRef}
          type="button"
          className="hidden size-9 shrink-0 place-items-center rounded-full border border-slate-900 bg-white text-slate-900 shadow-md transition-opacity duration-200 sm:grid sm:size-10"
          style={{ opacity: 0, pointerEvents: "none" }}
          aria-label={t("tourDetail.similarScrollPrev")}
          onClick={() => scrollByDirection(-1)}
        >
          <ChevronLeft className="size-5" strokeWidth={2} aria-hidden />
        </button>

        <CarouselClipTrack
          ref={scrollRef}
          className="min-w-0 flex-1"
          cardWidth={280}
          gap={16}
          trackClassName="gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] sm:gap-5 md:gap-5 [&::-webkit-scrollbar]:hidden"
          style={{
            WebkitOverflowScrolling: "touch",
            overflowY: "unset",
          }}
        >
          {isLoading ? (
            <CarouselCardsSkeleton delay={0} cardWidth={280} gap={16} />
          ) : (
            paddedItems.map((tour, index) => (
                <SimilarExperienceCard
                  key={tour.slug || tour.title}
                  tour={tour}
                  index={index}
                  onImageError={onImageError}
                />
              ))
          )}
        </CarouselClipTrack>

        <button
          ref={scrollBtnRightRef}
          type="button"
          className="hidden size-9 shrink-0 place-items-center rounded-full border border-slate-900 bg-white text-slate-900 shadow-md transition-opacity duration-200 sm:grid sm:size-10"
          style={{ opacity: 0, pointerEvents: "none" }}
          aria-label={t("tourDetail.similarScrollNext")}
          onClick={() => scrollByDirection(1)}
        >
          <ChevronRight className="size-5" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </section>
  );
}
