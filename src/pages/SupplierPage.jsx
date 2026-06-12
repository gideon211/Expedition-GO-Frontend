import { useMemo, useState, useCallback } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Star, Heart, Phone, Mail, Globe, MapPin, ArrowLeft, ChevronUp, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/homepage/Navbar";
import { Footer } from "@/components/homepage/Footer";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { getTourByTitle, getAllTours } from "@/lib/tourData";
import { fetchTourById, fetchTours } from "@/api/tours";
import { adaptTourCard } from "@/lib/tourAdapter";
import { mapSupplierProfile, normalizeWebsiteUrl } from "@/lib/supplierProfile";

function SupplierContactRows({ supplierData }) {
  const websiteHref = normalizeWebsiteUrl(supplierData.website);

  return (
    <div className="mt-4 space-y-3">
      {supplierData.phone && (
        <div className="flex items-start gap-3 text-sm">
          <Phone className="mt-0.5 size-4 shrink-0 text-[color:var(--brand-green)]" />
          <a
            href={`tel:${supplierData.phone.replace(/\s/g, "")}`}
            className="min-w-0 flex-1 break-words text-slate-700 hover:text-[color:var(--brand-green)]"
          >
            {supplierData.phone}
          </a>
        </div>
      )}
      {supplierData.email && (
        <div className="flex items-start gap-3 text-sm">
          <Mail className="mt-0.5 size-4 shrink-0 text-[color:var(--brand-green)]" />
          <a
            href={`mailto:${supplierData.email}`}
            className="min-w-0 flex-1 break-all text-[color:var(--brand-green)] underline-offset-2 hover:underline"
          >
            {supplierData.email}
          </a>
        </div>
      )}
      {websiteHref && (
        <div className="flex items-start gap-3 text-sm">
          <Globe className="mt-0.5 size-4 shrink-0 text-[color:var(--brand-green)]" />
          <a
            href={websiteHref}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 break-all text-[color:var(--brand-green)] underline-offset-2 hover:underline"
          >
            {supplierData.website}
          </a>
        </div>
      )}
      {supplierData.address && (
        <div className="flex items-start gap-3 text-sm">
          <MapPin className="mt-0.5 size-4 shrink-0 text-[color:var(--brand-green)]" />
          <span className="min-w-0 flex-1 break-words text-slate-700">{supplierData.address}</span>
        </div>
      )}
    </div>
  );
}

function SupplierPage() {
  const { tourTitle } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const decodedTitle = decodeURIComponent(tourTitle);
  const { convertPrice } = useCurrency();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [supplierInfoOpen, setSupplierInfoOpen] = useState(true);

  const tourLookupId =
    location.state?.tourId || location.state?.tourSlug || decodedTitle;

  const { data: tour, isLoading: tourLoading } = useQuery({
    queryKey: ["tour", "supplier-profile", tourLookupId],
    queryFn: async () => {
      const data = await fetchTourById(tourLookupId);
      return data?.tour || data || null;
    },
    enabled: !!tourLookupId,
    staleTime: 1000 * 60 * 5,
  });

  const supplierData = useMemo(() => {
    if (tour) {
      return mapSupplierProfile({
        tour,
        fallback: location.state?.supplierData,
      });
    }
    if (location.state?.supplierData) {
      return location.state.supplierData;
    }
    const staticTour = getTourByTitle(decodedTitle);
    if (!staticTour) return null;
    return mapSupplierProfile({
      fallback: {
        name: staticTour.supplierName || staticTour.operatorName,
        address: staticTour.city,
        rating: staticTour.rating,
      },
    });
  }, [tour, location.state?.supplierData, decodedTitle]);

  const { data: apiResponse, isLoading: apiLoading } = useQuery({
    queryKey: ["tours", "supplier", supplierData?.supplierId],
    queryFn: () => {
      const params = supplierData?.supplierId
        ? { supplierId: supplierData.supplierId, limit: 100 }
        : { limit: 100 };
      return fetchTours(params);
    },
    enabled: !!supplierData,
    staleTime: 1000 * 30,
  });

  const apiTours = useMemo(() => {
    if (!apiResponse?.tours) return [];
    const tours = apiResponse.tours;
    if (supplierData?.supplierId) return tours.map(adaptTourCard);
    const name = supplierData?.name?.toLowerCase().trim();
    if (!name) return [];
    return tours
      .filter((t) => {
        const sn = (t.supplier?.name || t.supplier?.companyName || t.operator?.companyName || "").toLowerCase().trim();
        return sn === name;
      })
      .map(adaptTourCard);
  }, [apiResponse, supplierData]);

  const staticFallback = useMemo(() => {
    return getAllTours().filter((t) => t.title !== decodedTitle);
  }, [decodedTitle]);

  const supplierTours = useMemo(() => {
    if (apiTours.length > 0) return apiTours;
    return staticFallback;
  }, [apiTours, staticFallback]);

  const ratingDisplay =
    supplierData?.rating != null && !Number.isNaN(Number(supplierData.rating))
      ? Number(supplierData.rating).toFixed(1)
      : null;

  if (!supplierData && tourLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="h-[var(--navbar-offset)] shrink-0" aria-hidden />
        <div className="flex min-h-[calc(100vh-var(--navbar-offset))] flex-col items-center justify-center gap-4 px-4">
          <p className="text-sm text-slate-500">Loading supplier...</p>
        </div>
      </div>
    );
  }

  if (!supplierData) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="h-[var(--navbar-offset)] shrink-0" aria-hidden />
        <div className="flex min-h-[calc(100vh-var(--navbar-offset))] flex-col items-center justify-center gap-4 px-4">
          <p className="text-sm text-slate-500">Supplier not found</p>
          <Link to="/" state={{ postAuthSplash: true }} className="text-sm font-semibold text-[color:var(--brand-green)] hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="h-[var(--navbar-offset)] shrink-0" aria-hidden />
      <main className="mx-auto max-w-[1520px] overflow-x-clip px-4 pb-8 pt-6 text-slate-900 sm:px-6 lg:px-8 lg:pt-10">
        <button
          type="button"
          onClick={() => {
            const historyIdx = window.history.state?.idx;
            if (typeof historyIdx === "number" && historyIdx > 0) {
              navigate(-1);
            } else {
              navigate("/");
            }
          }}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-900 transition hover:text-[color:var(--brand-green)]"
        >
          <ArrowLeft className="size-4" />
          {t("common.back")}
        </button>

        <div className="flex min-w-0 items-start gap-4 sm:items-center">
          <div className="grid size-16 shrink-0 place-items-center rounded-full border border-slate-200 bg-white px-1 text-xs font-black text-[color:var(--brand-green)]">
            {supplierData.logo ? (
              <img src={supplierData.logo} alt="" className="size-full rounded-full object-cover" />
            ) : (
              (supplierData.name || "").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-xl font-black text-slate-900 sm:text-2xl">{supplierData.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
              {ratingDisplay && (
                <>
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-slate-900">{ratingDisplay}</span>
                  <span>•</span>
                </>
              )}
              <span>{supplierTours.length} tours</span>
            </div>
          </div>
        </div>

        <div className="mt-6 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setSupplierInfoOpen(o => !o)}
            className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-[color:var(--brand-green)]"
          >
            About this supplier
            {supplierInfoOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
          {supplierInfoOpen && (
            <div className="pb-5">
              {supplierData.description && (
                <p className="break-words text-sm leading-7 text-slate-600">{supplierData.description}</p>
              )}
              <SupplierContactRows supplierData={supplierData} />
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-base font-black text-slate-900">All tours by this supplier</h2>
          {(apiLoading || tourLoading) && apiTours.length === 0 && (
            <p className="mt-4 text-sm text-slate-400">Loading tours...</p>
          )}
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {supplierTours.map((tour) => {
              const detailTo = `/tour/${encodeURIComponent(tour.slug || tour.title)}`;
              const converted = convertPrice(tour.price);
              const reviewsDisplay = tour.reviews ? (typeof tour.reviews === "number" ? String(tour.reviews) : String(tour.reviews).replace(/,/g, "")) : "0";
              const isFav = isInWishlist(tour.title);
              return (
                <article key={tour.title} className="group">
                  <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.08)] transition hover:shadow-md">
                    <div className="relative">
                      <Link
                        to={detailTo}
                        className="block overflow-hidden rounded-t-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand-green)]"
                      >
                        <div className="relative aspect-[4/3] bg-slate-100">
                          <img
                            src={tour.image}
                            alt=""
                            className="h-full w-full object-cover pointer-events-none transition duration-300 group-hover:scale-105"
                          />
                          <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-slate-700/95 px-2 py-1 text-[11px] font-bold text-white shadow-sm sm:text-[10px]">
                            {tour.duration}
                          </span>
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          toggleWishlist({
                            title: tour.title,
                            slug: tour.slug,
                            duration: tour.duration,
                            price: tour.price,
                            rating: tour.rating,
                            reviews: tour.reviews,
                            image: tour.image,
                          })
                        }
                        className="absolute right-2 top-2 z-10 grid size-9 place-items-center rounded-full border border-slate-200/90 bg-white text-slate-700 shadow-sm transition hover:scale-105"
                        aria-label={t("nav.wishlist")}
                      >
                        <Heart
                          className={`size-4 ${isFav ? "fill-[color:var(--brand-green)] text-[color:var(--brand-green)]" : "fill-none"}`}
                          strokeWidth={2}
                        />
                      </button>
                    </div>

                    <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5 sm:px-3.5 sm:pb-3.5 sm:pt-3">
                      <Link
                        to={detailTo}
                        className="line-clamp-2 min-h-[2.5rem] font-bold leading-snug text-slate-900 hover:underline"
                        style={{ fontSize: "clamp(0.8125rem, 0.6vw + 0.5rem, 0.9375rem)" }}
                      >
                        {tour.title}
                      </Link>

                      <p className="mt-1.5 text-[12px] font-medium leading-snug text-slate-500 sm:text-[11px]">
                        Free cancellation
                        <span className="mx-1 text-slate-400" aria-hidden>•</span>
                        Pickup included
                      </p>

                      <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                        <div className="flex min-w-0 items-center gap-1">
                          <Star
                            className="size-4 shrink-0 fill-amber-500 text-amber-500"
                            strokeWidth={1.5}
                            aria-hidden
                          />
                          <span className="text-[13px] font-bold tabular-nums text-slate-900 sm:text-[12px]">
                            {tour.rating}
                          </span>
                          <span className="text-[12px] text-slate-500 sm:text-[11px]">
                            ({reviewsDisplay})
                          </span>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[11px] font-medium leading-none text-slate-500">From</p>
                          <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-900">{converted.formatted}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default SupplierPage;
