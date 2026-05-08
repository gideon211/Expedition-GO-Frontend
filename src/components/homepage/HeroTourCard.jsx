import { Star, CircleCheck } from "lucide-react";
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
      className="group flex h-[130px] overflow-hidden rounded-xl bg-white shadow-md transition duration-200 hover:shadow-lg cursor-pointer p-2"
    >
      {/* Image - Left side, square */}
      <div className="relative w-[110px] shrink-0 overflow-hidden bg-slate-100 rounded-lg">
        <img 
          src={image} 
          alt={title} 
          className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105" 
        />
      </div>

      {/* Content - Right side */}
      <div className="flex flex-1 flex-col pl-2 min-w-0">
        {/* Title - 2 lines, tight spacing, responsive */}
        <h3 
          className="line-clamp-2 font-bold leading-[1.1] text-slate-900 mb-1"
          style={{ fontSize: 'clamp(10px, 1.8vw, 12px)' }}
        >
          {title}
        </h3>
        
        {/* Duration - Very small */}
        <p 
          className="text-slate-600 leading-tight mb-1.5"
          style={{ fontSize: 'clamp(8px, 1.5vw, 9px)' }}
        >
          {duration}
        </p>
        
        {/* Features - Free Cancellation & Pickup */}
        <div className="mb-auto space-y-0.5">
          <div className="flex items-center gap-1">
            <CircleCheck className="size-2.5 text-emerald-500" />
            <span 
              className="text-slate-700 font-medium"
              style={{ fontSize: 'clamp(7px, 1.4vw, 8px)' }}
            >
              {t("features.freeCancellation")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <CircleCheck className="size-2.5 text-emerald-500" />
            <span 
              className="text-slate-700 font-medium"
              style={{ fontSize: 'clamp(7px, 1.4vw, 8px)' }}
            >
              {t("tourDetail.pickupIncluded")}
            </span>
          </div>
        </div>
        
        {/* Bottom row: Rating & Price - tight to bottom */}
        <div className="flex items-center justify-between gap-2">
          {/* Rating */}
          <div className="flex items-center gap-0.5">
            <Star className="size-2.5 fill-amber-400 text-amber-400" />
            <span 
              className="font-bold text-slate-900"
              style={{ fontSize: 'clamp(8px, 1.6vw, 10px)' }}
            >
              {rating}
            </span>
            <span 
              className="text-slate-600"
              style={{ fontSize: 'clamp(7px, 1.5vw, 9px)' }}
            >
              ({reviews})
            </span>
          </div>
          
          {/* Price */}
          <div className="text-right leading-none">
            <p 
              className="text-slate-600 mb-0.5"
              style={{ fontSize: 'clamp(6px, 1.3vw, 8px)' }}
            >
              {t('common.from')}
            </p>
            <p 
              className="font-bold text-slate-900"
              style={{ fontSize: 'clamp(10px, 1.9vw, 13px)' }}
            >
              {convertedPrice.formatted}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
