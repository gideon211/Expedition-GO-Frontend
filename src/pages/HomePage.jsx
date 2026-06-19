/**
 * @file HomePage.jsx
 * @description Main landing route (/). Composes homepage sections and handles
 *   post-auth splash → skeleton loading handoff.
 *
 * Section order: Navbar → Hero → Continue Planning → Todo → Recommended → Destinations → Top Rated → Featured → Extra Categories →
 *   Last Minute Deals → New Experiences → Top Attractions Nearby → Newsletter →
 *   Features → Reviews → Explore More → Footer
 *
 * Local providers: AuthModalProvider, RecentlyViewedProvider (page-scoped)
 * Loading: real page layout with skeleton cards while API fetches; post-auth uses BrandLoader splash
 *
 * @see hooks/useHomePageData.js — skeleton timing logic
 * @see App.jsx — route definition
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useNavigationLoader } from '@/contexts/NavigationContext';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { DestinationsSection } from '@/components/homepage/DestinationsSection';
import { Footer } from '@/components/homepage/Footer';
import { HeroSection } from '@/components/homepage/HeroSection';
import { Navbar } from '@/components/homepage/Navbar';
import { TourCarouselSection } from '@/components/homepage/TourCarouselSection';
import { TopAttractionsNearby } from '@/components/homepage/TopAttractionsNearby';
import { NewsletterSection } from '@/components/homepage/NewsletterSection';
import { FeaturesSection } from '@/components/homepage/FeaturesSection';
import { DiscoverExperiencesSection } from '@/components/homepage/DiscoverExperiencesSection';
import { TodoSection } from '@/components/homepage/TodoSection';
import { NewsArticlesSection } from '@/components/homepage/NewsArticlesSection';
import { ReviewsCarousel } from '@/components/homepage/ReviewsCarousel';
import { Skeleton } from '@/components/ui/skeleton';
import { CarouselCardsSkeleton } from '@/components/homepage/skeletons/CarouselCardsSkeleton';
import BrandLoader from '@/components/ui/BrandLoader';
import { SectionHeading } from '@/components/homepage/SectionHeading';
import { NewExperiencesCard } from '@/components/homepage/NewExperiencesCard';
import { LastMinuteDealsCard } from '@/components/homepage/LastMinuteDealsCard';
import { FeaturedExperiencesCard } from '@/components/homepage/FeaturedExperiencesCard';
import { ContinuePlanningCard } from '@/components/homepage/ContinuePlanningCard';
import { RecommendedExperiencesCard } from '@/components/homepage/RecommendedExperiencesCard';
import { TopRatedExperiencesCard } from '@/components/homepage/TopRatedExperiencesCard';
import {
  pickupTours,
  recommendedTours,
  topRatedTours,
  leisureTours,
  lastMinuteDeals,
  sidebarTopRated,
} from '@/components/homepage/data';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { AuthModal } from '@/components/ui/auth-modal';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useHomePageData } from '@/hooks/useHomePageData';
import { CarouselClipTrack } from '@/components/ui/CarouselClipTrack';
import { useAllTours } from '@/hooks/useAllTours';
import { useRecentlyViewedStorage } from '@/hooks/useRecentlyViewedStorage';

/** Post–sign-in/register handoff: show brand splash, stay under ~1200ms. */
const POST_AUTH_SPLASH_MS = 700;

function LoadingCarouselSection({ title }) {
  return (
    <section className="py-4 md:py-4 xl:py-5">
      <div className="section-header-row mb-[0.6375rem] flex items-start justify-between gap-4 md:mb-2.5 xl:mb-3">
        <div className="min-w-0 flex-1">
          <h2
            className="truncate font-bold tracking-tight text-slate-900 leading-[1.15]"
            style={{ fontSize: 'clamp(1.2rem, 1.2vw + 0.5rem, 1.375rem)' }}
            title={title}
          >
            {title}
          </h2>
        </div>
        <div className="section-header-actions">
          <div className="section-header-scroll-arrows">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="size-8 rounded-full" />
          </div>
        </div>
      </div>
      <CarouselCardsSkeleton cardWidth={280} gap={12} />
    </section>
  );
}

function HomePageContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { navigateWithLoader } = useNavigationLoader();
  const { isAuthModalOpen, closeAuthModal } = useAuthModal();
  const { t } = useTranslation();
  const [skipInitialHomeDelay] = useState(() =>
    Boolean(location.state?.skipHomeSkeletonDelay || location.state?.showQuickHomeSkeleton)
  );
  const [showPostAuthSplash] = useState(() => Boolean(location.state?.postAuthSplash));
  const [authHandoffId] = useState(() =>
    typeof location.state?.handoffId === 'number' && Number.isFinite(location.state.handoffId)
      ? location.state.handoffId
      : null
  );
  const [splashKind] = useState(() => location.state?.splashKind ?? 'signin');
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
  const EXCLUDED_CATEGORIES = new Set([
    'cultural',
    'wildlife',
    'beach',
    'adventure',
    'food & drink',
    'food & drinks',
    'food and drink',
    'food and drinks',
    'food & culinary',
    'food',
  ]);

  function isExcludedCategory(key) {
    if (EXCLUDED_CATEGORIES.has(key)) return true;
    if (key.includes('food') || key.includes('drink') || key.includes('culinary')) return true;
    return false;
  }

  const categoryKeys = Object.keys(categories).filter(
    (key) => !isExcludedCategory(key)
  );
  const MIN_SLOT_ITEMS = 8;
  const MIN_SLOT_IDS = [categoryKeys[0], categoryKeys[1], categoryKeys[2], categoryKeys[3]];
  const FALLBACK_SLOTS = [pickupTours, recommendedTours, topRatedTours, leisureTours];
  const FALLBACK_KEYS = ['tours', 'recommended', 'deals', 'leisure'];
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
        slots.push({
          id,
          title,
          fallbackKey: FALLBACK_KEYS[keyIndex],
          items: padItems([...items], fallback),
        });
      };
      addSlot(0, t('sections.featuredTitle'), categories[categoryKeys[0]]);
      if (categoryKeys[1]) addSlot(1, t('sections.recommendedTitle'), categories[categoryKeys[1]]);
      if (categoryKeys[2]) addSlot(2, t('sections.topRatedTitle'), categories[categoryKeys[2]]);
      if (categoryKeys[3]) addSlot(3, t('sections.likelyToSellOut'), categories[categoryKeys[3]]);
      if (categoryKeys.length < 4 && leisureTours.length > 0) {
        slots.push({
          id: 'leisure',
          title: t('sections.likelyToSellOut'),
          fallbackKey: 'leisure',
          items: padItems([...leisureTours], topRatedTours),
        });
      }
      return slots;
    }
    return [
      ...(pickupTours.length > 0
        ? [
            {
              id: 'tours',
              title: t('sections.featuredTitle'),
              fallbackKey: 'tours',
              items: padItems([...pickupTours], recommendedTours),
            },
          ]
        : []),
      ...(recommendedTours.length > 0
        ? [
            {
              id: 'recommended',
              title: t('sections.recommendedTitle'),
              fallbackKey: 'recommended',
              items: padItems([...recommendedTours], topRatedTours),
            },
          ]
        : []),
      ...(topRatedTours.length > 0
        ? [
            {
              id: 'deals',
              title: t('sections.topRatedTitle'),
              fallbackKey: 'deals',
              items: padItems([...topRatedTours], leisureTours),
            },
          ]
        : []),
      ...(leisureTours.length > 0
        ? [
            {
              id: 'leisure',
              title: t('sections.likelyToSellOut'),
              fallbackKey: 'leisure',
              items: padItems([...leisureTours], pickupTours),
            },
          ]
        : []),
    ];
  })();

  const extraSlots = categoryKeys
    .slice(4)
    .map((key) => ({
      id: key,
      title: key.replace(/\b\w/g, (c) => c.toUpperCase()),
      items: categories[key] || [],
      fallbackKey: key,
    }))
    .filter((slot) => slot.items.length > 0);
  const allCarouselSlots = [...carouselSlots, ...extraSlots];

  const homeReady =
    homeDataEnabled && Boolean(homeLoad.data?.loaded);
  const showLogoutToast = Boolean(location.state?.showLogoutToast);
  const { data: newToursData } = useAllTours({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 12,
    enabled: true,
  });
  const rawNewTours =
    newToursData?.tours?.length > 0 ? newToursData.tours : [...sidebarTopRated, ...sidebarTopRated];
  const newTours =
    rawNewTours.length < MIN_SLOT_ITEMS
      ? [...rawNewTours, ...sidebarTopRated.slice(0, MIN_SLOT_ITEMS - rawNewTours.length)]
      : rawNewTours;
  const [sharedHeroDateRange, setSharedHeroDateRange] = useState({ from: null, to: null });
  const [sharedSearchQuery, setSharedSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { recentlyViewed } = useRecentlyViewedStorage();

  const dealsScrollRef = useRef(null);
  const experiencesScrollRef = useRef(null);
  const continuePlanningScrollRef = useRef(null);
  const scrollDeals = useCallback((direction) => {
    const container = dealsScrollRef.current;
    if (!container) return;
    const amount = 280 + 12;
    const target = container.scrollLeft + (direction === 'left' ? -amount : amount);
    container.scrollTo({ left: target, behavior: 'smooth' });
  }, []);
  const scrollExperiences = useCallback((direction) => {
    const container = experiencesScrollRef.current;
    if (!container) return;
    const amount = 280 + 12;
    const target = container.scrollLeft + (direction === 'left' ? -amount : amount);
    container.scrollTo({ left: target, behavior: 'smooth' });
  }, []);
  const scrollContinuePlanning = useCallback((direction) => {
    const container = continuePlanningScrollRef.current;
    if (!container) return;
    const amount = 380 + 16;
    const target = container.scrollLeft + (direction === 'left' ? -amount : amount);
    container.scrollTo({ left: target, behavior: 'smooth' });
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

    navigate(`${location.pathname}${location.search}${location.hash}`, {
      replace: true,
      state: null,
    });
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

    toast.success('successfully logged out', {
      id: 'logout-success-toast',
      position: 'top-center',
      duration: 3500,
    });
    navigate(`${location.pathname}${location.search}${location.hash}`, {
      replace: true,
      state: null,
    });
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
      setShowScrollTop((prev) => (prev !== shouldShow ? shouldShow : prev));
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
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (showPostAuthSplash && splashVisible) {
    const splashLabel =
      splashKind === 'register' ? t('auth.successAccountCreated') : t('auth.successWelcomeBack');
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
    return (
      <>
        <div className="min-h-screen bg-[color:var(--page-bg)] text-slate-900 overflow-x-hidden">
          <Navbar
            sharedDateRange={sharedHeroDateRange}
            onSharedDateRangeChange={setSharedHeroDateRange}
            externalSearchQuery={sharedSearchQuery}
            onExternalSearchChange={setSharedSearchQuery}
          />

          <HeroSection
            sharedDateRange={sharedHeroDateRange}
            onSharedDateRangeChange={setSharedHeroDateRange}
            externalSearchQuery={sharedSearchQuery}
            onExternalSearchChange={setSharedSearchQuery}
          />

          <main className="mx-auto max-w-[1520px] px-4 pb-14 sm:px-6 lg:px-8">
            <div className="space-y-6 pt-6 min-w-0 md:space-y-6 md:pt-6 xl:space-y-5 xl:pt-5">
              <TodoSection />
              <LoadingCarouselSection title={t('sections.featuredTitle')} />
              <LoadingCarouselSection title={t('sections.recommendedTitle')} />
              <LoadingCarouselSection title={t('sections.topRatedTitle')} />
              <LoadingCarouselSection title={t('sections.likelyToSellOut')} />
            </div>
          </main>

          <Footer />
        </div>

        <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[color:var(--page-bg)] text-slate-900 overflow-x-hidden">
        <Navbar
          sharedDateRange={sharedHeroDateRange}
          onSharedDateRangeChange={setSharedHeroDateRange}
          externalSearchQuery={sharedSearchQuery}
          onExternalSearchChange={setSharedSearchQuery}
        />

        <HeroSection
          sharedDateRange={sharedHeroDateRange}
          onSharedDateRangeChange={setSharedHeroDateRange}
          externalSearchQuery={sharedSearchQuery}
          onExternalSearchChange={setSharedSearchQuery}
        />

        <main className="mx-auto max-w-[1520px] px-4 pb-14 sm:px-6 lg:px-8">
          <div className="space-y-6 pt-6 min-w-0 md:space-y-6 md:pt-6 xl:space-y-5 xl:pt-5">
            {/* Continue Planning Our Trip */}
            {recentlyViewed.length > 0 && (
              <section className="py-4 md:py-4 xl:py-5">
                <div className="section-header-row relative z-30 isolate mb-[0.6375rem] flex items-start justify-between gap-4 md:mb-2.5 xl:mb-3">
                  <div className="min-w-0 flex-1">
                    <h2
                      className="truncate font-bold tracking-tight text-slate-900 leading-[1.15]"
                      style={{ fontSize: 'clamp(1.2rem, 1.2vw + 0.5rem, 1.375rem)' }}
                      title="Continue Planning Your Trip"
                    >
                      Continue Planning Your Trip
                    </h2>
                  </div>
                  <div className="section-header-actions">
                    <div className="section-header-scroll-arrows">
                      <button
                        onClick={() => scrollContinuePlanning('left')}
                        className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
                        aria-label="Scroll left"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <button
                        onClick={() => scrollContinuePlanning('right')}
                        className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
                        aria-label="Scroll right"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div
                  ref={continuePlanningScrollRef}
                  className="flex gap-4 overflow-x-auto xl:overflow-x-hidden overflow-y-hidden overscroll-x-contain scrollbar-hide items-stretch pb-1"
                  style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
                >
                  {recentlyViewed.map((item, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      className="w-[290px] md:w-[380px] shrink-0"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <ContinuePlanningCard {...item} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Todo Section - Mood/Category Selection */}
            <TodoSection />

            {/* 1. Recommended For You */}
            {carouselSlots[1] && (
              <TourCarouselSection
                key={carouselSlots[1].id}
                {...carouselSlots[1]}
                CardComponent={RecommendedExperiencesCard}
              />
            )}

            {/* 2. Popular Destinations */}
            <DestinationsSection apiDestinations={apiDestinations} />

            {/* 3. Top Rated By Travellers */}
            {carouselSlots[2] && (
              <TourCarouselSection
                key={carouselSlots[2].id}
                {...carouselSlots[2]}
                CardComponent={TopRatedExperiencesCard}
              />
            )}

            {/* 4. Likely to Sellout */}
            {carouselSlots[3] && (
              <TourCarouselSection key={carouselSlots[3].id} {...carouselSlots[3]} />
            )}

            {/* 5. Featured Experiences */}
            {carouselSlots[0] && (
              <TourCarouselSection
                key={carouselSlots[0].id}
                {...carouselSlots[0]}
                CardComponent={FeaturedExperiencesCard}
              />
            )}

            {/* Extra carousel slots */}
            {extraSlots.map((slot) => (
              <TourCarouselSection key={slot.id} {...slot} />
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
                      window.scrollTo({ top: 0, behavior: 'auto' });
                      navigateWithLoader(
                        `/tours?category=last-minute-deals&title=${encodeURIComponent(t('sections.lastMinuteDeals'))}`
                      );
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
                      onClick={() => scrollDeals('left')}
                      className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      onClick={() => scrollDeals('right')}
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
                  <div
                    key={`${deal.title}-${index}`}
                    className="w-[280px] shrink-0 h-full"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <LastMinuteDealsCard {...deal} />
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
                      window.scrollTo({ top: 0, behavior: 'auto' });
                      navigateWithLoader(
                        `/tours?category=new-experiences&title=${encodeURIComponent(t('sections.newExperiences'))}`
                      );
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
                      onClick={() => scrollExperiences('left')}
                      className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      onClick={() => scrollExperiences('right')}
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
                  <div
                    key={`${tour.title}-${index}`}
                    className="w-[280px] shrink-0 h-full"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <NewExperiencesCard {...tour} badge="new" />
                  </div>
                ))}
              </CarouselClipTrack>
            </section>

            {/* 8. Top Attractions Nearby */}
            <TopAttractionsNearby />
          </div>
        </main>

        <div className="mx-auto max-w-[1520px] px-4 sm:px-6 mb-14">
          <ReviewsCarousel />
        </div>

        {/* Discover Experiences Section - Tabbed cards */}
        <div className="mx-auto max-w-[1520px] px-4 sm:px-6 mb-14">
          <DiscoverExperiencesSection />
        </div>

        {/* Features Section - Full Width before footer */}
        <div className="mx-auto mb-8 max-w-[1520px] px-4 sm:px-6">
          <FeaturesSection />
        </div>

        {/* Newsletter Section - Full Width */}
        <div className="mx-auto max-w-[1520px] px-4 sm:px-6 mb-14 overflow-hidden">
          <NewsletterSection />
        </div>

        {/* News & Articles Section - Last before footer */}
        <div className="mx-auto max-w-[1520px] px-4 sm:px-6 mb-14">
          <NewsArticlesSection />
        </div>

        <Footer />
        {showScrollTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
      <HomePageContent />
    </AuthModalProvider>
  );
}

export default HomePage;
