/**
 * @file CartItemCard.jsx
 * @description Single cart item card styled after the booking confirmation preview.
 *   Shows tour image, title, rating, urgency countdown, booking details,
 *   edit/remove actions, and original/discounted pricing.
 *
 * @see pages/CartPage.jsx
 */
import {
  CalendarDays,
  Clock,
  Globe,
  Pencil,
  Star,
  Trash2,
  Users,
  CalendarX2,
  Info,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigationLoader } from '@/contexts/NavigationContext';

function formatUrgency(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalSeconds / 3600);
  const days = Math.floor(totalSeconds / 86400);

  if (days > 0) return `${days} day${days === 1 ? '' : 's'}`;
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'}`;
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

function formatCardDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function CartItemCard({ item, now, onRemove }) {
  const { t } = useTranslation();
  const { convertPrice } = useCurrency();
  const { navigateWithLoader } = useNavigationLoader();

  const remainingMs = Math.max(0, Number(item.expiresAt) - now);
  const isExpired = remainingMs <= 0;

  const totalTravelers =
    (item.adults || 0) +
    (item.seniors || 0) +
    (item.youths || 0) +
    (item.children || 0) +
    (item.infants || 0);

  const travelerLabel = `${totalTravelers} ${totalTravelers === 1 ? 'adult' : 'travelers'}`;
  const language = item.language || 'English';
  const refundPolicy = item.refundPolicy || 'This activity is non-refundable';

  const rating = Number(item.rating) || 0;
  const reviews = Number(item.reviews) || 0;
  const isTopRated = rating >= 4.5;

  const originalPrice = convertPrice(item.price);
  const finalPrice = convertPrice(item.finalPrice ?? item.price);
  const hasDiscount = item.discount > 0 && item.finalPrice != null && item.finalPrice < item.price;

  const handleEdit = () => {
    if (item.tourId) {
      navigateWithLoader(`/tour/${item.tourId}`);
    }
  };

  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Tour image */}
        <div className="shrink-0">
          <img
            src={item.image}
            alt={item.title}
            className="h-40 w-full rounded-xl object-cover object-center shadow-sm sm:h-28 sm:w-28"
          />
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold leading-snug text-slate-900 sm:text-lg">
                {item.title}
              </h3>

              {/* Rating */}
              {rating > 0 && (
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`size-3.5 ${
                          i < Math.round(rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-200 text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{rating.toFixed(1)}</span>
                  {reviews > 0 && (
                    <span className="text-sm text-slate-500">({reviews})</span>
                  )}
                </div>
              )}

              {/* Top rated badge */}
              {isTopRated && (
                <span className="mt-2 inline-flex items-center rounded-md bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
                  Top rated
                </span>
              )}
            </div>

            {/* Prices */}
            <div className="shrink-0 text-left sm:text-right">
              {hasDiscount && (
                <p className="text-sm text-slate-400 line-through">{originalPrice.formatted}</p>
              )}
              <p className="text-lg font-bold text-rose-600 sm:text-xl">{finalPrice.formatted}</p>
            </div>
          </div>

          {/* Urgency */}
          {!isExpired ? (
            <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-amber-600">
              <Info className="size-4" />
              <span>Only {formatUrgency(remainingMs)} left to complete booking</span>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-slate-500">
              <Info className="size-4" />
              <span>Expired</span>
            </div>
          )}

          {/* Details */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="size-4 text-slate-400" />
              <span>{formatCardDate(item.selectedDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Users className="size-4 text-slate-400" />
              <span>{travelerLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Globe className="size-4 text-slate-400" />
              <span>Language: {language}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CalendarX2 className="size-4 text-slate-400" />
              <span>{refundPolicy}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleEdit}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
            >
              <Pencil className="size-4" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => onRemove(item.key)}
              className="grid size-9 place-items-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
              aria-label="Remove item"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
