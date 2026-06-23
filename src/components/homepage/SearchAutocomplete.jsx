/**
 * @file SearchAutocomplete.jsx
 * @description Navbar search dropdown showing matching tours and destinations.
 *
 * @see hooks/useSearchAutocomplete.js — fuzzy matching logic
 */
import { forwardRef } from 'react';
import { MapPin, Clock, Star } from 'lucide-react';
import { useNavigationLoader } from '@/contexts/NavigationContext';
import { useCurrency } from '@/contexts/CurrencyContext';

export const SearchAutocomplete = forwardRef(function SearchAutocomplete(
  {
    results,
    onSelect,
    isVisible,
    searchQuery,
    className = 'absolute top-full left-0 right-0 mt-1 min-w-[260px] sm:min-w-[320px] max-h-[400px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg z-50',
  },
  ref
) {
  const { navigateWithLoader } = useNavigationLoader();
  const { convertPrice } = useCurrency();

  if (!isVisible || results.total === 0) {
    return null;
  }

  const handleTourClick = (tour) => {
    const path = tour.slug ? `/tour/${tour.slug}` : `/tour/${encodeURIComponent(tour.title)}`;
    navigateWithLoader(path);
    onSelect();
  };

  const handleDestinationClick = (destination) => {
    navigateWithLoader(`/tours?search=${encodeURIComponent(destination.title)}`);
    onSelect();
  };

  const handleViewAllClick = () => {
    // Use the actual search query instead of a specific result
    navigateWithLoader(`/tours?search=${encodeURIComponent(searchQuery || '')}`);
    onSelect();
  };

  return (
    <div ref={ref} className={className}>
      {/* Destinations Section */}
      {results.destinations.length > 0 && (
        <div className="border-b border-slate-100">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Destinations
          </div>
          {results.destinations.map((destination, index) => (
            <button
              key={`dest-${index}`}
              onClick={() => handleDestinationClick(destination)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition text-left"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-slate-100">
                <img
                  src={destination.image}
                  alt={destination.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{destination.title}</p>
                <p className="text-xs text-slate-500">{destination.tours}</p>
              </div>
              <MapPin className="flex-shrink-0 size-4 text-slate-400" />
            </button>
          ))}
        </div>
      )}

      {/* Tours Section */}
      {results.tours.length > 0 && (
        <div>
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Tours & Experiences
          </div>
          {results.tours.map((tour, index) => {
            const convertedPrice = convertPrice(tour.price);
            return (
              <button
                key={`tour-${index}`}
                onClick={() => handleTourClick(tour)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition text-left"
              >
                <div className="flex-shrink-0 w-16 h-12 rounded overflow-hidden bg-slate-100">
                  <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{tour.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="size-3" />
                      <span>{tour.duration}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#39AD6C]">
                      <Star className="size-3 fill-current" />
                      <span className="text-slate-900">{tour.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-slate-500">from</p>
                  <p className="text-sm font-bold text-slate-900">{convertedPrice.formatted}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* View All Results */}
      <button
        onClick={handleViewAllClick}
        className="w-full px-3 py-2.5 text-sm font-medium text-(--brand-green) hover:bg-slate-50 transition border-t border-slate-100"
      >
        View all results ({results.total})
      </button>
    </div>
  );
});
