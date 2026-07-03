/**
 * @file HomeRedesignPreview.jsx
 * @description PREVIEW-ONLY route (/preview/home) showing a redesigned homepage layout.
 *
 *   Goal: show the existing homepage sections as clean, 4-cards-per-section grids
 *   (instead of the 5-across scroll carousels) while keeping every existing brand
 *   color, font, and card style intact. This file does not modify or replace the
 *   real HomePage (/) — it is an additive, isolated preview.
 *
 *   Reuses (read-only): Navbar, Footer, SectionHeading, FeaturedExperiencesCard,
 *   PopularDestinationsCard, LastMinuteDealsCard, and the static data in data.js.
 *
 * @see components/homepage/preview/PreviewGridSection.jsx
 */
import { useState } from 'react';

import { Navbar } from '@/components/homepage/Navbar';
import { Footer } from '@/components/homepage/Footer';
import { PreviewGridSection } from '@/components/homepage/preview/PreviewGridSection';
import { FeaturedExperiencesCard } from '@/components/homepage/FeaturedExperiencesCard';
import { PopularDestinationsCard } from '@/components/homepage/PopularDestinationsCard';
import { LastMinuteDealsCard } from '@/components/homepage/LastMinuteDealsCard';
import {
  recommendedTours,
  destinations,
  topRatedTours,
  leisureTours,
  pickupTours,
  lastMinuteDeals,
  sidebarTopRated,
  attractionsNearby,
} from '@/components/homepage/data';

/**
 * Section config mirrors the reference layout (top → bottom):
 * Recommended · Popular Destinations · Top Rated · Likely to Sell Out ·
 * Featured · Last Minute Deals · New Experiences · Top Attractions Nearby.
 */
export default function HomeRedesignPreview() {
  const [sharedSearchQuery, setSharedSearchQuery] = useState('');

  return (
    <div className="min-h-screen overflow-x-hidden bg-[color:var(--page-bg)] text-slate-900">
      <Navbar
        forceShowCompactSearch
        externalSearchQuery={sharedSearchQuery}
        onExternalSearchChange={setSharedSearchQuery}
      />

      <main className="mx-auto max-w-[1520px] px-4 pb-14 sm:px-6 lg:px-8">
        {/* Preview banner — clarifies this is a non-destructive redesign preview */}
        <div className="mt-[calc(var(--navbar-offset)+0.75rem)] rounded-xl border border-[color:var(--brand-green)]/20 bg-[color:var(--brand-sand)] px-4 py-3">
          <p className="text-sm font-semibold text-[color:var(--brand-green)]">
            Redesign preview — 4 cards per section
          </p>
          <p className="mt-0.5 text-xs text-slate-600">
            Same brand colors, fonts, and cards as the live site. Nothing on the existing
            homepage has changed.
          </p>
        </div>

        <div className="space-y-6 pt-4 min-w-0 md:space-y-6 xl:space-y-5">
          <PreviewGridSection
            id="recommended"
            title="Recommended for You"
            items={recommendedTours}
            fallbackKey="recommended"
          />

          <PreviewGridSection
            id="destinations"
            title="Popular Destinations"
            items={destinations}
            fallbackKey="destinations"
            CardComponent={PopularDestinationsCard}
          />

          <PreviewGridSection
            id="top-rated"
            title="Top Rated by Travellers"
            items={topRatedTours}
            fallbackKey="deals"
          />

          <PreviewGridSection
            id="likely-to-sell-out"
            title="Likely to Sell Out"
            items={leisureTours}
            fallbackKey="leisure"
          />

          <PreviewGridSection
            id="featured"
            title="Featured Experiences"
            items={pickupTours}
            fallbackKey="tours"
          />

          <PreviewGridSection
            id="last-minute-deals"
            title="Last Minute Deals"
            items={lastMinuteDeals}
            fallbackKey="last-minute-deals"
            CardComponent={LastMinuteDealsCard}
          />

          <PreviewGridSection
            id="new-experiences"
            title="New Experiences"
            items={sidebarTopRated}
            fallbackKey="new-experiences"
            badge="new"
            CardComponent={FeaturedExperiencesCard}
          />

          <PreviewGridSection
            id="top-attractions-nearby"
            title="Top Attractions Nearby"
            items={attractionsNearby}
            fallbackKey="attractions"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
