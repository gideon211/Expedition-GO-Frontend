/**
 * @file HomePage.jsx
 * @description Main landing route (/). Composes homepage sections and handles
 *   post-auth splash → skeleton loading handoff.
 *
 * Section order: Navbar → Hero → New Experiences → Destinations → Recommended →
 *   Top Rated → Featured → Likely to Sellout → Last Minute Deals → Newsletter →
 *   Features → Reviews → Supplier CTA → Explore More → Footer
 *
 * Local providers: AuthModalProvider, RecentlyViewedProvider (page-scoped)
 * Loading: useHomePageData gate + HomePageSkeleton; post-auth uses BrandLoader splash
 *
 * @see hooks/useHomePageData.js — skeleton timing logic
 * @see App.jsx — route definition
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useNavigationLoader } from "@/contexts/NavigationContext";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { DestinationsSection } from "@/components/homepage/DestinationsSection";
import { Footer } from "@/components/homepage/Footer";
import { HeroSection } from "@/components/homepage/HeroSection";
import { Navbar } from "@/components/homepage/Navbar";
import { TourCarouselSection } from "@/components/homepage/TourCarouselSection";
import { NewsletterSection } from "@/components/homepage/NewsletterSection";
import { FeaturesSection } from "@/components/homepage/FeaturesSection";
import { ReviewsCarousel } from "@/components/homepage/ReviewsCarousel";
import { SupplierSection } from "@/components/homepage/SupplierSection";
import { ExploreMoreSection } from "@/components/homepage/ExploreMoreSection";
import { HomePageSkeleton } from "@/components/homepage/skeletons/HomePageSkeleton";
import BrandLoader from "@/components/ui/BrandLoader";
import { SectionHeading } from "@/components/homepage/SectionHeading";
import { CompactTourCard } from "@/components/homepage/CompactTourCard";
import { SidebarDealCard } from "@/components/homepage/SidebarDealCard";
import { pickupTours, recommendedTours, topRatedTours, leisureTours, lastMinuteDeals, sidebarTopRated } from "@/components/homepage/data";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";
import { AuthModal } from "@/components/ui/auth-modal";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useHomePageData } from "@/hooks/useHomePageData";
import { CarouselClipTrack } from "@/components/ui/CarouselClipTrack";
import { useAllTours } from "@/hooks/useAllTours";

/** Post–sign-in/register handoff: show brand splash, stay under ~1200ms. */
const POST_AUTH_SPLASH_MS = 700;

function HomePageContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { navigateWithLoader } = useNavigationLoader();
  const { isAuthModalOpen, closeAuthModal } = useAuthModal();
  const { t } = useTranslation();
  const [skipInitialHomeDelay] = useState(() =>
    Boolean(location.state?.skipHomeSkeletonDelay || location.state?.showQuickHomeSkeleton),
  );
  const [showPostAuthSplash] = useState(() => Boolean(location.state?.postAuthSplash));
  const [authHandoffId] = useState(() =>
    typeof location.state?.handoffId === "number" && Number.isFinite(location.state.handoffId)
      ? location.state.handoffId
      : null,
  );
  const [splashKind] = useState(() => location.state?.splashKind ?? "signin");
  const [splashVisible, setSplashVisible] = useState(() => Boolean(location.state?.postAuthSplash));
  /** Home fetch waits until splash ends so skeleton can run after splash (not during). */
  const homeDataEnabled = !showPostAuthSplash || !splashVisible;
  const homeLoad = useHomePageData({
    skipInitialDelay: skipInitialHomeDelay,
    enabled: homeDataEnabled,
    handoffNonce: authHandoffId,
    postAuthHandoff: authHandoffId != null,
  });
  /** Use fetchStatus + fresh handoff nonce so skeleton does not disappear when TanStack skips isLoading during cache quirks. */
  const categories = homeLoad.data?.categories || {};
  const apiDestinations = homeLoad.data?.destinations || [];
  const categoryKeys = Object.keys(categories).filter(
    (key) => key.toLowerCase() !== "cultural" && key.toLowerCase() !== "wildlife"
  );
  const MIN_SLOT_ITEMS = 8;
  const MIN_SLOT_IDS = [categoryKeys[0], categoryKeys[1], categoryKeys[2], categoryKeys[3]];
  const FALLBACK_SLOTS = [pickupTours, recommendedTours, topRatedTours, leisureTours];
  const FALLBACK_KEYS = ["tours", "recommended", "deals", "leisure"];
  function padItems(items, fallback) {
    if (items.length >= MIN_SLOT_ITEMS) return items;
    const needed = MIN_SLOT_ITEMS - items.length;
    return [...items, ...fallback.slice(0, needed)];
  }
  const carouselSlots = (() => {
    if (categoryKeys.length > 0) {
      const slots = [];
      const addSlot = (keyIndex, title, items) => {
        if (!items?.length) return;
        const id = MIN_SLOT_IDS[keyIndex] ?? `slot-${keyIndex}`;
        const fallback = FALLBACK_SLOTS[keyIndex];
        slots.push({ id, title, fallbackKey: FALLBACK_KEYS[keyIndex], items: padItems([...items], fallback) });
      };
      addSlot(0, t('sections.featuredTitle'), categories[categoryKeys[0]]);
      if (categoryKeys[1]) addSlot(1, t('sections.recommendedTitle'), categories[categoryKeys[1]]);
      if (categoryKeys[2]) addSlot(2, t('sections.topRatedTitle'), categories[categoryKeys[2]]);
      if (categoryKeys[3]) addSlot(3, t('sections.likelyToSellOut'), categories[categoryKeys[3]]);
      if (categoryKeys.length < 4 && leisureTours.length > 0) {
        slots.push({ id: "leisure", title: t('sections.likelyToSellOut'), fallbackKey: "leisure", items: padItems([...leisureTours], topRatedTours) });
      }
      return slots;
    }
    return [
      ...(pickupTours.length > 0 ? [{ id: "tours", title: t('sections.featuredTitle'), fallbackKey: "tours", items: padItems([...pickupTours], recommendedTours) }] : []),
      ...(recommendedTours.length > 0 ? [{ id: "recommended", title: t('sections.recommendedTitle'), fallbackKey: "recommended", items: padItems([...recommendedTours], topRatedTours) }] : []),
      ...(topRatedTours.length > 0 ? [{ id: "deals", title: t('sections.topRatedTitle'), fallbackKey: "deals", items: padItems([...topRatedTours], leisureTours) }] : []),
      ...(leisureTours.length > 0 ? [{ id: "leisure", title: t('sections.likelyToSellOut'), fallbackKey: "leisure", items: padItems([...leisureTours], pickupTours) }] : []),
    ];
  })();

  const extraSlots = categoryKeys.slice(4).map((key) => ({
    id: key,
    title: key,
    items: categories[key] || [],
  })).filter(slot => slot.items.length > 0);
  const allCarouselSlots = [...carouselSlots, ...extraSlots];

  const homeReady =
    homeDataEnabled &&
    Boolean(homeLoad.data?.loaded) &&
    homeLoad.fetchStatus !== "fetching";
  const showLogoutToast = Boolean(location.state?.showLogoutToast);
  const { data: newToursData } = useAllTours({
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: 12,
    enabled: true,
  });
  const rawNewTours = newToursData?.tours?.length > 0 ? newToursData.tours : [...sidebarTopRated, ...sidebarTopRated];
  const newTours = rawNewTours.length < MIN_SLOT_ITEMS ? [...rawNewTours, ...sidebarTopRated.slice(0, MIN_SLOT_ITEMS - rawNewTours.length)] : rawNewTours;
  const [sharedHeroDateRange, setSharedHeroDateRange] = useState({ from: null, to: null });
  const [sharedSearchQuery, setSharedSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showCompactSearch, setShowCompactSearch] = useState(false);

  const CAROUSEL_SCROLL_MS = 260;
  const scrollRafRef = useRef({});
  function smoothScrollTo(element, target) {
    if (scrollRafRef.current[element] != null) {
      cancelAnimationFrame(scrollRafRef.current[element]);
    }
    const originalSnap = element.style.scrollSnapType;
    if (originalSnap) element.style.scrollSnapType = "none";
    const start = element.scrollLeft;
    const distance = target - start;
    if (Math.abs(distance) < 1) {
      if (originalSnap) element.style.scrollSnapType = originalSnap;
      return;
    }
    let startTime = null;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / CAROUSEL_SCROLL_MS, 1);
      element.scrollLeft = start + distance * easeOutCubic(progress);
      if (progress < 1) {
        scrollRafRef.current[element] = requestAnimationFrame(step);
      } else {
        scrollRafRef.current[element] = null;
        if (originalSnap) element.style.scrollSnapType = originalSnap;
      }
    };
    scrollRafRef.current[element] = requestAnimationFrame(step);
  }
  const dealsScrollRef = useRef(null);
  const experiencesScrollRef = useRef(null);
  const scrollDeals = useCallback((direction) => {
    const container = dealsScrollRef.current;
    if (!container) return;
    const amount = 280 + 12;
    const target = container.scrollLeft + (direction === "left" ? -amount : amount);
    smoothScrollTo(container, target);
  }, []);
  const scrollExperiences = useCallback((direction) => {
    const container = experiencesScrollRef.current;
    if (!container) return;
    const amount = 280 + 12;
    const target = container.scrollLeft + (direction === "left" ? -amount : amount);
    smoothScrollTo(container, target);
  }, []);

  useEffect(() => {
    if (!showPostAuthSplash) {
      return;
    }
    const id = window.setTimeout(() => setSplashVisible(false), POST_AUTH_SPLASH_MS);
    return () => window.clearTimeout(id);
  }, [showPostAuthSplash]);

  useEffect(() => {
    if (!location.state?.skipHomeSkeletonDelay && !location.state?.postAuthSplash) {
      return;
    }

    navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true, state: null });
  }, [
    location.state?.skipHomeSkeletonDelay,
    location.state?.postAuthSplash,
    navigate,
    location.pathname,
    location.search,
    location.hash,
  ]);

  const authSplashBlocking = showPostAuthSplash && splashVisible;

  useEffect(() => {
    if (!showLogoutToast || !homeReady || authSplashBlocking) {
      return;
    }

    toast.success("successfully logged out", {
      id: "logout-success-toast",
      position: "top-center",
      duration: 3500,
    });
    navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true, state: null });
  }, [
    showLogoutToast,
    homeReady,
    authSplashBlocking,
    navigate,
    location.pathname,
    location.search,
    location.hash,
  ]);

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

  if (showPostAuthSplash && splashVisible) {
    const splashLabel =
      splashKind === "register" ? t("auth.successAccountCreated") : t("auth.successWelcomeBack");
    return (
      <div
        className="fixed inset-0 z-[120] flex cursor-pointer flex-col items-center justify-center bg-white"
        onClick={() => setSplashVisible(false)}
      >
        <BrandLoader fullScreen={false} splash label={splashLabel} />
        <p className="mt-6 text-xs font-medium tracking-wide text-slate-400 uppercase">
          Tap anywhere to skip
        </p>
      </div>
    );
  }

  if (!homeReady) {
    return <HomePageSkeleton />;
  }

  return (
    <>
      <div className="min-h-screen bg-[color:var(--page-bg)] text-slate-900 overflow-x-hidden">
        <Navbar
          sharedDateRange={sharedHeroDateRange}
          onSharedDateRangeChange={setSharedHeroDateRange}
          forceShowCompactSearch={showCompactSearch}
          externalSearchQuery={sharedSearchQuery}
          onExternalSearchChange={setSharedSearchQuery}
        />
        {/* Mobile spacer — reserves room for sticky search below the navbar */}
        <div
          className={`lg:hidden overflow-hidden ${
            showCompactSearch ? "h-[var(--mobile-sticky-search-height,3.25rem)]" : "h-0"
          }`}
          aria-hidden
        />
        <HeroSection
          sharedDateRange={sharedHeroDateRange}
          onSharedDateRangeChange={setSharedHeroDateRange}
          onSearchBarVisibilityChange={setShowCompactSearch}
          externalSearchQuery={sharedSearchQuery}
          onExternalSearchChange={setSharedSearchQuery}
        />

        <main className="mx-auto max-w-[1520px] overflow-x-hidden px-4 pb-14 sm:px-6 lg:px-8">
          <div className="space-y-6 pt-6 min-w-0 md:space-y-6 md:pt-6 xl:space-y-5 xl:pt-5">
            {/* 1. Recommended For You */}
            {carouselSlots[1] && <TourCarouselSection key={carouselSlots[1].id} {...carouselSlots[1]} />}

            {/* 2. Popular Destinations */}
            <DestinationsSection apiDestinations={apiDestinations} />

            {/* 3. Top Rated By Travellers */}
            {carouselSlots[2] && <TourCarouselSection key={carouselSlots[2].id} {...carouselSlots[2]} />}

            {/* 4. Likely to Sellout */}
            {carouselSlots[3] && <TourCarouselSection key={carouselSlots[3].id} {...carouselSlots[3]} />}

            {/* 5. Featured Experiences */}
            {carouselSlots[0] && <TourCarouselSection key={carouselSlots[0].id} {...carouselSlots[0]} />}

            {/* Extra carousel slots */}
            {extraSlots.map((slot) => (
              <TourCarouselSection key={slot.id} id={slot.id} title={slot.title} items={slot.items} />
            ))}

            {/* 6. Last Minute Deals */}
            <section className="py-4 md:py-4 xl:py-5">
              <div className="section-header-row relative z-30 isolate mb-[0.6375rem] flex items-start justify-between gap-4 md:mb-2.5 xl:mb-3">
                <div className="min-w-0 flex-1">
                  <h2
                    className="truncate font-bold tracking-tight text-slate-900 leading-[1.15]"
                    style={{ fontSize: 'clamp(1.2rem, 1.2vw + 0.5rem, 1.375rem)' }}
                    title={t('sections.lastMinuteDeals')}
                  >
                    {t('sections.lastMinuteDeals')}
                  </h2>
                </div>
                <div className="section-header-actions">
                  <Link
                    to={`/tours?category=last-minute-deals&title=${encodeURIComponent(t('sections.lastMinuteDeals'))}`}
                    onClick={(e) => {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: "auto" });
                      navigateWithLoader(`/tours?category=last-minute-deals&title=${encodeURIComponent(t('sections.lastMinuteDeals'))}`);
                    }}
                    className="group relative inline-flex min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center gap-1 whitespace-nowrap rounded-md py-2 pl-2 pr-1.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-100/90 hover:text-slate-950 sm:text-[13px] lg:min-h-0 lg:min-w-0 lg:py-1.5 lg:px-2 lg:text-[14px]"
                  >
                    <span className="relative">
                      {t('sections.viewAll')}
                      <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[color:var(--brand-green)] transition-all duration-300 group-hover:w-full" />
                    </span>
                    <ChevronRight className="size-4 text-slate-500 transition group-hover:text-[color:var(--brand-green)]" />
                  </Link>
                  <div className="section-header-scroll-arrows">
                    <button
                      onClick={() => scrollDeals("left")}
                      className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      onClick={() => scrollDeals("right")}
                      className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
              <CarouselClipTrack
                ref={dealsScrollRef}
                cardWidth={280}
                gap={12}
                syncSectionClipWidth
                trackClassName="gap-3 overflow-x-auto xl:overflow-x-hidden overflow-y-hidden overscroll-x-contain pb-1 scrollbar-hide"
              >
                {lastMinuteDeals.map((deal, index) => (
                  <div key={`${deal.title}-${index}`} className="w-[280px] shrink-0 h-full" style={{ scrollSnapAlign: "start" }}>
                    <SidebarDealCard {...deal} />
                  </div>
                ))}
              </CarouselClipTrack>
            </section>

            {/* 7. New Experiences */}
            <section className="py-4 md:py-4 xl:py-5">
              <div className="section-header-row relative z-30 isolate mb-[0.6375rem] flex items-start justify-between gap-4 md:mb-2.5 xl:mb-3">
                <div className="min-w-0 flex-1">
                  <h2
                    className="truncate font-bold tracking-tight text-slate-900 leading-[1.15]"
                    style={{ fontSize: 'clamp(1.2rem, 1.2vw + 0.5rem, 1.375rem)' }}
                    title={t('sections.newExperiences')}
                  >
                    {t('sections.newExperiences')}
                  </h2>
                </div>
                <div className="section-header-actions">
                  <Link
                    to={`/tours?category=new-experiences&title=${encodeURIComponent(t('sections.newExperiences'))}`}
                    onClick={(e) => {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: "auto" });
                      navigateWithLoader(`/tours?category=new-experiences&title=${encodeURIComponent(t('sections.newExperiences'))}`);
                    }}
                    className="group relative inline-flex min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center gap-1 whitespace-nowrap rounded-md py-2 pl-2 pr-1.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-100/90 hover:text-slate-950 sm:text-[13px] lg:min-h-0 lg:min-w-0 lg:py-1.5 lg:px-2 lg:text-[14px]"
                  >
                    <span className="relative">
                      {t('sections.viewAll')}
                      <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[color:var(--brand-green)] transition-all duration-300 group-hover:w-full" />
                    </span>
                    <ChevronRight className="size-4 text-slate-500 transition group-hover:text-[color:var(--brand-green)]" />
                  </Link>
                  <div className="section-header-scroll-arrows">
                    <button
                      onClick={() => scrollExperiences("left")}
                      className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      onClick={() => scrollExperiences("right")}
                      className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
              <CarouselClipTrack
                ref={experiencesScrollRef}
                cardWidth={280}
                gap={12}
                syncSectionClipWidth
                trackClassName="gap-3 overflow-x-auto xl:overflow-x-hidden overflow-y-hidden overscroll-x-contain pb-1 scrollbar-hide"
              >
                {newTours.map((tour, index) => (
                  <div key={`${tour.title}-${index}`} className="w-[280px] shrink-0 h-full" style={{ scrollSnapAlign: "start" }}>
                    <CompactTourCard {...tour} badge="new" />
                  </div>
                ))}
              </CarouselClipTrack>
            </section>
          </div>
        </main>

        {/* Newsletter Section - Full Width */}
        <div className="mx-auto max-w-[1520px] px-4 sm:px-6 mb-14 overflow-hidden">
          <NewsletterSection />
        </div>

        {/* Features Section - Full Width before footer */}
        <div className="mx-auto mb-14 max-w-[1520px] px-4 sm:px-6">
          <FeaturesSection />
        </div>

        <div className="mb-14">
          <ReviewsCarousel />
        </div>

        <div className="mb-14">
          <SupplierSection />
        </div>

        <div className="mb-14">
          <ExploreMoreSection />
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
