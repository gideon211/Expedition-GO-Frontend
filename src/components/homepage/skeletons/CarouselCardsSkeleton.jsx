import { useRef } from "react";
import { useCarouselLayout } from "@/hooks/useCarouselLayout";
import { CardSkeleton } from "./CardSkeleton";

export function CarouselCardsSkeleton({ delay = 0, cardWidth = 280, gap = 12, clipAt = "xl" }) {
  const containerRef = useRef(null);
  const { count, clipWidth } = useCarouselLayout(containerRef, { cardWidth, gap, minCards: 1, maxCards: 6, clipAt });
  const displayCount = clipWidth == null ? Math.min(count + 1, 3) : count;

  return (
    <div ref={containerRef} className="min-w-0 w-full overflow-hidden">
      <div className="flex gap-3" style={{ columnGap: gap }}>
        {Array.from({ length: displayCount }, (_, index) => (
          <div key={index} className="shrink-0" style={{ width: cardWidth }}>
            <CardSkeleton delay={delay + index * 30} />
          </div>
        ))}
      </div>
    </div>
  );
}
