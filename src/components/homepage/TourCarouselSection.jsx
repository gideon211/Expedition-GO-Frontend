import { useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { TourCard } from "./TourCard";
import { SectionHeading } from "./SectionHeading";

export function TourCarouselSection({ id, title, subtitle, items }) {
  const scrollContainerRef = useRef(null);
  const isScrollingRef = useRef(false);

  const infiniteItems = [...items, ...items, ...items];
  const cardWidth = 280;
  const gap = 12;
  const singleSetWidth = items.length * (cardWidth + gap);

  const nudgeInfiniteLoop = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || items.length === 0 || isScrollingRef.current) return;

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
  }, [items.length, singleSetWidth, cardWidth]);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 320;
    const currentScroll = container.scrollLeft;

    let newScrollPosition;

    if (direction === "left") {
      newScrollPosition = currentScroll - scrollAmount;
      if (newScrollPosition < scrollAmount) {
        container.scrollLeft = singleSetWidth + newScrollPosition;
        return;
      }
    } else {
      newScrollPosition = currentScroll + scrollAmount;
      if (newScrollPosition > singleSetWidth * 2 - scrollAmount) {
        container.scrollLeft =
          singleSetWidth + (newScrollPosition - singleSetWidth * 2);
        return;
      }
    }

    container.scrollTo({
      left: newScrollPosition,
      behavior: "smooth",
    });
  };

  useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    el.scrollLeft = Math.min(singleSetWidth, maxScroll);
  }, [singleSetWidth]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    let rafId = null;

    const onScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      rafId = requestAnimationFrame(() => {
        nudgeInfiniteLoop();
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
  }, [nudgeInfiniteLoop]);

  return (
    <section id={id} className="py-[1.275rem] md:py-4 xl:py-5">
      <SectionHeading
        title={title}
        subtitle={subtitle}
        categoryId={id}
        onScrollLeft={() => scroll("left")}
        onScrollRight={() => scroll("right")}
      />

      {/* Native momentum scrolling on mobile; same track + infinite loop for all breakpoints */}
      <div
        ref={scrollContainerRef}
        className="-mx-1 flex gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain px-1 scrollbar-hide"
        style={{ 
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "x mandatory"
        }}
      >
        {infiniteItems.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="w-[280px] min-w-[280px] shrink-0"
            style={{ scrollSnapAlign: "start" }}
          >
            <TourCard {...item} />
          </div>
        ))}
      </div>
    </section>
  );
}
