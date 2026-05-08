import { Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useWishlist } from "@/contexts/WishlistContext";
import { useCurrency } from "@/contexts/CurrencyContext";

/**
 * Compact Tour Card - Vertical layout for sidebar sections
 * Used in "New Experiences" and other sidebar sections
 */
export function CompactTourCard({ title, duration, price, rating, reviews, image, discount, disableTracking = false }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { convertPrice } = useCurrency();
  const isFavorited = isInWishlist(title);

  const convertedPrice = convertPrice(price);

  const handleHeartClick = (e) => {
    e.stopPropagation();
    toggleWishlist({ title, duration, price, rating, reviews, image, discount });
  };

  const handleCardClick = () => {
    navigate(`/tour/${encodeURIComponent(title)}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition duration-300 hover:shadow-md cursor-pointer"
    >
      {/* Vertical Image */}
      <div className="relative h-32 overflow-hidden bg-slate-100">
        <img 
          src={image} 
          alt={title} 
          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        
        {/* Duration badge */}
        <span className="absolute left-2 top-2 rounded bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-slate-900 shadow-sm backdrop-blur-sm">
          {duration}
        </span>
        
        {/* Heart button */}
        <button 
          onClick={handleHeartClick}
          className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-white/95 text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-white hover:scale-110 z-10"
        >
          <Heart 
            className={`size-3 transition-colors ${
              isFavorited ? 'fill-[color:var(--brand-green)] text-[color:var(--brand-green)]' : ''
            }`} 
          />
        </button>
      </div>

      {/* Vertical Content */}
      <div className="p-2.5">
        {/* Title - 2 lines max, matching TourCard font size */}
        <h3 
          className="line-clamp-2 font-bold leading-tight tracking-tight text-slate-900 min-h-[2.4em]"
          style={{ fontSize: 'clamp(0.875rem, 0.7vw + 0.5rem, 0.9375rem)' }}
        >
          {title}
        </h3>
        
        {/* Rating & Price Row */}
        <div className="mt-2 flex items-center justify-between gap-2">
          {/* Rating */}
          <div className="flex items-center gap-0.5 text-amber-500">
            <Star className="size-3 fill-current" />
            <span className="text-[12px] font-semibold text-slate-900">{rating}</span>
            <span className="text-[11px] text-slate-500">({reviews})</span>
          </div>
          
          {/* Price */}
          <div className="text-right">
            <p className="text-[11px] text-slate-500 leading-none">
              {t('common.from')}
            </p>
            <p className="text-[14px] font-bold text-slate-900 leading-tight">
              {convertedPrice.formatted}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
