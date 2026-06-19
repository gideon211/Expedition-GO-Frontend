/**
 * @file TourCarouselSection.jsx
 * @description Horizontal scroll carousel for tour lists on homepage and AllToursPage.
 *   Includes arrow navigation with smooth scroll and SectionHeading integration.
 *
 * @see components/homepage/FeaturedExperiencesCard.jsx (default card)
 * @see components/homepage/SectionHeading.jsx
 */
import { useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FeaturedExperiencesCard } from './FeaturedExperiencesCard';
import { SectionHeading } from './SectionHeading';
import { CarouselClipTrack } from '@/components/ui/CarouselClipTrack';

export function TourCarouselSection({
  id,
  title,
  subtitle,
  items,
  fallbackKey,
  hideViewAll,
  hideTitle,
  sideArrows,
  badge,
  CardComponent,
}) {
  const scrollContainerRef = useRef(null);
  const mobileScrollRef = useRef(null);
  const isScrollingRef = useRef(false);

  const Card = CardComponent || FeaturedExperiencesCard;
  const infiniteItems = [...items, ...items, ...items];
  const cardWidth = 280;
  const gap = 12;
  const singleSetWidth = items.length * (cardWidth + gap);

  const nudgeMobileInfiniteLoop = useCallback(() => {
    const container = mobileScrollRef.current;
    if (!container || items.length === 0 || isScrollingRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 0) return;

    const threshold = cardWidth * 0.5;

    if (scrollLeft <= threshold) {
      isScrollingRef.current = true;
      const originalSnap = container.style.scrollSnapType;
      container.style.scrollSnapType = 'none';
      container.scrollLeft = scrollLeft + singleSetWidth;
      container.style.scrollSnapType = originalSnap;
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    } else if (scrollLeft >= maxScroll - threshold) {
      isScrollingRef.current = true;
      const originalSnap = container.style.scrollSnapType;
      container.style.scrollSnapType = 'none';
      container.scrollLeft = scrollLeft - singleSetWidth;
      container.style.scrollSnapType = originalSnap;
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    }
  }, [items.length, singleSetWidth, cardWidth]);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = cardWidth + gap;
    const currentScroll = container.scrollLeft;

    let newScrollPosition;

    if (direction === 'left') {
      newScrollPosition = currentScroll - scrollAmount;
      if (newScrollPosition < scrollAmount) {
        const originalSnap = container.style.scrollSnapType;
        container.style.scrollSnapType = 'none';
        container.scrollLeft = singleSetWidth + newScrollPosition;
        container.style.scrollSnapType = originalSnap;
        return;
      }
    } else {
      newScrollPosition = currentScroll + scrollAmount;
      if (newScrollPosition > singleSetWidth * 2 - scrollAmount) {
        const originalSnap = container.style.scrollSnapType;
        container.style.scrollSnapType = 'none';
        container.scrollLeft = singleSetWidth + (newScrollPosition - singleSetWidth * 2);
        container.style.scrollSnapType = originalSnap;
        return;
      }
    }

    container.scrollTo({ left: newScrollPosition, behavior: 'smooth' });
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

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      el.removeEventListener('scroll', onScroll);
    };
  }, [nudgeMobileInfiniteLoop]);

  return (
    <section id={id} className="py-4 md:py-4 xl:py-5">
      <SectionHeading
        title={title}
        subtitle={subtitle}
        categoryId={id}
        fallbackKey={fallbackKey}
        hideViewAll={hideViewAll}
        hideTitle={hideTitle}
        onScrollLeft={!sideArrows ? () => scroll('left') : undefined}
        onScrollRight={!sideArrows ? () => scroll('right') : undefined}
      />

      <div className={`flex items-center gap-0 ${sideArrows ? 'xl:gap-1' : ''}`}>
        {sideArrows && (
          <button
            type="button"
            onClick={() => scroll('left')}
            className="z-10 hidden shrink-0 rounded-full border border-slate-200 bg-white/90 p-2.5 text-slate-700 shadow-lg backdrop-blur transition hover:bg-white hover:text-slate-900 xl:grid place-items-center"
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-5" />
          </button>
        )}

        <CarouselClipTrack
          ref={scrollContainerRef}
          className="hidden flex-1 xl:block"
          cardWidth={280}
          gap={12}
          clipAt="xl"
          syncSectionClipWidth
          trackClassName="gap-3 overflow-x-hidden pb-1 overscroll-x-contain scrollbar-hide items-stretch"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {infiniteItems.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
               className="w-[280px] shrink-0 self-stretch"
              style={{ scrollSnapAlign: 'start' }}
            >
              <Card {...item} badge={badge} />
            </div>
          ))}
        </CarouselClipTrack>

        {sideArrows && (
          <button
            type="button"
            onClick={() => scroll('right')}
            className="z-10 hidden shrink-0 rounded-full border border-slate-200 bg-white/90 p-2.5 text-slate-700 shadow-lg backdrop-blur transition hover:bg-white hover:text-slate-900 xl:grid place-items-center"
            aria-label="Scroll right"
          >
            <ChevronRight className="size-5" />
          </button>
        )}
      </div>

      <CarouselClipTrack
        ref={mobileScrollRef}
        className="xl:hidden"
        cardWidth={280}
        gap={12}
        clipAt={false}
        trackClassName="gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-1 scrollbar-hide items-stretch"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
        }}
      >
        {infiniteItems.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="w-[280px] shrink-0 self-stretch"
            style={{ scrollSnapAlign: 'start' }}
          >
            <Card {...item} />
          </div>
        ))}
      </CarouselClipTrack>
    </section>
  );
}
