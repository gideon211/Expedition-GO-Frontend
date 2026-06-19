import { useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';

import { useTourSearch } from '@/hooks/useTourSearch';
import { recommendedTours } from '@/components/homepage/data';
import { CarouselClipTrack } from '@/components/ui/CarouselClipTrack';
import { CarouselCardsSkeleton } from '@/components/homepage/skeletons/CarouselCardsSkeleton';
import { SimilarExperienceCard } from './SimilarExperienceCard';

const MIN_CARDS = 6;
const CARD_GAP_PX = 16;
const CARD_WIDTH_SM = 260;
const CARD_WIDTH_MD = 280;

export const SimilarExperiencesCarousel = forwardRef(function SimilarExperiencesCarousel(
  { excludeTitle, onImageError, searchQuery = '', category = 'all', sortBy = 'popularity' },
  ref,
) {
  const { t } = useTranslation();
  const scrollRef = useRef(null);

  const { data: tourResults = [], isLoading } = useTourSearch({
    category,
    search: searchQuery,
    sortBy,
    limit: 12,
  });

  const items = tourResults.filter((tour) => tour.title !== excludeTitle);

  const paddedItems = (() => {
    if (items.length >= MIN_CARDS) return items;
    const fallback = recommendedTours
      .filter((t) => t.title !== excludeTitle && !items.some((i) => i.title === t.title))
      .map((t) => ({ ...t, slug: t.slug || '' }));
    return [...items, ...fallback].slice(0, MIN_CARDS);
  })();

  const scrollByDirection = useCallback(
    (dir) => {
      const el = scrollRef.current;
      if (!el) return;
      const card = window.innerWidth >= 640 ? CARD_WIDTH_MD : CARD_WIDTH_SM;
      const step = card + CARD_GAP_PX;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const target = Math.max(0, Math.min(maxScroll, el.scrollLeft + dir * step * 1.35));
      el.scrollTo({ left: target, behavior: 'smooth' });
    },
    [],
  );

  useImperativeHandle(ref, () => ({ scrollBy: scrollByDirection }), [scrollByDirection]);

  if (!isLoading && paddedItems.length === 0) return null;

  return (
    <section>
      <CarouselClipTrack
        ref={scrollRef}
        className="min-w-0 flex-1"
        cardWidth={280}
        gap={16}
        trackClassName="gap-4 overflow-x-auto xl:overflow-x-hidden pb-2 [scrollbar-width:none] [-ms-overflow-style:none] sm:gap-5 md:gap-5 [&::-webkit-scrollbar]:hidden"
        style={{
          WebkitOverflowScrolling: 'touch',
          overflowY: 'unset',
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
    </section>
  );
});
