/**
 * @file HeroSkeleton.jsx
 * @description Placeholder skeleton for HeroSection during homepage load.
 */
import { Skeleton } from '@/components/ui/skeleton';

export function HeroSkeleton() {
  return (
    <section
      id="home"
      className="relative z-10 min-h-[50vh] sm:min-h-[52vh] md:min-h-[50vh] lg:min-h-[52vh] xl:min-h-[60vh] flex items-start overflow-visible bg-[color:var(--brand-green)] pb-4 pt-[6vh] text-white"
    >
      <div className="absolute inset-0">
        <div
          className="h-full w-full bg-gradient-to-br from-slate-400/35 via-slate-300/25 to-slate-400/35"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.5),rgba(0,0,0,0.18)_25%,rgba(122,69,11,0.14)_60%,rgba(0,0,0,0.2)),radial-gradient(circle_at_center,rgba(255,174,58,0.28),transparent_42%)]"
          aria-hidden
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1520px] px-2 py-6 sm:px-4 sm:py-8 md:py-10 overflow-visible">
        <div className="mx-auto max-w-4xl text-center">
          {/* Hero Search Bar Skeleton */}
          <div className="relative z-10 mx-auto mt-4 w-full max-w-xl sm:mt-3.5 sm:max-w-2xl md:mt-4 lg:max-w-3xl">
            <div className="mx-auto flex w-full items-center gap-0 overflow-hidden rounded-full border-2 border-white/80 bg-white shadow-xl">
              <div className="flex min-w-0 flex-1 items-center gap-3 py-3 pl-5 pr-3 sm:py-3.5">
                <Skeleton className="size-5 shrink-0 rounded-full" delay={0} />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-5 w-full" delay={10} />
                </div>
              </div>
              <div className="py-1.5 pr-1.5">
                <Skeleton
                  className="h-full min-h-9 w-[76px] rounded-full sm:min-h-10 sm:w-[88px]"
                  delay={20}
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <Skeleton
            className="mx-auto mt-4 h-9 w-full max-w-[min(100%,36rem)] sm:h-11 md:h-12"
            delay={30}
          />

          {/* Subtitle */}
          <Skeleton
            className="mx-auto mt-1 h-4 w-[min(100%,20rem)] max-w-full sm:h-5"
            delay={45}
          />

          {/* Stats */}
          <div className="mt-3 hidden grid-cols-3 gap-2 sm:mt-3.5 md:mt-4 md:grid">
            {[0, 20, 40].map((extra) => (
              <div
                key={extra}
                className="space-y-2 rounded-lg border border-white/10 bg-black/20 px-2.5 py-2 backdrop-blur-sm"
              >
                <Skeleton className="mx-auto h-8 w-20 bg-slate-200/90" delay={60 + extra} />
                <Skeleton
                  className="mx-auto h-3 w-24 max-w-full bg-slate-200/80"
                  delay={70 + extra}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
