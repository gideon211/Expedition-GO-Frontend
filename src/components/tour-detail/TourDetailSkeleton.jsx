import { Navbar } from "@/components/homepage/Navbar";
import { Footer } from "@/components/homepage/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { CarouselCardsSkeleton } from "@/components/homepage/skeletons/CarouselCardsSkeleton";

export function TourDetailSkeleton() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[color:var(--page-bg)]">
      <Navbar />
      <div className="h-[var(--navbar-offset)] shrink-0" aria-hidden />

      <main className="mx-auto max-w-[1520px] px-4 pb-8 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <Skeleton className="mb-5 h-9 w-24 rounded-full" />
        <Skeleton className="h-10 w-full max-w-3xl" delay={30} />
        <div className="mt-3 flex flex-wrap gap-3">
          <Skeleton className="h-4 w-28" delay={50} />
          <Skeleton className="h-4 w-24" delay={60} />
          <Skeleton className="h-4 w-32" delay={70} />
        </div>

        <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
          <Skeleton className="h-[300px] w-full rounded-xl sm:h-[430px] lg:h-[520px]" delay={90} />
          <Skeleton className="hidden h-[520px] rounded-lg xl:block" delay={110} />
        </div>

        <div className="mt-5 flex gap-2 overflow-hidden">
          {[0, 1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-10 w-24 shrink-0 rounded-full" delay={120 + item * 15} />
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <Skeleton className="h-6 w-40" delay={180} />
          <Skeleton className="h-4 w-full max-w-2xl" delay={200} />
          <Skeleton className="h-4 w-full max-w-xl" delay={220} />
          <Skeleton className="h-4 w-5/6 max-w-lg" delay={240} />
        </div>

        <section className="mt-10 py-4">
          <Skeleton className="mb-4 h-7 w-52" delay={260} />
          <CarouselCardsSkeleton delay={280} cardWidth={280} gap={16} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
