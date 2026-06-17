import { forwardRef, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useCarouselLayout } from '@/hooks/useCarouselLayout';

/**
 * Clips a horizontal card track so only whole cards are visible on larger screens.
 * On mobile (below `clipAt`), partial cards may peek at the right edge for scroll affordance.
 */
export const CarouselClipTrack = forwardRef(function CarouselClipTrack(
  {
    className,
    trackClassName,
    cardWidth = 280,
    gap = 12,
    minCards = 1,
    maxCards = 12,
    clipAt = 'xl',
    syncSectionClipWidth = false,
    children,
    ...props
  },
  ref
) {
  const containerRef = useRef(null);
  const { clipWidth } = useCarouselLayout(containerRef, {
    cardWidth,
    gap,
    minCards,
    maxCards,
    clipAt,
  });

  useEffect(() => {
    if (!syncSectionClipWidth) return undefined;

    const section = containerRef.current?.closest('section');
    if (!section) return undefined;

    if (clipWidth != null) {
      section.style.setProperty('--carousel-clip-width', `${clipWidth}px`);
      section.dataset.carouselClip = 'true';
    } else {
      section.style.removeProperty('--carousel-clip-width');
      delete section.dataset.carouselClip;
    }

    return () => {
      section.style.removeProperty('--carousel-clip-width');
      delete section.dataset.carouselClip;
    };
  }, [clipWidth, syncSectionClipWidth]);

  return (
    <div ref={containerRef} className={cn('min-w-0 w-full', className)}>
      <div
        className={cn('max-w-full transform-gpu', clipWidth != null ? 'overflow-hidden' : 'overflow-visible')}
        style={clipWidth != null ? { width: clipWidth } : undefined}
      >
        <div ref={ref} className={cn('flex min-w-0', trackClassName)} {...props}>
          {children}
        </div>
      </div>
    </div>
  );
});
