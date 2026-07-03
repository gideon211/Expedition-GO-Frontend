/**
 * @file PreviewGridSection.jsx
 * @description PREVIEW-ONLY section wrapper for the homepage redesign preview (/preview/home).
 *   Renders the existing SectionHeading, then lays out exactly 4 cards per section as a
 *   responsive grid on desktop (4 across on lg+) with a horizontal-scroll fallback on mobile.
 *
 *   Reuses existing card components as-is and existing brand design tokens — nothing from the
 *   current design system is removed or altered.
 *
 * @see components/homepage/SectionHeading.jsx
 * @see components/homepage/FeaturedExperiencesCard.jsx
 */
import { FeaturedExperiencesCard } from '../FeaturedExperiencesCard';
import { SectionHeading } from '../SectionHeading';

/** Number of cards shown per section in the redesign preview. */
const CARDS_PER_SECTION = 4;

export function PreviewGridSection({
  id,
  title,
  subtitle,
  items,
  fallbackKey,
  hideViewAll,
  badge,
  cardVariant,
  CardComponent,
}) {
  const Card = CardComponent || FeaturedExperiencesCard;
  const visibleItems = (items || []).slice(0, CARDS_PER_SECTION);

  return (
    <section id={id} className="py-4 md:py-4 xl:py-5">
      <SectionHeading
        title={title}
        subtitle={subtitle}
        categoryId={id}
        fallbackKey={fallbackKey}
        hideViewAll={hideViewAll}
      />

      {/* Desktop / tablet: responsive grid — 4 across on lg+ */}
      <div className="hidden grid-cols-2 gap-3 md:grid md:grid-cols-3 lg:grid-cols-4">
        {visibleItems.map((item, index) => (
          <div key={`${item.title}-${index}`} className="h-full">
            <Card {...item} badge={badge} variant={cardVariant} />
          </div>
        ))}
      </div>

      {/* Mobile: horizontal scroll row (keeps the browse-by-swipe feel on small screens) */}
      <div
        className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 scrollbar-hide md:hidden"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {visibleItems.map((item, index) => (
          <div
            key={`${item.title}-mobile-${index}`}
            className="w-[260px] shrink-0"
            style={{ scrollSnapAlign: 'start' }}
          >
            <Card {...item} badge={badge} variant={cardVariant} />
          </div>
        ))}
      </div>
    </section>
  );
}
