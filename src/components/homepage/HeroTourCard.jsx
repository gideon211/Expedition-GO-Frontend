import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useCurrency } from "@/contexts/CurrencyContext";

/**
 * Hero Tour Card - Horizontal layout for hero section "Pickup where you left off" carousel
 * Matches GetYourGuide's "Continue planning your trip" card style exactly
 */
export function HeroTourCard({ title, duration, price, rating, reviews, image, disableTracking = false }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { convertPrice } = useCurrency();

  const convertedPrice = convertPrice(price);

  const handleCardClick = () => {
    navigate(`/tour/${encodeURIComponent(title)}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group flex h-[110px] overflow-hidden rounded-xl bg-white shadow-md transition duration-200 hover:shadow-lg cursor-pointer"
    >
      {/* Image - Left side, square */}
      <div className="relative w-[110px] shrink-0 overflow-hidden bg-slate-100">
        <img 
          src={image} 
          alt={title} 
          className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105" 
        />
      </div>

      {/* Content - Right side */}
      <div className="flex flex-1 flex-col p-2 min-w-0">
        {/* Title - 3 lines, tight spacing, responsive */}
        <h3 
          className="line-clamp-3 font-bold leading-[1.2] text-slate-900 mb-1"
          style={{ fontSize: 'clamp(11px, 2vw, 13px)' }}
        >
          {title}
        </h3>
        
        {/* Duration - Very small */}
        <p 
          className="text-slate-600 leading-tight mb-auto"
          style={{ fontSize: 'clamp(9px, 1.8vw, 11px)' }}
        >
          {duration}
        </p>
        
        {/* Bottom row: Rating & Price - tight to bottom */}
        <div className="flex items-center justify-between gap-2">
          {/* Rating */}
          <div className="flex items-center gap-0.5">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            <span 
              className="font-bold text-slate-900"
              style={{ fontSize: 'clamp(10px, 1.9vw, 12px)' }}
            >
              {rating}
            </span>
            <span 
              className="text-slate-600"
              style={{ fontSize: 'clamp(9px, 1.8vw, 11px)' }}
            >
              ({reviews})
            </span>
          </div>
          
          {/* Price */}
          <div className="text-right leading-none">
            <p 
              className="text-slate-600 mb-0.5"
              style={{ fontSize: 'clamp(8px, 1.6vw, 10px)' }}
            >
              {t('common.from')}
            </p>
            <p 
              className="font-bold text-slate-900"
              style={{ fontSize: 'clamp(12px, 2.2vw, 15px)' }}
            >
              {convertedPrice.formatted}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
