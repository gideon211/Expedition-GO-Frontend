import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronUp } from "lucide-react";
import { DestinationsSection } from "@/components/homepage/DestinationsSection";
import { Footer } from "@/components/homepage/Footer";
import { HeroSection } from "@/components/homepage/HeroSection";
import { Navbar } from "@/components/homepage/Navbar";
import { SidebarPanel } from "@/components/homepage/SidebarPanel";
import { TourCarouselSection } from "@/components/homepage/TourCarouselSection";
import { NewsletterSection } from "@/components/homepage/NewsletterSection";
import { FeaturesSection } from "@/components/homepage/FeaturesSection";
import { HomePageSkeleton } from "@/components/homepage/skeletons/HomePageSkeleton";
import { leisureTours, pickupTours, recommendedTours, topRatedTours } from "@/components/homepage/data";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";
import { AuthModal } from "@/components/ui/auth-modal";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useHomePageData } from "@/hooks/useHomePageData";

function HomePageContent() {
  const { isAuthModalOpen, closeAuthModal } = useAuthModal();
  const { t } = useTranslation();
  const { isLoading } = useHomePageData();
  const [sharedHeroDateRange, setSharedHeroDateRange] = useState({ from: null, to: null });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showCompactSearch, setShowCompactSearch] = useState(false);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shouldShow = scrollY > 480;
      setShowScrollTop((prev) => prev !== shouldShow ? shouldShow : prev);
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isLoading) {
    return <HomePageSkeleton />;
  }

  return (
    <>
      <div className="min-h-screen bg-[color:var(--page-bg)] text-slate-900 overflow-x-hidden">
        <Navbar
          sharedDateRange={sharedHeroDateRange}
          onSharedDateRangeChange={setSharedHeroDateRange}
          forceShowCompactSearch={showCompactSearch}
        />
        {/* Navbar spacer - only on desktop where search moves to navbar */}
        <div className={`hidden lg:block lg:h-[104px]`} />
        {/* Mobile spacer - for fixed search bar at top */}
        <div className={`lg:hidden ${showCompactSearch ? 'h-[52px]' : 'h-0'}`} />
        <HeroSection
          sharedDateRange={sharedHeroDateRange}
          onSharedDateRangeChange={setSharedHeroDateRange}
          onSearchBarVisibilityChange={setShowCompactSearch}
        />

        <main className="mx-auto max-w-[1520px] px-4 pb-[3.4rem] sm:px-6 sm:pb-14 overflow-hidden">
          <div className="grid gap-[2.125rem] md:gap-8 xl:gap-7 xl:grid-cols-[minmax(0,1fr)_430px]">
            <div className="space-y-[1.7rem] pt-[1.4875rem] min-w-0 md:space-y-6 md:pt-6 xl:space-y-5 xl:pt-5">
              <TourCarouselSection id="tours" title={t('sections.featuredTitle')} items={pickupTours} />
              <div className="space-y-[1.7rem] pt-0 md:space-y-6 md:pt-4 xl:space-y-4 xl:pt-5">
                <DestinationsSection />
                <TourCarouselSection id="recommended" title={t('sections.recommendedTitle')} items={recommendedTours} />
                <TourCarouselSection id="deals" title={t('sections.topRatedTitle')} items={topRatedTours} />
                <TourCarouselSection id="leisure" title={t('sections.likelyToSellOut')} items={leisureTours} />
              </div>
            </div>
            <div className="pt-[1.7rem] min-w-0 md:pt-6 xl:pt-4">
              <SidebarPanel />
            </div>
          </div>
        </main>

        {/* Newsletter Section - Full Width */}
        <div className="mx-auto max-w-[1520px] px-4 sm:px-6 mb-[3.4rem] md:mb-14 overflow-hidden">
          <NewsletterSection />
        </div>

        {/* Features Section - Full Width before footer */}
        <div className="mx-auto max-w-[1520px] px-4 sm:px-6 mb-[3.4rem] md:mb-14 overflow-hidden">
          <FeaturesSection />
        </div>

        <Footer />
        {showScrollTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-5 right-5 z-[60] grid size-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-md transition hover:-translate-y-0.5 hover:bg-slate-50"
            aria-label="Scroll to top"
          >
            <ChevronUp className="size-5" />
          </button>
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  );
}

function HomePage() {
  return (
    <AuthModalProvider>
      <RecentlyViewedProvider>
        <HomePageContent />
      </RecentlyViewedProvider>
    </AuthModalProvider>
  );
}

export default HomePage;
