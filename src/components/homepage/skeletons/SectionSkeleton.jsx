/**
 * @file SectionSkeleton.jsx
 * @description Skeleton blocks for homepage tour carousel and destinations sections.
 *   Exports TourCarouselSkeleton and DestinationsSkeleton.
 */
import { Skeleton } from "@/components/ui/skeleton";
import { DestinationCardSkeleton } from "./CardSkeleton";
import { CarouselCardsSkeleton } from "./CarouselCardsSkeleton";
import { useRef } from "react";
import { useCarouselLayout } from "@/hooks/useCarouselLayout";

export function TourCarouselSkeleton({ delay = 0 }) {
  return (
    <section className="py-4 md:py-4 xl:py-5">
      {/* Section Heading */}
      <div className="section-header-row mb-[0.6375rem] flex items-start justify-between gap-4 md:mb-2.5 xl:mb-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-7 w-56" delay={delay} />
          <Skeleton className="h-3 w-72" delay={delay + 20} />
        </div>
        <div className="section-header-actions">
          <Skeleton className="h-5 w-20" delay={delay + 30} />
          <div className="section-header-scroll-arrows">
            <Skeleton className="size-8 rounded-full" delay={delay + 40} />
            <Skeleton className="size-8 rounded-full" delay={delay + 40} />
          </div>
        </div>
      </div>

      <CarouselCardsSkeleton delay={delay + 50} cardWidth={280} gap={12} />
    </section>
  );
}

function DestinationCardsSkeleton({ delay = 0, cardWidth = 280, gap = 12, clipAt = "xl" }) {
  const containerRef = useRef(null);
  const { count, clipWidth } = useCarouselLayout(containerRef, { cardWidth, gap, minCards: 1, maxCards: 6, clipAt });
  const displayCount = clipWidth == null ? Math.min(count + 1, 3) : count;

  return (
    <div ref={containerRef} className="min-w-0 w-full overflow-hidden">
      <div className="flex gap-3" style={{ columnGap: gap }}>
        {Array.from({ length: displayCount }, (_, index) => (
          <div key={index} className="shrink-0" style={{ width: cardWidth }}>
            <DestinationCardSkeleton delay={delay + index * 25} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DestinationsSkeleton({ delay = 0 }) {
  return (
    <section className="py-4 md:py-4 xl:py-5">
      {/* Section Heading */}
      <div className="section-header-row mb-[0.6375rem] flex items-start justify-between gap-4 md:mb-2.5 xl:mb-3">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-7 w-64" delay={delay} />
        </div>
        <div className="section-header-actions">
          <Skeleton className="h-5 w-20" delay={delay + 20} />
          <div className="section-header-scroll-arrows">
            <Skeleton className="size-8 rounded-full" delay={delay + 30} />
            <Skeleton className="size-8 rounded-full" delay={delay + 30} />
          </div>
        </div>
      </div>

      <DestinationCardsSkeleton delay={delay + 40} />
    </section>
  );
}
