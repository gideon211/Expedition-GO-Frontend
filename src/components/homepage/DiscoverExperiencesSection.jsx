import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ThumbsUp, ThumbsDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigationLoader } from "@/contexts/NavigationContext";
import { DiscoverExperiencesCard } from "./DiscoverExperiencesCard";
import {
  pickupTours,
  recommendedTours,
  topRatedTours,
  leisureTours,
  lastMinuteDeals,
} from "./data";

const TABS = [
  { key: "more", label: "More Experiences" },
  { key: "attractions", label: "Top Attractions" },
  { key: "nearby", label: "Things to do nearby" },
  { key: "best", label: "Best Experiences" },
  { key: "trending", label: "Trending Destinations" },
];

const TAB_DATA = {
  more: pickupTours.slice(0, 5),
  attractions: recommendedTours.slice(0, 5),
  nearby: topRatedTours.slice(0, 5),
  best: leisureTours.slice(0, 5),
  trending: lastMinuteDeals.slice(0, 5),
};

export function DiscoverExperiencesSection() {
  const { t } = useTranslation();
  const { navigateWithLoader } = useNavigationLoader();
  const [activeTab, setActiveTab] = useState("more");
  const [feedback, setFeedback] = useState(null);
  const items = TAB_DATA[activeTab] || [];

  const handleViewAll = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "auto" });
    navigateWithLoader(`/tours?category=all&title=${encodeURIComponent("Discover experiences your way")}`);
  };

  return (
    <section className="pt-3 pb-6 sm:pt-5 sm:pb-10">
      <div className="mb-4 sm:mb-6">
        <h4 className="relative inline-block text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">
          Discover experiences your way
          <span className="absolute bottom-[-8px] left-0 h-1 w-16 rounded-full bg-gradient-to-r from-[color:var(--brand-green)] to-emerald-400 sm:bottom-[-10px] sm:w-20" />
        </h4>
      </div>

      <div className="mb-4 sm:mb-6">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 border-b border-slate-200 pb-0 sm:gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative shrink-0 whitespace-nowrap px-2.5 py-2 text-[13px] font-medium transition sm:px-3 sm:py-2.5 sm:text-base ${
                    activeTab === tab.key
                      ? "font-bold text-slate-900"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <motion.span
                      layoutId="discover-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t bg-[color:var(--brand-green)]"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
          <Link
            to={`/tours?category=all&title=${encodeURIComponent("Discover experiences your way")}`}
            onClick={handleViewAll}
            className="group relative inline-flex min-h-[44px] shrink-0 touch-manipulation items-center gap-1 whitespace-nowrap py-2 text-[13px] font-semibold text-slate-700 transition hover:text-slate-950 sm:min-h-0 sm:py-1.5 sm:text-[14px]"
          >
            <span className="relative">
              {t("sections.viewAll")}
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[color:var(--brand-green)] transition-all duration-300 group-hover:w-full" />
            </span>
            <ChevronRight className="size-4 text-slate-500 transition group-hover:text-[color:var(--brand-green)]" />
          </Link>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-5"
        >
          {items.map((tour, i) => (
            <motion.div
              key={tour.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06, ease: "easeOut" }}
              className="w-[200px] shrink-0 snap-start sm:w-[240px] lg:w-[260px]"
            >
              <DiscoverExperiencesCard {...tour} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-4 sm:mt-8 sm:flex-row sm:justify-center sm:gap-5 sm:px-6 sm:py-5">
        {feedback === null ? (
          <>
            <p className="text-center text-[13px] font-semibold text-slate-700 sm:text-sm">
              Were these recommendations helpful?
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFeedback("up")}
                className="flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)] active:scale-95 sm:size-12"
                aria-label="Helpful"
              >
                <ThumbsUp className="size-5" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => setFeedback("down")}
                className="flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-red-400 hover:text-red-500 active:scale-95 sm:size-12"
                aria-label="Not helpful"
              >
                <ThumbsDown className="size-5" strokeWidth={2} />
              </button>
            </div>
          </>
        ) : feedback === "up" ? (
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-[color:var(--brand-green)]/10 text-[color:var(--brand-green)] sm:size-10">
              <ThumbsUp className="size-4.5 sm:size-5" strokeWidth={2} />
            </div>
            <p className="text-center text-[13px] font-semibold text-slate-800 sm:text-sm">
              Thanks for your feedback! We're glad you found this helpful.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-red-50 text-red-500 sm:size-10">
              <ThumbsDown className="size-4.5 sm:size-5" strokeWidth={2} />
            </div>
            <p className="text-center text-[13px] font-semibold text-slate-800 sm:text-sm">
              Thanks for letting us know. We'll work on improving these suggestions.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
