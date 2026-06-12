/**
 * @file HeroSection.jsx
 * @description Homepage hero with search bar, destination carousel, and stats.
 *   Search navigates to /tours with query params. Uses heroStats from data.js.
 */
import { MapPin, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useNavigationLoader } from "@/contexts/NavigationContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeroTourCard } from "./HeroTourCard";
import { heroStats } from "./data";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { useSearchAutocomplete } from "@/hooks/useSearchAutocomplete";
import { SearchAutocomplete } from "./SearchAutocomplete";
import { HeroImageCarousel } from "./HeroImageCarousel";

export function HeroSection({
  _sharedDateRange,
  _onSharedDateRangeChange,
  externalSearchQuery,
  onExternalSearchChange,
}) {
  const { t } = useTranslation();
  const { navigateWithLoader } = useNavigationLoader();
  const [_currentIndex, _setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [heroSearchSticky, setHeroSearchSticky] = useState(false);
  const scrollContainerRef = useRef(null);
  const desktopScrollRef = useRef(null);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const { recentlyViewed } = useRecentlyViewed();
  const isExternalSearchMode = typeof onExternalSearchChange === "function";
  const activeSearchQuery = isExternalSearchMode ? (externalSearchQuery ?? "") : searchQuery;
  
  // Get search results
  const searchResults = useSearchAutocomplete(activeSearchQuery);

  // Carousel setup - Simple finite scroll
  const carouselItems = recentlyViewed.length > 0 ? recentlyViewed : [];

  const _cardWidth = 280; // Horizontal card width
  const _gap = 12;
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = useCallback(() => {
    const container = desktopScrollRef.current;
    if (container) {
      setIsOverflowing(container.scrollWidth > container.clientWidth + 2);
    }
  }, []);

  useLayoutEffect(() => {
    checkOverflow();
  }, [carouselItems.length, checkOverflow]);

  useLayoutEffect(() => {
    const container = desktopScrollRef.current;
    if (!container) return;
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(container);
    return () => observer.disconnect();
  }, [checkOverflow]);

  // Simple scroll function for finite carousel
  const scroll = (direction) => {
    const container = desktopScrollRef.current;
    if (!container) return;

    const scrollAmount = 320;
    const currentScroll = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;

    if (direction === "left") {
      const newScrollPosition = Math.max(0, currentScroll - scrollAmount);
      container.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      });
    } else {
      const newScrollPosition = Math.min(maxScroll, currentScroll + scrollAmount);
      container.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (activeSearchQuery.trim()) {
      navigateWithLoader(`/tours?search=${encodeURIComponent(activeSearchQuery.trim())}`);
      setShowAutocomplete(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (isExternalSearchMode) {
      onExternalSearchChange(value);
      return;
    }
    setSearchQuery(value);
  };

  const handleAutocompleteSelect = () => {
    setShowAutocomplete(false);
  };

  // Track autocomplete position using the full search bar width
  const [autocompletePos, setAutocompletePos] = useState({ top: 0, left: 0, width: 0 });
  useEffect(() => {
    if (!showAutocomplete) return;
    const updatePosition = () => {
      const bar = document.getElementById("hero-search-bar");
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      setAutocompletePos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    };
    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showAutocomplete, activeSearchQuery]);

  // Handle click outside to close autocomplete
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target) &&
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target)
      ) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close hero autocomplete on scroll so the navbar autocomplete takes over
  useEffect(() => {
    const close = () => {
      setShowAutocomplete(false);
      setHeroSearchSticky(document.body.classList.contains("hero--search-sticky"));
    };
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, []);

  // Show autocomplete when there are results
  useEffect(() => {
    if (activeSearchQuery.trim().length >= 2 && searchResults.total > 0) {
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  }, [activeSearchQuery, searchResults.total]);

  return (
    <>
    <section
      id="home"
      className="relative z-10 min-h-[50vh] sm:min-h-[52vh] md:min-h-[50vh] lg:min-h-[52vh] xl:min-h-[60vh] flex items-start pt-[12vh] overflow-visible bg-(--brand-green) text-white pb-4"
    >
      <HeroImageCarousel />

      <div className="relative mx-auto w-full max-w-[1520px] px-2 py-10 sm:px-4 sm:py-14 md:py-16 overflow-visible">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex justify-center" />

          {/* Hero Content */}
          <div className="hero-content-wrap">
            <h1
              className="mt-4 mx-auto text-center text-white drop-shadow-[0_6px_20px_rgba(0,0,0,0.55)] whitespace-nowrap overflow-hidden text-ellipsis w-full max-w-none px-2"
              style={{
                fontFamily: 'var(--font-hero)',
                fontWeight: 700,
                fontSize: 'clamp(1.75rem, 4.5vw, 2.75rem)',
                lineHeight: 'clamp(2rem, 5vw, 3rem)',
                letterSpacing: '0px'
              }}
            >
              {t('hero.title')}
            </h1>
            <p
              className="mt-1 text-white/92 drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)] px-2 whitespace-nowrap"
              style={{
                fontFamily: 'GT Eesti Pro Display, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(11px, 3.5vw, 24px)',
                lineHeight: 'clamp(16px, 4.5vw, 30px)',
                letterSpacing: '0px'
              }}
            >
              {t('hero.subtitle')}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-green)]" />
              <p className="text-xs font-medium tracking-wide text-white/80">
                {t("hero.availability")}
              </p>
            </div>
          </div>

          {/* Hero Search Bar */}
          <div className="hero-search-wrap relative z-10 mt-4 sm:mt-3.5 md:mt-4 mx-auto w-full max-w-4xl lg:max-w-2xl">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div
                id="hero-search-bar"
                className="grid w-full gap-0 rounded-lg border border-slate-200 bg-white sm:grid-cols-[1fr_auto] grid-cols-[1fr_auto] shadow-md mx-auto"
              >
                <div className="flex items-center gap-2 text-left text-slate-900 px-2 py-1.5">
                  <MapPin className="text-(--brand-green) shrink-0 size-3" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[9px] sm:text-[10px] mb-0">
                      {t('hero.destination')}
                    </p>
                    <Input
                      ref={searchInputRef}
                      value={activeSearchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => activeSearchQuery.trim().length >= 2 && searchResults.total > 0 && setShowAutocomplete(true)}
                      className="h-auto border-0 px-1 py-0 text-[11px] sm:text-[11px] text-slate-900 placeholder:text-slate-400 shadow-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      style={{
                        caretColor: '#01311a',
                        outline: 'none',
                        textAlign: 'left'
                      }}
                      placeholder={t('hero.destinationPlaceholder')}
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="p-1">
                  <Button
                    type="submit"
                    size="sm"
                    className="h-full w-full rounded-lg min-h-7 text-[10px] px-3 sm:min-h-8 sm:text-[11px] sm:px-4"
                  >
                    <Search className="size-2.5 sm:size-3" />
                    {t('hero.search')}
                  </Button>
                </div>
              </div>
              <div ref={autocompleteRef} />
            </form>
          </div>

          {/* Hero Stats */}
          <div className="hero-stats-wrap mt-3 sm:mt-3.5 md:mt-4 hidden md:grid grid-cols-3 gap-2">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-2 backdrop-blur-sm"
              >
                <p className="text-base font-black">{stat.value}</p>
                <p className="mt-0.5 text-[10px] text-white/70">
                  {t(`stats.${stat.translationKey}`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Viewed Carousel */}
        {carouselItems.length > 0 && (
          <div className="hero-carousel-wrap mt-4 sm:mt-5 md:mt-6 overflow-visible">
            <h2
              className="mb-3 text-center font-semibold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
              style={{ fontSize: 'clamp(15px, 2.5vw, 16px)' }}
            >
              {t('sections.pickupTitle')}
            </h2>
            <div className="overflow-visible">
              <div className="mx-auto hidden w-full max-w-full items-center gap-2 px-1 sm:gap-3 md:flex lg:gap-4">
                {isOverflowing && (
                  <button
                    type="button"
                    onClick={() => scroll("left")}
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-white/95 text-slate-900 shadow-lg backdrop-blur-sm transition hover:scale-110 hover:bg-white"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                )}
                <div
                  ref={desktopScrollRef}
                  className="relative z-[3] flex min-w-0 flex-1 gap-3 overflow-x-auto overflow-y-hidden pb-6 scrollbar-hide"
                  style={{
                    WebkitOverflowScrolling: "touch",
                    scrollSnapType: "x mandatory",
                    justifyContent: isOverflowing ? "flex-start" : "center",
                  }}
                >
                  {carouselItems.map((item, index) => (
                    <div
                      key={`${item.title}-${index}-desktop`}
                      className="w-[280px] min-w-[280px] shrink-0"
                      style={{ scrollSnapAlign: isOverflowing ? "start" : "none" }}
                    >
                      <HeroTourCard {...item} disableTracking={true} />
                    </div>
                  ))}
                </div>
                {isOverflowing && (
                  <button
                    type="button"
                    onClick={() => scroll("right")}
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-white/95 text-slate-900 shadow-lg backdrop-blur-sm transition hover:scale-110 hover:bg-white"
                    aria-label="Next"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                )}
              </div>
              <div
                ref={scrollContainerRef}
                className="relative z-[3] md:hidden overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <div className="flex gap-3 px-4">
                  {carouselItems.map((item, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      className="w-[280px] shrink-0 snap-start"
                    >
                      <HeroTourCard {...item} disableTracking={true} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
    {showAutocomplete && !heroSearchSticky &&
      !document.body.classList.contains("hero--search-sticky") &&
      createPortal(
        <div
          ref={autocompleteRef}
          style={{
            position: "fixed",
            top: autocompletePos.top,
            left: autocompletePos.left,
            width: autocompletePos.width,
            zIndex: 9999,
          }}
        >
          <SearchAutocomplete
            results={searchResults}
            onSelect={handleAutocompleteSelect}
            isVisible={showAutocomplete}
            searchQuery={activeSearchQuery}
          />
        </div>,
        document.body,
      )}
    </>
  );
}