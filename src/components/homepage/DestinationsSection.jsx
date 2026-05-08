import { useRef, useState, useEffect, useLayoutEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { destinations } from "./data";
import { DestinationCard } from "./DestinationCard";
import { DestinationsModal } from "./DestinationsModal";

export function DestinationsSection() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollContainerRef = useRef(null);
  const mobileScrollRef = useRef(null);
  const isScrollingRef = useRef(false);

  // Triple the items for infinite loop
  const infiniteDestinations = [...destinations, ...destinations, ...destinations];
  const cardWidth = 280;
  const gap = 12;
  const singleSetWidth = destinations.length * (cardWidth + gap);

  const nudgeMobileInfiniteLoop = useCallback(() => {
    const container = mobileScrollRef.current;
    if (!container || destinations.length === 0 || isScrollingRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 0) return;

    const threshold = cardWidth * 0.5;

    if (scrollLeft <= threshold) {
      isScrollingRef.current = true;
      container.scrollLeft = scrollLeft + singleSetWidth;
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    } else if (scrollLeft >= maxScroll - threshold) {
      isScrollingRef.current = true;
      container.scrollLeft = scrollLeft - singleSetWidth;
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    }
  }, [cardWidth, singleSetWidth]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 320;
      const currentScroll = container.scrollLeft;
      
      let newScrollPosition;
      
      if (direction === 'left') {
        newScrollPosition = currentScroll - scrollAmount;
        // If scrolling past the beginning, loop to the end of second set
        if (newScrollPosition < scrollAmount) {
          container.scrollLeft = singleSetWidth + newScrollPosition;
          return;
        }
      } else {
        newScrollPosition = currentScroll + scrollAmount;
        // If scrolling past the end of second set, loop to the beginning of second set
        if (newScrollPosition > singleSetWidth * 2 - scrollAmount) {
          container.scrollLeft = singleSetWidth + (newScrollPosition - singleSetWidth * 2);
          return;
        }
      }
      
      container.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  // Initialize desktop scroll position to middle set
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = singleSetWidth;
    }
  }, [singleSetWidth]);

  // Initialize mobile scroll position to middle set (native momentum scrolling)
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
    <section id="destinations" className="py-[1.275rem] md:py-4 xl:py-5">
      <div className="mb-[0.6375rem] md:mb-2.5 xl:mb-3 flex items-center justify-between gap-3">
<h2
  className="font-bold tracking-tight text-slate-900 leading-[1.15] whitespace-nowrap"
  style={{ fontSize: 'clamp(1.2rem, 1.2vw + 0.5rem, 1.375rem)' }}
>
  {t('sections.destinations')}
</h2>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="group inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[13px] font-semibold text-slate-700 transition hover:text-slate-950 sm:text-[13px] xl:text-[14px]"
          >
          <span className="relative">
            {t("sections.viewAll")}
            <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[color:var(--brand-green)] transition-all duration-300 group-hover:w-full" />
          </span>
            <ChevronRight className="size-4 text-slate-500 transition group-hover:text-[color:var(--brand-green)]" />
          </button>
          <div className="hidden items-center gap-2 xl:flex">
            <button 
              onClick={() => scroll('left')}
              className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
              aria-label="Scroll left"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
              aria-label="Scroll right"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Desktop: Horizontal scroll with arrow buttons */}
      <div 
        ref={scrollContainerRef}
        className="hidden xl:flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {infiniteDestinations.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="min-w-[280px] flex-shrink-0"
            style={{ scrollSnapAlign: "start" }}
          >
            <DestinationCard {...item} />
          </div>
        ))}
      </div>

      {/* Mobile/Tablet: Swipeable carousel */}
      <div
        ref={mobileScrollRef}
        className="-mx-1 flex gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain px-1 scrollbar-hide xl:hidden"
        style={{ 
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "x mandatory"
        }}
      >
        {infiniteDestinations.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="w-[280px] min-w-[280px] shrink-0"
            style={{ scrollSnapAlign: "start" }}
          >
            <DestinationCard {...item} />
          </div>
        ))}
      </div>

      <DestinationsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
