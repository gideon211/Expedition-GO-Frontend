/**
 * @file MobileStickySearchBar.jsx
 * @description Fixed-top search bar on mobile that appears when the hero search
 *   bar scrolls out of view. Uses IntersectionObserver to trigger visibility.
 */
import { useEffect, useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useSearchAutocomplete } from '@/hooks/useSearchAutocomplete';
import { useNavigationLoader } from '@/contexts/NavigationContext';
import { SearchAutocomplete } from './SearchAutocomplete';
import { Input } from '@/components/ui/input';

export function MobileStickySearchBar({
  externalSearchQuery = '',
  onExternalSearchChange,
}) {
  const { t } = useTranslation();
  const { navigateWithLoader } = useNavigationLoader();
  const [visible, setVisible] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const searchResults = useSearchAutocomplete(externalSearchQuery);

  useEffect(() => {
    let rafId;
    const check = () => {
      const heroSearch = document.getElementById('hero-search-bar');
      if (!heroSearch) return;
      const rect = heroSearch.getBoundingClientRect();
      setVisible(rect.top <= 0);
    };
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(check);
    };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', check);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (externalSearchQuery.trim().length >= 2 && searchResults.total > 0) {
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  }, [externalSearchQuery, searchResults.total]);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowAutocomplete(false);
    const query = externalSearchQuery.trim();
    if (!query) {
      navigateWithLoader('/tours');
      return;
    }
    navigateWithLoader(`/tours?search=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl px-3 py-2 lg:hidden ${visible ? 'translate-y-0 transition-transform duration-200' : '-translate-y-full transition-none'}`}>
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="flex w-full items-center gap-0 rounded-full border-2 border-slate-200 bg-white overflow-hidden shadow-lg">
            <div className="flex items-center gap-2.5 flex-1 min-w-0 pl-4 pr-2 py-2">
              <Search className="text-slate-400 shrink-0 size-4.5" />
              <div className="min-w-0 flex-1">
                <Input
                  ref={searchInputRef}
                  value={externalSearchQuery}
                  onChange={(e) => onExternalSearchChange?.(e.target.value)}
                  onFocus={() => {
                    if (externalSearchQuery.trim().length >= 2 && searchResults.total > 0) {
                      setShowAutocomplete(true);
                    }
                  }}
                  placeholder={t('hero.destinationPlaceholder')}
                  className="h-auto border-0 px-0 py-0 w-full text-[14px] text-slate-900 placeholder:text-slate-400 placeholder:truncate shadow-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{ caretColor: 'var(--brand-green)', outline: 'none', textAlign: 'left' }}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="pr-1 py-1">
              <button
                type="submit"
                className="rounded-full bg-[color:var(--brand-green)] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[color:var(--brand-green-2)]"
              >
                {t('hero.search')}
              </button>
            </div>
          </div>
        </form>
        <div ref={autocompleteRef} />
      </div>

      {showAutocomplete && visible && (
        <div
          ref={autocompleteRef}
          className="fixed top-[calc(3.8rem)] left-3 right-3 z-[51] lg:hidden"
        >
          <SearchAutocomplete
            results={searchResults}
            onSelect={() => setShowAutocomplete(false)}
            isVisible={showAutocomplete}
            searchQuery={externalSearchQuery}
          />
        </div>
      )}
    </>
  );
}
