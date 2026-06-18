import { useRef, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigationLoader } from '@/contexts/NavigationContext';

const MOOD_CATEGORIES = [
  {
    id: 'adventure',
    title: 'Adventure',
    tag: 'Thrill',
    count: 15,
    image:
      'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cultural',
    title: 'Cultural',
    tag: 'Heritage',
    count: 20,
    image:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'nature',
    title: 'Nature',
    tag: 'Escape',
    count: 18,
    image:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'beach',
    title: 'Beach',
    tag: 'Sun & Sea',
    count: 12,
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'wildlife',
    title: 'Wildlife',
    tag: 'Safari',
    count: 10,
    image:
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'city-tours',
    title: 'City Tours',
    tag: 'Urban',
    count: 22,
    image:
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'food-drinks',
    title: 'Food & Drinks',
    tag: 'Taste',
    count: 9,
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'wellness',
    title: 'Wellness',
    tag: 'Recharge',
    count: 7,
    image:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
  },
];

const CARD_WIDTH = 280;
const GAP = 18;
const SCROLL_AMOUNT = CARD_WIDTH + GAP;

export function TodoSection() {
  const { t } = useTranslation();
  const { navigateWithLoader } = useNavigationLoader();
  const scrollRef = useRef(null);
  const isScrollingRef = useRef(false);

  const scroll = useCallback((direction) => {
    const container = scrollRef.current;
    if (!container || isScrollingRef.current) return;

    isScrollingRef.current = true;
    const currentScroll = container.scrollLeft;
    const newScrollPosition =
      direction === 'left'
        ? Math.max(0, currentScroll - SCROLL_AMOUNT)
        : currentScroll + SCROLL_AMOUNT;

    container.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth',
    });

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 300);
  }, []);

  const handleCardClick = (category) => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    navigateWithLoader(
      `/tours?category=${category.id}&title=${encodeURIComponent(category.title)}`
    );
  };

  return (
    <section className="py-4 md:py-4 xl:py-5">
      <div className="section-header-row relative z-30 isolate mb-[0.6375rem] flex items-start justify-between gap-4 md:mb-2.5 xl:mb-3">
        <div className="min-w-0 flex-1">
          <h2
            className="truncate font-bold tracking-tight text-slate-900 leading-[1.15]"
            style={{ fontSize: 'clamp(1.2rem, 1.2vw + 0.5rem, 1.375rem)' }}
            title="What do you want to do?"
          >
            What do you want to do?
          </h2>
        </div>
        <div className="section-header-actions">
          <div className="section-header-scroll-arrows">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
              aria-label="Scroll left"
            >
              <ChevronRight className="size-4 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
              aria-label="Scroll right"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {MOOD_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => handleCardClick(category)}
            className="group relative flex h-[188px] w-[280px] shrink-0 scroll-snap-start flex-col overflow-hidden rounded-[22px] border border-white/70 bg-slate-200 font-card transition-all hover:-translate-y-1"
            style={{
              scrollSnapAlign: 'start',
              backgroundImage: `url(${category.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <span className="absolute left-4 top-4 rounded-full bg-[color:var(--brand-green)]/90 px-3 py-1 text-[12px] font-semibold text-white shadow-sm backdrop-blur-sm">
              {category.tag}
            </span>
            <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[12px] font-bold text-slate-700 shadow-sm backdrop-blur-sm">
              {category.count} tours
            </span>
            <div className="absolute bottom-0 left-0 right-0 top-0 bg-gradient-to-t from-black/70 via-black/18 to-transparent" />
            <div className="relative z-10 mt-auto flex items-end justify-between px-5 pb-5">
              <h3 className="text-[22px] font-bold leading-tight text-white shadow-black drop-shadow-md">
                {category.title}
              </h3>
              <div className="flex size-11 items-center justify-center rounded-full bg-white text-[color:var(--brand-green)] shadow-md transition-transform group-hover:scale-110">
                <ChevronRight className="size-6" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}