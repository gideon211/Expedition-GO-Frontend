/**
 * @file HomePageSkeleton.jsx
 * @description Full-page loading skeleton shown during HomePage initial load.
 *
 * @see hooks/useHomePageData.js — controls when skeleton is shown
 */
import { Navbar } from "@/components/homepage/Navbar";
import { Footer } from "@/components/homepage/Footer";
import { HeroSkeleton } from "./HeroSkeleton";
import { TourCarouselSkeleton, DestinationsSkeleton } from "./SectionSkeleton";
import { CarouselCardsSkeleton } from "./CarouselCardsSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

function InlineSectionSkeleton({ titleWidth = "w-56", delay = 0 }) {
  return (
    <section className="py-4 md:py-4 xl:py-5">
      <div className="section-header-row mb-[0.6375rem] flex items-start justify-between gap-4 md:mb-2.5 xl:mb-3">
        <div className="min-w-0 flex-1">
          <Skeleton className={`h-7 ${titleWidth}`} delay={delay} />
        </div>
        <div className="section-header-actions">
          <Skeleton className="h-5 w-20" delay={delay + 20} />
          <div className="section-header-scroll-arrows">
            <Skeleton className="size-8 rounded-full" delay={delay + 30} />
            <Skeleton className="size-8 rounded-full" delay={delay + 30} />
          </div>
        </div>
      </div>
      <CarouselCardsSkeleton delay={delay + 40} cardWidth={280} gap={12} />
    </section>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="min-h-[100svh] min-h-screen overflow-x-hidden bg-[color:var(--page-bg)] pb-[env(safe-area-inset-bottom,0)] text-slate-900 supports-[min-height:100dvh]:min-h-[100dvh]">
      <Navbar />
      <div className="h-0 lg:hidden" />
      <HeroSkeleton />

      <main className="mx-auto w-full max-w-[1520px] overflow-x-hidden px-4 pb-14 sm:px-6 lg:px-8">
        <div className="min-w-0 space-y-6 pt-6 md:space-y-6 md:pt-6 xl:space-y-5 xl:pt-5">
          <TourCarouselSkeleton delay={0} />
          <DestinationsSkeleton delay={50} />
          <TourCarouselSkeleton delay={100} />
          <TourCarouselSkeleton delay={150} />
          <TourCarouselSkeleton delay={200} />
          <InlineSectionSkeleton titleWidth="w-52" delay={250} />
          <InlineSectionSkeleton titleWidth="w-48" delay={320} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
