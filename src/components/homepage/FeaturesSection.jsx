import { Phone, Gift, Star, CalendarDays } from "lucide-react";
import { useTranslation } from "react-i18next";

const BLOB_BASE =
  "pointer-events-none absolute left-1/2 top-1/2 size-[5.25rem] sm:size-[5.75rem] -translate-x-1/2 -translate-y-1/2 scale-110 rounded-[45%_55%_48%_52%_/_52%_48%_50%_50%] opacity-[0.94]";

const WHY_BOOK_ITEMS = [
  {
    blobVar: "--why-book-blob-1",
    Icon: Phone,
    titleKey: "whyBookSupportTitle",
    descKey: "whyBookSupportDesc",
  },
  {
    blobVar: "--why-book-blob-2",
    Icon: Gift,
    titleKey: "whyBookRewardsTitle",
    descKey: "whyBookRewardsDesc",
  },
  {
    blobVar: "--why-book-blob-3",
    Icon: Star,
    titleKey: "whyBookReviewsTitle",
    descKey: "whyBookReviewsDesc",
  },
  {
    blobVar: "--why-book-blob-4",
    Icon: CalendarDays,
    titleKey: "whyBookPlanTitle",
    descKey: "whyBookPlanDesc",
  },
];

export function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-white py-[2.125rem] md:py-10 lg:py-12">
      <h2
        className="mx-auto mb-9 max-w-3xl px-0 text-center font-bold tracking-tight text-slate-900 md:mb-11"
        style={{ fontSize: "clamp(1.35rem, 2.2vw + 0.45rem, 1.875rem)" }}
      >
        {t("features.whyBookHeading")}
      </h2>

      {/* Horizontal row: scroll-snap on small / tablet; static 4-col grid on lg+ */}
      <div
        className="-mx-4 flex gap-7 overflow-x-auto overflow-y-visible px-4 pb-3 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] snap-x snap-mandatory sm:-mx-6 sm:gap-8 sm:px-6 md:gap-9 md:pb-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-8 lg:overflow-visible lg:px-0 lg:pb-0 lg:pt-0 lg:snap-none [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
          {WHY_BOOK_ITEMS.map(({ blobVar, Icon, titleKey, descKey }) => (
            <div
              key={titleKey}
              className="flex w-[min(17.25rem,calc(100vw-2.75rem))] shrink-0 snap-center flex-col items-center text-center sm:w-[min(17.75rem,calc(50vw-1.75rem))] md:w-[min(18rem,42vw)] lg:w-auto lg:min-w-0 lg:max-w-none lg:shrink"
            >
              <div className="relative z-0 grid h-[5.25rem] w-full max-w-[5.75rem] place-items-center sm:h-[5.75rem] sm:max-w-[6rem]">
                <span className={BLOB_BASE} style={{ backgroundColor: `var(${blobVar})` }} aria-hidden />
                <Icon
                  className="relative z-[1] size-8 text-[color:var(--brand-green)] sm:size-9"
                  strokeWidth={1.65}
                  aria-hidden
                />
              </div>
              <h3
                className="mt-5 max-w-[15.5rem] font-bold leading-snug text-slate-900"
                style={{ fontSize: "clamp(0.8125rem, 0.75vw + 0.45rem, 0.9375rem)" }}
              >
                {t(`features.${titleKey}`)}
              </h3>
              <p
                className="mt-2 max-w-[16.5rem] leading-relaxed text-slate-600"
                style={{ fontSize: "clamp(0.75rem, 0.55vw + 0.42rem, 0.875rem)" }}
              >
                {t(`features.${descKey}`)}
              </p>
            </div>
          ))}
        </div>
    </section>
  );
}
