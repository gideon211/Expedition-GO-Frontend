/**
 * @file HeroSection.jsx
 * @description Homepage hero with search bar, destination carousel, and stats.
 *   Search navigates to /tours with query params.
 */
import { Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useNavigationLoader } from '@/contexts/NavigationContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { heroStats } from './data';
import { useSearchAutocomplete } from '@/hooks/useSearchAutocomplete';
import { SearchAutocomplete } from './SearchAutocomplete';
import { HeroImageCarousel } from './HeroImageCarousel';

export function HeroSection({
  _sharedDateRange,
  _onSharedDateRangeChange,
  externalSearchQuery,
  onExternalSearchChange,
}) {
  const { t } = useTranslation();
  const { navigateWithLoader } = useNavigationLoader();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const isExternalSearchMode = typeof onExternalSearchChange === 'function';
  const activeSearchQuery = isExternalSearchMode ? (externalSearchQuery ?? '') : searchQuery;

  // Get search results
  const searchResults = useSearchAutocomplete(activeSearchQuery);

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
      const bar = document.getElementById('hero-search-bar');
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      setAutocompletePos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    };
    updatePosition();
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close hero autocomplete on scroll so the navbar autocomplete takes over
  useEffect(() => {
    const close = () => {
      if (document.body.classList.contains('hero--search-sticky')) {
        setShowAutocomplete(false);
      }
    };
    window.addEventListener('scroll', close, { passive: true });
    return () => window.removeEventListener('scroll', close);
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
        className="relative z-10 min-h-[50vh] sm:min-h-[52vh] md:min-h-[50vh] lg:min-h-[52vh] xl:min-h-[60vh] flex items-start pt-[10vh] overflow-visible bg-(--brand-green) text-white pb-4"
      >
        <HeroImageCarousel />

        <div className="relative mx-auto w-full max-w-[1520px] px-2 py-12 sm:px-4 sm:py-16 md:py-18 overflow-visible">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex justify-center" />

            {/* Hero Content */}
            <div className="hero-content-wrap">
              <h1
                className="mt-2 mx-auto text-center text-white drop-shadow-[0_6px_20px_rgba(0,0,0,0.55)] whitespace-nowrap overflow-hidden text-ellipsis w-full max-w-none px-2 sm:mt-4"
                style={{
                  fontFamily: 'var(--font-hero)',
                  fontWeight: 700,
                  fontSize: 'clamp(1.75rem, 4.5vw, 2.75rem)',
                  lineHeight: 'clamp(2rem, 5vw, 3rem)',
                  letterSpacing: '0px',
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
                  letterSpacing: '0px',
                }}
              >
                {t('hero.subtitle')}
              </p>
            </div>

            {/* Hero Stats */}
            <div className="hero-stats-wrap mt-3 inline-grid grid-cols-3 gap-2 sm:mt-3.5 md:mt-4 mx-auto">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 backdrop-blur-sm sm:px-2.5 sm:py-2"
                >
                  <p className="text-sm font-black sm:text-base">{stat.value}</p>
                  <p className="mt-0.5 text-[9px] text-white/70 sm:text-[10px]">
                    {t(`stats.${stat.translationKey}`)}
                  </p>
                </div>
              ))}
            </div>

            {/* Hero Search Bar */}
            <div className="hero-search-wrap relative z-10 mt-4 sm:mt-3.5 md:mt-4 mx-auto w-full max-w-xl sm:max-w-2xl lg:max-w-3xl">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div
                  id="hero-search-bar"
                  className="flex w-full items-center gap-0 rounded-full border-2 border-white/80 bg-white shadow-xl mx-auto overflow-hidden"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 pl-5 pr-3 py-3 sm:py-3.5">
                    <Search className="text-slate-400 shrink-0 size-5" />
                    <div className="min-w-0 flex-1">
                    <Input
                      ref={searchInputRef}
                      value={activeSearchQuery}
                      onChange={handleSearchChange}
                      onFocus={() =>
                        activeSearchQuery.trim().length >= 2 &&
                        searchResults.total > 0 &&
                        setShowAutocomplete(true)
                      }
                      className="h-auto border-0 px-0 py-0 w-full text-[15px] sm:text-base text-slate-900 placeholder:text-slate-400 placeholder:truncate shadow-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        style={{
                          caretColor: 'var(--brand-green)',
                          outline: 'none',
                          textAlign: 'left',
                        }}
                        placeholder={t('hero.destinationPlaceholder')}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div className="pr-1.5 py-1.5">
                    <Button
                      type="submit"
                      size="sm"
                      className="h-full rounded-full text-[13px] font-semibold px-5 py-2.5 sm:text-[14px] sm:px-6 sm:py-3"
                      style={{ backgroundColor: '#39AD6C' }}
                    >
                      {t('hero.search')}
                    </Button>
                  </div>
                </div>
                <div ref={autocompleteRef} />
              </form>
            </div>
          </div>
        </div>
      </section>
      {showAutocomplete &&
        !document.body.classList.contains('hero--search-sticky') &&
        createPortal(
          <div
            ref={autocompleteRef}
            style={{
              position: 'fixed',
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
          document.body
        )}
    </>
  );
}
