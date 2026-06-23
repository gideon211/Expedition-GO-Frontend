/**
 * @file FeaturesSection.jsx
 * @description "Why book with us" trust/features grid on the homepage.
 *   Copy from WHY_BOOK_ITEMS; icons mapped per item. i18n via useTranslation.
 *   Mobile: swipeable carousel with dots. Desktop: grid layout.
 */
import { useState, useRef } from 'react';
import { CheckCircle, CreditCard, Star, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WHY_BOOK_ITEMS = [
  {
    Icon: CheckCircle,
    titleKey: 'whyBookVerifiedTitle',
    descKey: 'whyBookVerifiedDesc',
  },
  {
    Icon: CreditCard,
    titleKey: 'whyBookPaymentsTitle',
    descKey: 'whyBookPaymentsDesc',
  },
  {
    Icon: Star,
    titleKey: 'whyBookReviewsTitle',
    descKey: 'whyBookReviewsDesc',
  },
  {
    Icon: MessageCircle,
    titleKey: 'whyBookSupportTitle',
    descKey: 'whyBookSupportDesc',
  },
];

export function FeaturesSection() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold && activeIndex < WHY_BOOK_ITEMS.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else if (diff < -threshold && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  return (
    <section className="relative overflow-hidden bg-white py-8 sm:py-12 lg:py-16">
      <div className="relative mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center sm:mb-12 lg:mb-14">
          <h5
            className="font-semibold tracking-tight text-slate-900"
            style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}
          >
            {t('features.whyBookHeading')}
          </h5>
        </div>

        {/* Mobile carousel */}
        <div
          className="sm:hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {WHY_BOOK_ITEMS.map(({ Icon, titleKey, descKey }) => (
                <div key={titleKey} className="w-full flex-shrink-0 px-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                    <div className="mx-auto grid size-16 place-items-center rounded-xl bg-[color:var(--brand-mist)]">
                      <Icon
                        className="size-8 text-[color:var(--brand-green)]"
                        strokeWidth={1.8}
                        aria-hidden
                      />
                    </div>
                    <h5 className="mt-4 text-center text-[10px] font-bold text-slate-900">
                      {t(`features.${titleKey}`)}
                    </h5>
                    <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">
                      {t(`features.${descKey}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="mt-6 flex justify-center gap-2">
            {WHY_BOOK_ITEMS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === activeIndex ? 'w-8 bg-[color:var(--brand-green)]' : 'w-2 bg-slate-300'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {WHY_BOOK_ITEMS.map(({ Icon, titleKey, descKey }) => (
            <div
              key={titleKey}
              className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 transition hover:border-emerald-200 hover:bg-emerald-50/30 sm:p-6"
            >
              <div className="mx-auto grid size-16 place-items-center rounded-xl bg-[color:var(--brand-mist)] sm:size-[4.5rem]">
                <Icon
                  className="size-8 text-[color:var(--brand-green)] sm:size-9"
                  strokeWidth={1.8}
                  aria-hidden
                />
              </div>
              <h5 className="mt-4 text-center text-[10px] font-bold text-slate-900 sm:text-lg">
                {t(`features.${titleKey}`)}
              </h5>
              <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">
                {t(`features.${descKey}`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
