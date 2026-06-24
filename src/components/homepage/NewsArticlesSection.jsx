import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigationLoader } from '@/contexts/NavigationContext';
import { ArticleCard } from './ArticleCard';
import { getLatestPosts } from '@/lib/blogLoader';

export function NewsArticlesSection() {
  const { t } = useTranslation();
  const { navigateWithLoader } = useNavigationLoader();
  const articles = useMemo(() => getLatestPosts(5), []);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const max = scrollWidth - clientWidth;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(max > 6 && scrollLeft < max - 6);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(updateScrollButtons);
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    const ro =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateScrollButtons) : null;
    ro?.observe(el);
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      ro?.disconnect();
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons]);

  const scrollByDirection = useCallback((dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const step = 320 * 3;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const target = Math.max(0, Math.min(maxScroll, el.scrollLeft + dir * step));
    el.scrollTo({ left: target, behavior: 'smooth' });
  }, []);

  const handleViewAll = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'auto' });
    navigateWithLoader('/blog');
  };

  return (
    <section className="py-6 sm:py-10 lg:py-12">
      <div className="mb-4 flex items-start justify-between gap-3 sm:mb-6 sm:gap-4">
        <div className="flex-1">
          <h2 className="relative inline-block text-lg font-bold tracking-tight text-slate-900 sm:text-3xl">
            Travel Stories & News
            <span className="absolute bottom-[-8px] left-0 h-1 w-16 rounded-full bg-gradient-to-r from-[color:var(--brand-green)] to-emerald-400 sm:bottom-[-10px] sm:w-20" />
          </h2>
          <p className="mt-4 text-[13px] text-slate-600 sm:text-sm">
            Discover travel guides, tips, and stories from across Africa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/blog"
            onClick={handleViewAll}
            className="group relative inline-flex min-h-[44px] shrink-0 touch-manipulation items-center gap-1 whitespace-nowrap py-2 text-[13px] font-semibold text-slate-700 transition hover:text-slate-950 sm:min-h-0 sm:py-1.5 sm:text-[14px]"
          >
            <span className="relative">
              {t('sections.viewAll')}
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[color:var(--brand-green)] transition-all duration-300 group-hover:w-full" />
            </span>
            <ChevronRight className="size-4 text-slate-500 transition group-hover:text-[color:var(--brand-green)]" />
          </Link>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollByDirection(-1)}
              className="grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)] disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!canScrollLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByDirection(1)}
              className="grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)] disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!canScrollRight}
              aria-label="Scroll right"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-5"
      >
        {articles.map((article) => (
          <div
            key={article.slug}
            className="w-[300px] shrink-0 snap-start sm:w-[300px] lg:w-[300px]"
          >
            <ArticleCard article={article} />
          </div>
        ))}
      </div>
    </section>
  );
}
