/**
 * @file ArticleCard.jsx
 * @description Reusable article card component for blog posts. Used in NewsArticlesSection and BlogPage.
 */
import { Link } from 'react-router-dom';
import { Calendar, Clock, ChevronRight } from 'lucide-react';

export function ArticleCard({ article }) {
  return (
    <Link
      to={`/blog/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/50 bg-white font-card transition-all hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={article.image}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-[color:var(--brand-green)] px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
            {article.category}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex items-center gap-3 text-[11px] text-slate-500 sm:text-[12px]">
          <div className="flex items-center gap-1">
            <Calendar className="size-3" />
            <span>{article.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="size-3" />
            <span>{article.readTime}</span>
          </div>
        </div>

        <h3 className="mb-2 line-clamp-2 text-[18px] leading-[24px] tracking-normal font-bold text-slate-900 transition-colors group-hover:text-[color:var(--brand-green)]">
          {article.title}
        </h3>

        <p className="mb-3 line-clamp-2 text-[13px] leading-relaxed text-slate-600 sm:text-sm">
          {article.excerpt}
        </p>

        <div className="mt-auto">
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[color:var(--brand-green)] transition-all group-hover:gap-2 sm:text-sm">
            Read more
            <ChevronRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
