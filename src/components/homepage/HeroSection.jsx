
import { MapPin, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroPic from "@/assets/images/hero_pic.jpg";
import { HeroTourCard } from "./HeroTourCard";
import { heroStats } from "./data";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { useSearchAutocomplete } from "@/hooks/useSearchAutocomplete";
import { SearchAutocomplete } from "./SearchAutocomplete";

export function HeroSection({ sharedDateRange, onSharedDateRangeChange, onSearchBarVisibilityChange }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSearchBarSticky, setIsSearchBarSticky] = useState(false);
  const [searchBarHeight, setSearchBarHeight] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const scrollContainerRef = useRef(null);
  const desktopScrollRef = useRef(null);
  const searchBarRef = useRef(null);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const searchBarInitialTop = useRef(null);
  const isScrollingRef = useRef(false);
  const { recentlyViewed } = useRecentlyViewed();
  
  // Get search results
  const searchResults = useSearchAutocomplete(searchQuery);

  // Carousel setup
  const carouselItems = recentlyViewed.length > 0 ? recentlyViewed : [];
  // Triple items for infinite loop
  const infiniteItems = carouselItems.length > 0
    ? [...carouselItems, ...carouselItems, ...carouselItems]
    : [];

  const cardWidth = 280; // Horizontal card width (matches GetYourGuide)
  const gap = 12;
  const singleSetWidth = carouselItems.length * (cardWidth + gap);

  // Desktop infinite scroll nudge (same as TourCarouselSection)
  const nudgeInfiniteLoop = useCallback(() => {
    const container = desktopScrollRef.current;
    if (!container || carouselItems.length === 0 || isScrollingRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 0) return;

    const threshold = cardWidth * 0.5;

    if (scrollLeft <= threshold) {
      isScrollingRef.current = true;
      container.scrollLeft = scrollLeft + singleSetWidth;
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    } else if (scrollLeft >= maxScroll - threshold) {
      isScrollingRef.current = true;
      container.scrollLeft = scrollLeft - singleSetWidth;
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    }
  }, [carouselItems.length, singleSetWidth, cardWidth]);

  // Desktop arrow scroll (same as TourCarouselSection)
  const scroll = (direction) => {
    const container = desktopScrollRef.current;
    if (!container) return;

    const scrollAmount = 320;
    const currentScroll = container.scrollLeft;

    let newScrollPosition;

    if (direction === "left") {
      newScrollPosition = currentScroll - scrollAmount;
      if (newScrollPosition < scrollAmount) {
        container.scrollLeft = singleSetWidth + newScrollPosition;
        return;
      }
    } else {
      newScrollPosition = currentScroll + scrollAmount;
      if (newScrollPosition > singleSetWidth * 2 - scrollAmount) {
        container.scrollLeft =
          singleSetWidth + (newScrollPosition - singleSetWidth * 2);
        return;
      }
    }

    container.scrollTo({
      left: newScrollPosition,
      behavior: "smooth",
    });
  };

  // Initialize desktop scroll position
  useLayoutEffect(() => {
    const el = desktopScrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    el.scrollLeft = Math.min(singleSetWidth, maxScroll);
  }, [singleSetWidth]);

  // Desktop scroll listener
  useEffect(() => {
    const el = desktopScrollRef.current;
    if (!el) return;

    let rafId = null;

    const onScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      rafId = requestAnimationFrame(() => {
        nudgeInfiniteLoop();
        rafId = null;
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      el.removeEventListener("scroll", onScroll);
    };
  }, [nudgeInfiniteLoop]);

  // Mobile infinite scroll handler
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || carouselItems.length === 0) return;

    let isResetting = false;
    let scrollTimeout = null;

    const handleScroll = () => {
      if (isResetting) return;

      // Clear previous timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Debounce the reset check
      scrollTimeout = setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const itemWidth = cardWidth + gap;
        const currentIdx = Math.round(scrollLeft / itemWidth);
        
        // Reset to middle set if at boundaries
        if (currentIdx <= 1 || currentIdx >= carouselItems.length * 2 - 1) {
          isResetting = true;
          
          // Calculate which card we're on in the original set
          const cardInSet = currentIdx % carouselItems.length;
          const middleSetIndex = carouselItems.length + cardInSet;
          
          // Instant jump to middle set
          container.scrollLeft = middleSetIndex * itemWidth;
          
          // Re-enable after a brief delay
          setTimeout(() => {
            isResetting = false;
          }, 100);
        }
      }, 150); // Wait for scroll to settle
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Set initial scroll position to middle set
    container.scrollLeft = carouselItems.length * (cardWidth + gap);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [carouselItems.length, cardWidth, gap]);

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

  // Show autocomplete when there are results
  useEffect(() => {
    if (searchQuery.trim().length >= 2 && searchResults.total > 0) {
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  }, [searchQuery, searchResults.total]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tours?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowAutocomplete(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAutocompleteSelect = () => {
    setShowAutocomplete(false);
    setSearchQuery("");
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!searchBarRef.current) return;
      
      // Capture initial position and height only once when component mounts
      if (searchBarInitialTop.current === null) {
        const rect = searchBarRef.current.getBoundingClientRect();
        searchBarInitialTop.current = rect.top + window.scrollY;
        setSearchBarHeight(rect.height);
      }
      
      const scrollPosition = window.scrollY;
      
      // Unstick 150px before reaching original position for snappier feel
      const threshold = searchBarInitialTop.current - 150;
      const shouldBeSticky = scrollPosition >= threshold;
      
      setIsSearchBarSticky(prev => {
        if (prev !== shouldBeSticky) {
          if (onSearchBarVisibilityChange) {
            onSearchBarVisibilityChange(shouldBeSticky);
          }
          return shouldBeSticky;
        }
        return prev;
      });
    };

    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [onSearchBarVisibilityChange]);

  return (
    <section
      id="home"
      className="relative min-h-[50vh] sm:min-h-[52vh] md:min-h-[50vh] lg:min-h-[52vh] xl:min-h-[60vh] flex items-start pt-[12vh] overflow-visible bg-(--brand-green) text-white pb-8"
    >
      <div className="absolute inset-0">
        <img
          src={heroPic}
          alt="African safari landscape at sunset"
          className="h-full w-full object-cover object-[center_bottom] lg:object-[center_80%] xl:object-center opacity-80"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.5),rgba(0,0,0,0.18)_25%,rgba(122,69,11,0.14)_60%,rgba(0,0,0,0.2)),radial-gradient(circle_at_center,rgba(255,174,58,0.28),transparent_42%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1520px] px-2 py-10 sm:px-4 sm:py-14 md:py-16 overflow-visible">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex justify-center">
          </div>

            <h1
              className="
                mt-4
                mx-auto
                text-center
                text-white
                drop-shadow-[0_6px_20px_rgba(0,0,0,0.55)]
                whitespace-nowrap
                overflow-hidden
                text-ellipsis
                w-full
                max-w-none
                px-2
              "
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
          
          {/* Hero Search Bar - On mobile: becomes fixed at top. On desktop: fades out when reaching navbar */}
          <div 
            className="relative mt-4 sm:mt-3.5 md:mt-4 max-w-4xl mx-auto"
            style={{ minHeight: searchBarHeight > 0 ? `${searchBarHeight}px` : 'auto' }}
          >
            <div 
              ref={searchBarRef}
              className={`${
                isSearchBarSticky 
                  ? 'fixed top-0 left-0 right-0 z-60 px-3 py-2 lg:opacity-0 lg:pointer-events-none lg:static lg:px-0 lg:py-0' 
                  : 'static opacity-100'
              }`}
            >
              <form
                onSubmit={handleSearchSubmit}
                className="relative"
              >
                <div
                  id="hero-search-bar"
                  className="grid gap-0 rounded-lg border border-slate-200 bg-white sm:grid-cols-[1fr_auto] grid-cols-[1fr_auto] shadow-md max-w-4xl mx-auto"
                >
                  <div className="flex items-center gap-2 text-left text-slate-900 px-2 py-1.5">
                    <MapPin className="text-(--brand-green) shrink-0 size-3" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[9px] sm:text-[10px] mb-0">
                        {t('hero.destination')}
                      </p>
                      <Input
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => searchQuery.trim().length >= 2 && searchResults.total > 0 && setShowAutocomplete(true)}
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

                {/* Autocomplete Dropdown */}
                <div ref={autocompleteRef}>
                  <SearchAutocomplete
                    results={searchResults}
                    onSelect={handleAutocompleteSelect}
                    isVisible={showAutocomplete}
                    searchQuery={searchQuery}
                  />
                </div>
              </form>
            </div>
          </div>

          <div className="mt-3 sm:mt-3.5 md:mt-4 hidden grid-cols-3 gap-2 md:grid">
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

        {/* Compact carousel - only show if there are items */}
        {carouselItems.length > 0 && (
          <div className="mt-4 sm:mt-5 md:mt-6 overflow-visible">
            <h2 
              className="mb-3 text-center font-semibold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
              style={{ fontSize: 'clamp(15px, 2.5vw, 16px)' }}
            >
              {t('sections.pickupTitle')}
            </h2>

            <div className="relative overflow-visible">
              {carouselItems.length > 1 && (
                <>
                  <button
                    onClick={() => scroll("left")}
                    className="hidden md:grid absolute left-0 top-1/2 z-20 -translate-y-1/2 size-10 place-items-center rounded-full bg-white/95 text-slate-900 shadow-lg backdrop-blur-sm transition hover:bg-white hover:scale-110"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="size-5" />
                  </button>

                  <button
                    onClick={() => scroll("right")}
                    className="hidden md:grid absolute right-0 top-1/2 z-20 -translate-y-1/2 size-10 place-items-center rounded-full bg-white/95 text-slate-900 shadow-lg backdrop-blur-sm transition hover:bg-white hover:scale-110"
                    aria-label="Next"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </>
              )}

              {/* Desktop carousel - native scroll like TourCarouselSection */}
              <div
                ref={desktopScrollRef}
                className="hidden md:flex gap-3 overflow-x-auto overflow-y-hidden scrollbar-hide pb-6"
                style={{
                  WebkitOverflowScrolling: "touch",
                  scrollSnapType: "x mandatory"
                }}
              >
                {infiniteItems.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className="w-[280px] min-w-[280px] shrink-0"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <HeroTourCard {...item} disableTracking={true} />
                  </div>
                ))}
              </div>

              {/* Mobile carousel - infinite scroll with native snap */}
              <div
                ref={scrollContainerRef}
                className="md:hidden overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
                style={{
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <div className="flex gap-3 px-4">
                  {infiniteItems.map((item, index) => (
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
  );
}