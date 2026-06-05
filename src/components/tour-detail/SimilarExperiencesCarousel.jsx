import { useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";

import { useWishlist } from "@/contexts/WishlistContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTourSearch } from "@/hooks/useTourSearch";
import { recommendedTours } from "@/components/homepage/data";
import { CarouselClipTrack } from "@/components/ui/CarouselClipTrack";
import { CarouselCardsSkeleton } from "@/components/homepage/skeletons/CarouselCardsSkeleton";

const MIN_CARDS = 6;
const CARD_GAP_PX = 16;
const CARD_WIDTH_SM = 260;
const CARD_WIDTH_MD = 280;

function parseReviewsDisplay(value) {
  if (value == null) return "0";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  const s = String(value).replace(/,/g, "").trim();
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? String(n) : String(value);
}

export function SimilarExperiencesCarousel({
  excludeTitle,
  onImageError,
  searchQuery = "",
  category = "all",
  sortBy = "popularity",
}) {
  const { t } = useTranslation();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { convertPrice } = useCurrency();
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
      <div className="relative">
        <CarouselClipTrack
          ref={scrollRef}
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
            paddedItems.map((tour, index) => {
              const detailTo = tour.slug ? `/tour/${tour.slug}` : `/tour/${encodeURIComponent(tour.title)}`;
              const converted = convertPrice(tour.price);
              const reviewsDisplay = parseReviewsDisplay(tour.reviews);
              const isFav = isInWishlist(tour.title);

              return (
                <article
                  key={tour.slug || tour.title}
                  className="w-[260px] shrink-0 sm:w-[280px]"
                >
                  <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.08)] transition hover:shadow-md">
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
                        aria-label={t("nav.wishlist")}
                      >
                        <Heart
                          className={`size-4 ${isFav ? "fill-[color:var(--brand-green)] text-[color:var(--brand-green)]" : "fill-none"}`}
                          strokeWidth={2}
                        />
                      </button>
                    </div>

                    <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5 sm:px-3.5 sm:pb-3.5 sm:pt-3">
                      <Link
                        to={detailTo}
                        className="line-clamp-2 min-h-[2.5rem] font-bold leading-snug text-slate-900 hover:underline"
                        style={{ fontSize: "clamp(0.8125rem, 0.6vw + 0.5rem, 0.9375rem)" }}
                      >
                        {tour.title}
                      </Link>

                      <p className="mt-1.5 text-[12px] font-medium leading-snug text-slate-500 sm:text-[11px]">
                        {t("features.freeCancellation")}
                        <span className="mx-1 text-slate-400" aria-hidden>•</span>
                        {t("tourDetail.pickupIncluded")}
                      </p>

                      <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                        <div className="flex min-w-0 items-center gap-1">
                          <Star
                            className="size-4 shrink-0 fill-amber-500 text-amber-500"
                            strokeWidth={1.5}
                            aria-hidden
                          />
                          <span className="text-[13px] font-bold tabular-nums text-slate-900 sm:text-[12px]">
                            {tour.rating}
                          </span>
                          <span className="text-[12px] text-slate-500 sm:text-[11px]">
                            ({reviewsDisplay})
                          </span>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[11px] font-medium leading-none text-slate-500">{t("common.from")}</p>
                          <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-900">{converted.formatted}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </CarouselClipTrack>

        <button
          ref={scrollBtnLeftRef}
          type="button"
          className="absolute left-0 top-1/2 z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-slate-900 bg-white text-slate-900 shadow-md transition-opacity duration-200 sm:grid sm:size-10"
          style={{ opacity: 0, pointerEvents: "none" }}
          aria-label={t("tourDetail.similarScrollPrev")}
          onClick={() => scrollByDirection(-1)}
        >
          <ChevronLeft className="size-5" strokeWidth={2} aria-hidden />
        </button>

        <button
          ref={scrollBtnRightRef}
          type="button"
          className="absolute right-0 top-1/2 z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-slate-900 bg-white text-slate-900 shadow-md transition-opacity duration-200 sm:grid sm:size-10"
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
