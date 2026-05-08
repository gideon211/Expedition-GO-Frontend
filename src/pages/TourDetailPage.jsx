import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  ArrowLeft, 
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clock,
  Gem,
  Star, 
  Heart,
  Check,
  X,
  Languages,
  Minus,
  Plus,
  Truck,
  Users,
  MapPin,
  Grid3X3
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/homepage/Navbar";
import { Footer } from "@/components/homepage/Footer";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { RecentlyViewedProvider, useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCart } from "@/contexts/CartContext";
import { getTourByTitle } from "@/lib/tourData";
import fallbackTourImage from "@/assets/images/hero_pic.jpg";

const EXTERNAL_FALLBACK_IMAGES = [
  "https://ecotourghana.com/img/n10.jpg",
  "https://grassroottours.com/wp-content/uploads/2019/04/IMG_5843-370x260.jpg",
  "https://images.squarespace-cdn.com/content/v1/65cfd1369377d32bcd0051fa/1713964352006-GG68CSEC76Z06G1JZBFQ/Accra+City+Tour-+Sheeda+Travel+Tribe.jpg",
  "https://images.squarespace-cdn.com/content/v1/65cfd1369377d32bcd0051fa/f0eaf879-3685-41fb-ba88-5fbab02dda4a/Travel+to+Ghana-+Sheeda+Travel+Tribe.jpg",
  "https://www.outlooktravelmag.com/media/ghana-1-1582212936.profileImage.2x-jpg-webp.webp",
];

const normalizeImageKey = (imageUrl) =>
  String(imageUrl || "")
    .trim()
    .replace(/[?#].*$/, "")
    .replace(/\/$/, "")
    .toLowerCase();

const dedupeImages = (imageUrls) => {
  const seen = new Set();
  return imageUrls.filter((url) => {
    const key = normalizeImageKey(url);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const safeDecodeRouteParam = (value) => {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

// Mock data - In production, this would come from an API
const tourData = {
  name: "7D6N Private Tours - United Kingdom + London + Oxford + Cambridge + Windsor",
  price: 1467,
  duration: "7 days / 6 nights",
  groupType: "Private tour",
  location: "London",
  language: "Mandarin and English",
  transferInfo: "Airport/station pick-up and drop-off included",
  summaryTags: ["Departure guaranteed", "Car-type options available", "Self-selected hotels"],
  imageCover: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1800&q=80",
  images: [
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1505765050516-f72dcac9c60f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1512706604291-210a56c3b6e9?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1543791184-6f160248f1f2?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=80",
  ],
  ratingsAverage: 4.8,
  ratingsQuantity: 247,
  highlight:
    "Enjoy exclusive 4-diamond hotel accommodations throughout your journey, dedicated car service, and concierge one-on-one service.",
  itinerary: [
    "Arrive in London - 24-hour pick-up service at the airport/station",
    "Hotel pick-up - Discover Windsor Castle (admission included) - Prestigious Oxford University - Return to hotel",
    "Pick-up from hotel - Explore historic Cambridge University - See the iconic Tower Bridge - Return to hotel",
    "London - Free day (Westminster area & The British Museum)",
    "London - Free day (Hyde Park, Natural History Museum & Notting Hill)",
    "London - Free day (National Gallery, London Eye & Thames cruise)",
    "Enjoy 24-hour dedicated car service for airport/train station transfer - End of the trip",
  ],
  includesByTraveler: {
    adults: {
      notice: "The following instructions only apply to adults (12 years or over).",
      included: [
        {
          title: "Accommodation",
          description:
            "Accommodation at your self-selected hotels. The number of guests allowed depends on room type and hotel policy.",
        },
        {
          title: "Meals",
          description:
            "Breakfast details are based on your selected hotel room. Adults are responsible for their own meals during free time.",
        },
        {
          title: "Tour staff",
          description:
            "Local Mandarin and English-speaking driver transportation is included throughout the itinerary.",
        },
        {
          title: "Tickets and activities",
          description:
            "Admission ticket to the main entrance of the attractions listed in the itinerary, including Windsor Castle.",
        },
        {
          title: "Pick-up and drop-off",
          description:
            "Private vehicle pick-up and drop-off service on the first and last day of your itinerary.",
        },
      ],
      excluded: [
        {
          title: "Transportation",
          description:
            "Round-trip transportation from your departure city to London is not included.",
        },
        {
          title: "Additional fees",
          description:
            "Personal expenses such as laundry, excess baggage charges, phone calls, and optional activities are excluded.",
        },
      ],
    },
    children: {
      notice: "Child pricing and inclusions apply to travelers aged 2-11 years.",
      included: [
        {
          title: "Accommodation",
          description:
            "Children can stay in selected room types according to each hotel's family occupancy policy.",
        },
        {
          title: "Tour staff",
          description:
            "Driver-assisted transfers and itinerary transport are included for children.",
        },
        {
          title: "Tickets and activities",
          description:
            "Included attractions follow package policy. Some attractions may require age-based upgrades at check-in.",
        },
      ],
      excluded: [
        {
          title: "Meals",
          description:
            "Children's meal inclusions vary by hotel and venue; extra meals are paid separately.",
        },
        {
          title: "Additional fees",
          description:
            "Optional experiences, personal purchases, and insurance are not included.",
        },
      ],
    },
  },
  startDates: [
    "2026-05-09T00:00:00.000Z",
    "2026-05-10T00:00:00.000Z",
    "2026-05-11T00:00:00.000Z",
    "2026-05-12T00:00:00.000Z",
    "2026-05-13T00:00:00.000Z",
    "2026-05-14T00:00:00.000Z",
    "2026-05-15T00:00:00.000Z",
    "2026-05-16T00:00:00.000Z",
    "2026-05-17T00:00:00.000Z",
    "2026-05-18T00:00:00.000Z",
    "2026-05-19T00:00:00.000Z",
    "2026-05-20T00:00:00.000Z",
    "2026-05-21T00:00:00.000Z",
    "2026-05-22T00:00:00.000Z",
    "2026-05-23T00:00:00.000Z",
    "2026-05-24T00:00:00.000Z",
    "2026-05-25T00:00:00.000Z",
    "2026-05-26T00:00:00.000Z",
    "2026-05-27T00:00:00.000Z",
    "2026-05-28T00:00:00.000Z",
    "2026-05-29T00:00:00.000Z",
    "2026-05-30T00:00:00.000Z",
    "2026-05-31T00:00:00.000Z",
  ],
};

function TourDetailContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { convertPrice } = useCurrency();
  const { addToCart } = useCart();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const fallbackImagePool = useMemo(
    () => dedupeImages([...tourData.images, ...EXTERNAL_FALLBACK_IMAGES, fallbackTourImage]),
    []
  );
  const mergedImages = useMemo(() => {
    return dedupeImages([...tourData.images, ...EXTERNAL_FALLBACK_IMAGES, fallbackTourImage]);
  }, []);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false);
  const [galleryPreviewIndex, setGalleryPreviewIndex] = useState(0);
  const [gallerySlideDirection, setGallerySlideDirection] = useState(0);
  const [galleryModalView, setGalleryModalView] = useState("grid");
  const [mainImageTouchStartX, setMainImageTouchStartX] = useState(null);
  const thumbnailImages = useMemo(
    () => mergedImages.map((image, index) => ({ image, index })).filter((item) => item.index !== selectedImage),
    [mergedImages, selectedImage]
  );
  const sideGalleryImages = useMemo(() => thumbnailImages.slice(0, 4), [thumbnailImages]);
  const selectedTourDuration = tourData.duration;
  const selectedTourPriceNumber = tourData.price;
  const selectedTourRatingNumber = tourData.ratingsAverage;
  const selectedTourReviewsNumber = tourData.ratingsQuantity;
  const [selectedDate, setSelectedDate] = useState();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [expandedDay, setExpandedDay] = useState(0);
  const [travelerType, setTravelerType] = useState("adults");
  const selectedTourTitle = useMemo(() => safeDecodeRouteParam(id) || tourData.name, [id]);

  useEffect(() => {
    setSelectedImage(0);
  }, [id]);

  useEffect(() => {
    // Only add to recently viewed once when the page loads
    // Try to get the actual tour data from homepage
    const actualTour = getTourByTitle(selectedTourTitle);
    const tourImage = actualTour?.image || mergedImages[0] || tourData.imageCover;
    
    const recentTourData = {
      title: selectedTourTitle, // This is the actual tour title from URL
      duration: actualTour?.duration || selectedTourDuration,
      price: actualTour?.price || selectedTourPriceNumber,
      rating: actualTour?.rating || String(selectedTourRatingNumber),
      reviews: actualTour?.reviews || String(selectedTourReviewsNumber),
      image: tourImage,
    };
    
    console.log('=== ADDING TO RECENTLY VIEWED ===');
    console.log('Tour ID from URL:', id);
    console.log('Decoded Title:', selectedTourTitle);
    console.log('Found actual tour:', actualTour);
    console.log('Tour Data:', recentTourData);
    console.log('Image URL:', tourImage);
    
    addToRecentlyViewed(recentTourData);
    
    // Check what's in localStorage after adding
    setTimeout(() => {
      const stored = localStorage.getItem('recentlyViewed_guest');
      console.log('LocalStorage after add:', stored);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Parsed recently viewed:', parsed);
        console.log('Number of items:', parsed.length);
      }
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Only re-run when the tour ID changes

  const isFavorited = isInWishlist(selectedTourTitle);

  const handleWishlistToggle = () => {
    toggleWishlist({
      title: selectedTourTitle,
      duration: selectedTourDuration,
      price: selectedTourPriceNumber,
      rating: String(selectedTourRatingNumber),
      reviews: String(selectedTourReviewsNumber),
      image: mergedImages[0] || tourData.imageCover,
    });
  };

  const selectedTravelerMeta = tourData.includesByTraveler[travelerType];
  const totalTravelers = adults + children;
  const totalPrice = useMemo(() => selectedTourPriceNumber * Math.max(1, totalTravelers), [selectedTourPriceNumber, totalTravelers]);
  const convertedUnitPrice = convertPrice(selectedTourPriceNumber);
  const convertedTotalPrice = convertPrice(totalPrice);

  const availableDateKeys = useMemo(
    () => new Set(tourData.startDates.map((date) => date.slice(0, 10))),
    []
  );

  const handleCheckAvailability = () => {
    if (!selectedDate) return;

    const added = addToCart({
      tourId: id,
      title: selectedTourTitle,
      duration: selectedTourDuration,
      price: selectedTourPriceNumber,
      rating: String(selectedTourRatingNumber),
      reviews: String(selectedTourReviewsNumber),
      image: mergedImages[0] || tourData.imageCover,
      selectedDate: selectedDate.toISOString(),
      adults,
      children,
    });

    if (added) {
      navigate("/cart");
    }
  };

  const handleImageError = (event) => {
    const currentSrc = event.currentTarget.src;
    const startOffset = Number(event.currentTarget.dataset.fallbackOffset || 0);
    const triedKeys = new Set(
      String(event.currentTarget.dataset.triedKeys || "")
        .split("|")
        .filter(Boolean)
    );

    for (let step = 0; step < fallbackImagePool.length; step += 1) {
      const candidate = fallbackImagePool[(startOffset + step) % fallbackImagePool.length];
      const candidateKey = normalizeImageKey(candidate);
      const currentKey = normalizeImageKey(currentSrc);

      if (!candidateKey || triedKeys.has(candidateKey) || candidateKey === currentKey) continue;

      triedKeys.add(candidateKey);
      event.currentTarget.dataset.triedKeys = Array.from(triedKeys).join("|");
      event.currentTarget.src = candidate;
      return;
    }

    event.currentTarget.onerror = null;
    event.currentTarget.src = fallbackTourImage;
  };

  const handleOpenGallery = (index = selectedImage, view = "viewer") => {
    setGalleryPreviewIndex(index);
    setGallerySlideDirection(0);
    setGalleryModalView(view);
    setIsGalleryDialogOpen(true);
  };

  const handleCloseGallery = () => {
    setIsGalleryDialogOpen(false);
    setGalleryModalView("grid");
  };

  const handleGalleryDialogChange = (open) => {
    setIsGalleryDialogOpen(open);
    if (!open) {
      setGalleryModalView("grid");
    }
  };

  const handleOpenGalleryViewer = (index) => {
    setGallerySlideDirection(index > galleryPreviewIndex ? 1 : -1);
    setSelectedImage(index);
    setGalleryPreviewIndex(index);
    setGalleryModalView("viewer");
  };

  const showPreviousGalleryImage = () => {
    if (mergedImages.length === 0) return;
    const previousIndex = (galleryPreviewIndex - 1 + mergedImages.length) % mergedImages.length;
    setGallerySlideDirection(-1);
    setSelectedImage(previousIndex);
    setGalleryPreviewIndex(previousIndex);
  };

  const showNextGalleryImage = () => {
    if (mergedImages.length === 0) return;
    const nextIndex = (galleryPreviewIndex + 1) % mergedImages.length;
    setGallerySlideDirection(1);
    setSelectedImage(nextIndex);
    setGalleryPreviewIndex(nextIndex);
  };

  const showNextMainImage = () => {
    if (mergedImages.length === 0) return;
    setSelectedImage((prev) => Math.min(prev + 1, mergedImages.length - 1));
  };

  const showPreviousMainImage = () => {
    if (mergedImages.length === 0) return;
    setSelectedImage((prev) => Math.max(prev - 1, 0));
  };

  const handleMainImageTouchStart = (event) => {
    setMainImageTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleMainImageTouchEnd = (event) => {
    if (mainImageTouchStartX === null) return;
    const endX = event.changedTouches[0]?.clientX ?? mainImageTouchStartX;
    const deltaX = endX - mainImageTouchStartX;
    if (deltaX < -35) showNextMainImage();
    if (deltaX > 35) showPreviousMainImage();
    setMainImageTouchStartX(null);
  };

  const viewerSlideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 70 : -70,
      opacity: 0,
      scale: 0.985,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? -70 : 70,
      opacity: 0,
      scale: 0.985,
    }),
  };

  return (
    <div className="min-h-screen bg-[color:var(--page-bg)]">
      <Navbar />
      
      {/* Navbar spacer */}
      <div className="h-[58px] sm:h-[96px] lg:h-[104px]" />

      <main className="mx-auto max-w-[1520px] px-3 pb-4 pt-2 sm:px-5 sm:pb-6 sm:pt-3 lg:px-6 lg:pb-8 lg:pt-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-[color:var(--brand-green)]"
        >
          <ArrowLeft className="size-4" />
          {t("common.back")}
        </button>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <h1 className="ml-1 max-w-[85%] font-bold leading-tight text-slate-900" style={{ fontSize: "clamp(1.35rem, 1.8vw + 0.8rem, 2.2rem)" }}>
                {selectedTourTitle}
              </h1>
              <button
                onClick={handleWishlistToggle}
                className="grid size-9 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-700 transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
              >
                <Heart className={`size-4 ${isFavorited ? "fill-[color:var(--brand-green)] text-[color:var(--brand-green)]" : ""}`} />
              </button>
            </div>

            {/* <div className="mb-4 flex flex-wrap gap-2">
              {tourData.summaryTags.map((tag) => (
                // <span key={tag} className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 sm:text-xs">
                //   {tag}
                // </span>
              // ))}
            </div> */}

            <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
              <div
                className="relative overflow-hidden rounded-2xl bg-slate-100 p-1.5 sm:p-2"
                onTouchStart={handleMainImageTouchStart}
                onTouchEnd={handleMainImageTouchEnd}
              >
                <div className="flex h-[320px] w-full transition-transform duration-300 ease-out sm:h-[420px] lg:h-[520px]" style={{ transform: `translateX(-${selectedImage * 100}%)` }}>
                  {mergedImages.map((image, index) => (
                    <img
                      key={`featured-slide-${index}`}
                      src={image || fallbackTourImage}
                      alt={`Tour gallery featured image ${index + 1}`}
                      data-fallback-offset={index}
                      onError={handleImageError}
                      className="h-full w-full shrink-0 rounded-xl object-cover"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenGallery(selectedImage, "grid")}
                  className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-slate-900 shadow-sm transition hover:bg-white md:hidden"
                >
                  View all
                </button>
              </div>

              {sideGalleryImages.length > 0 && (
                <div className="hidden grid-cols-2 grid-rows-2 gap-2 md:grid">
                  {sideGalleryImages.map(({ image, index }, cardIndex) => {
                    const isLastCard = cardIndex === sideGalleryImages.length - 1;
                    return (
                      <div key={`gallery-side-${index}`} className="relative h-[130px] overflow-hidden rounded-xl sm:h-[160px] lg:h-[254px]">
                        <button
                          type="button"
                          onClick={() => setSelectedImage(index)}
                          className="h-full w-full"
                        >
                          <img
                            src={image || fallbackTourImage}
                            alt={`Tour gallery thumbnail ${index + 1}`}
                            data-fallback-offset={index}
                            onError={handleImageError}
                            className="h-full w-full object-cover transition hover:scale-[1.02]"
                          />
                        </button>
                        {isLastCard && (
                          <button
                            type="button"
                            onClick={() => handleOpenGallery(selectedImage, "grid")}
                            className="absolute bottom-2 right-2 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-white"
                          >
                            View all
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {thumbnailImages.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2 md:hidden">
                {thumbnailImages.slice(0, 3).map(({ image, index }) => (
                  <button
                    key={`gallery-mobile-thumb-${index}`}
                    onClick={() => setSelectedImage(index)}
                    className="h-20 overflow-hidden rounded-lg border-2 border-transparent transition hover:border-[color:var(--brand-green)] sm:h-24"
                  >
                    <img
                      src={image || fallbackTourImage}
                      alt={`Tour gallery thumbnail ${index + 1}`}
                      data-fallback-offset={index}
                      onError={handleImageError}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2 rounded-xl border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{tourData.groupType}</p>
                  <p className="text-sm text-slate-600">Travel expert, private car service, customizable itinerary</p>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">Group size</p>
                <p className="text-sm text-slate-600">Flexible (travel independently)</p>
              </div>
              <div className="mt-2 flex items-start gap-2 rounded-xl border border-slate-200 p-3">
                <Gem className="mt-0.5 size-5 text-[color:var(--brand-green)]" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">4 diamonds: High-end</p>
                  <p className="text-sm text-slate-600">Curated premium itinerary</p>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-xl border border-slate-200 p-3">
                <Languages className="mt-0.5 size-5 text-[color:var(--brand-green)]" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Service language</p>
                  <p className="text-sm text-slate-600">{tourData.language}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-xl border border-slate-200 p-3">
                <MapPin className="mt-0.5 size-5 text-[color:var(--brand-green)]" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Departure city</p>
                  <p className="text-sm text-slate-600">{tourData.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-xl border border-slate-200 p-3">
                <Truck className="mt-0.5 size-5 text-[color:var(--brand-green)]" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Pick-up & drop-off methods</p>
                  <p className="text-sm text-slate-600">{tourData.transferInfo}</p>
                </div>
              </div>
            </div>
          </article>

          <Dialog open={isGalleryDialogOpen} onOpenChange={handleGalleryDialogChange}>
            <DialogContent
              hideCloseButton
              className="left-0 top-0 h-[100dvh] max-h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-0 bg-slate-200 p-0 shadow-none"
            >
              <DialogTitle className="sr-only">Tour image gallery</DialogTitle>
              <button
                type="button"
                onClick={handleCloseGallery}
                className="absolute left-3 top-3 z-20 grid size-9 place-items-center rounded-full bg-white/95 text-slate-700 shadow-sm transition hover:bg-white sm:left-4 sm:top-4"
                aria-label="Close gallery"
              >
                <X className="size-4" />
              </button>

              <AnimatePresence mode="wait">
                {galleryModalView === "grid" ? (
                  <motion.div
                    key="gallery-grid-view"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="mx-auto h-[100dvh] max-w-[690px] overflow-y-auto px-3 pb-6 pt-14 sm:px-4 sm:pt-16"
                  >
                    <div className="columns-2 gap-2.5 sm:columns-3 sm:gap-3">
                      {mergedImages.map((image, index) => (
                        <button
                          key={`dialog-gallery-grid-${index}`}
                          type="button"
                          onClick={() => handleOpenGalleryViewer(index)}
                          className="mb-2.5 block w-full break-inside-avoid overflow-hidden rounded-md bg-slate-100 sm:mb-3"
                        >
                          <img
                            src={image || fallbackTourImage}
                            alt={`Tour gallery grid image ${index + 1}`}
                            data-fallback-offset={index}
                            onError={handleImageError}
                            className="w-full object-cover transition hover:scale-[1.01] active:scale-100"
                          />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="gallery-viewer-mode"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="relative h-[100dvh] bg-white px-3 pb-4 pt-12 sm:px-4 sm:pt-14"
                  >
                  <p className="absolute left-1/2 top-5 z-10 -translate-x-1/2 text-xs font-semibold text-slate-700 sm:top-6">
                    {galleryPreviewIndex + 1} / {mergedImages.length}
                  </p>

                  <button
                    type="button"
                    onClick={() => setGalleryModalView("grid")}
                    className="absolute right-5 top-5 z-10 grid size-9 place-items-center rounded-full bg-white/95 text-slate-700 shadow-sm transition hover:bg-white sm:right-6 sm:top-6"
                    aria-label="Back to gallery grid"
                  >
                    <Grid3X3 className="size-4" />
                  </button>

                  <div className="relative mx-auto h-full w-full max-w-[1000px] overflow-hidden px-9 sm:px-12">
                    <button
                      type="button"
                      onClick={showPreviousGalleryImage}
                      className="absolute -left-2 top-1/2 z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-700 shadow-sm transition hover:bg-white sm:grid sm:-left-3"
                      aria-label="Show previous image"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <AnimatePresence custom={gallerySlideDirection} initial={false} mode="wait">
                      <motion.div
                        key={`modal-image-${galleryPreviewIndex}`}
                        custom={gallerySlideDirection}
                        variants={viewerSlideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.18}
                        onDragEnd={(_, info) => {
                          if (info.offset.x < -70) showNextGalleryImage();
                          if (info.offset.x > 70) showPreviousGalleryImage();
                        }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <img
                          src={mergedImages[galleryPreviewIndex] || fallbackTourImage}
                          alt={`Tour gallery image ${galleryPreviewIndex + 1}`}
                          data-fallback-offset={galleryPreviewIndex}
                          onError={handleImageError}
                          className="max-h-[80vh] max-w-full rounded-sm object-contain"
                        />
                      </motion.div>
                    </AnimatePresence>
                    <button
                      type="button"
                      onClick={showNextGalleryImage}
                      className="absolute -right-2 top-1/2 z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-700 shadow-sm transition hover:bg-white sm:grid sm:-right-3"
                      aria-label="Show next image"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </div>
                </motion.div>
                )}
              </AnimatePresence>
            </DialogContent>
          </Dialog>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white py-3.5 pl-3.5 pr-0.5 shadow-sm sm:py-4 sm:pl-4 sm:pr-3 lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-[1.45rem] font-bold text-slate-900 sm:text-[1.75rem]">Itinerary options</h2>

            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => !availableDateKeys.has(date.toISOString().slice(0, 10))}
              className="mt-4 ml-2 w-[97%] sm:ml-0 sm:w-full"
            />
            <p className="mt-2 flex w-full items-center justify-center gap-1 border-t border-slate-200 pt-2 text-center text-xs text-slate-500">
              <CircleAlert className="size-3.5" />
              Currency USD | Booking notices
            </p>

            <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold text-slate-900">Adult <span className="font-normal text-slate-500">12 years or over</span></p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                    className="grid size-7 place-items-center rounded-full border border-slate-300 text-slate-700 transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-slate-900">{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults((prev) => Math.min(9, prev + 1))}
                    className="grid size-7 place-items-center rounded-full border border-slate-300 text-slate-700 transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold text-slate-900">Child <span className="font-normal text-slate-500">2-11 years old</span></p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
                    className="grid size-7 place-items-center rounded-full border border-slate-300 text-slate-700 transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-slate-900">{children}</span>
                  <button
                    type="button"
                    onClick={() => setChildren((prev) => Math.min(9, prev + 1))}
                    className="grid size-7 place-items-center rounded-full border border-slate-300 text-slate-700 transition hover:border-[color:var(--brand-green)] hover:text-[color:var(--brand-green)]"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-500">From</p>
              <div className="mt-1 flex items-end gap-1">
                <span className="text-3xl font-bold text-slate-900">{convertedUnitPrice.formatted}</span>
                <span className="mb-1 text-sm text-slate-500">/ person</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Total {convertedTotalPrice.formatted}
              </p>
              <p className="mt-1 text-xs text-slate-500">Incl. taxes and fees</p>
            </div>

            <Button
              onClick={handleCheckAvailability}
              disabled={!selectedDate}
              className="mx-auto mt-4 h-12 w-[92%] bg-[color:var(--brand-green)] text-base font-semibold !text-white hover:bg-[color:var(--brand-green)]/90 disabled:cursor-not-allowed disabled:opacity-60 sm:mx-0 sm:w-full"
            >
              Check availability
            </Button>
          </aside>
        </section>

        <section className="mt-6 w-full lg:w-[calc(100%-356px)] xl:w-[calc(100%-376px)] rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm sm:p-5">
          <h2 className="text-[1.45rem] font-bold text-slate-900 sm:text-[1.9rem]">Highlights</h2>
          <div className="mt-4 flex items-start gap-3">
            <Gem className="mt-0.5 size-5 shrink-0 text-[color:var(--brand-green)]" />
            <p className="text-base leading-relaxed text-slate-700">{tourData.highlight}</p>
          </div>
        </section>

        <section className="mt-6 w-full lg:w-[calc(100%-356px)] xl:w-[calc(100%-376px)] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-[1.45rem] font-bold text-slate-900 sm:text-[1.9rem]">7-day itinerary</h2>
          <div className="mt-4 divide-y divide-slate-200">
            {tourData.itinerary.map((item, index) => {
              const isOpen = expandedDay === index;
              return (
                <div key={`day-${index + 1}`} className="py-2">
                  <button
                    type="button"
                    onClick={() => setExpandedDay(isOpen ? -1 : index)}
                    className="flex w-full items-start gap-3 rounded-md px-1 py-2 text-left transition hover:bg-slate-50"
                  >
                    <span className="min-w-11 pt-0.5 text-sm font-bold text-slate-900 sm:min-w-12 sm:text-base">Day {index + 1}</span>
                    <span className="flex-1 text-slate-800">{item}</span>
                    {isOpen ? <ChevronUp className="mt-1 size-4 text-slate-500" /> : <ChevronDown className="mt-1 size-4 text-slate-500" />}
                  </button>
                  {isOpen && (
                    <div className="pb-2 pl-0 pr-1 text-sm text-slate-600 sm:pl-[3.75rem] sm:pr-6">
                      <p>
                        <Clock className="mr-1 mb-0.5 inline size-4 text-[color:var(--brand-green)]" />
                        Full day guided scheduling with flexible stop durations and concierge support.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6 w-full lg:w-[calc(100%-356px)] xl:w-[calc(100%-376px)] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-[1.45rem] font-bold text-slate-900 sm:text-[1.9rem]">What's included</h2>

          <div className="mt-4 grid max-w-[420px] grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setTravelerType("adults")}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                travelerType === "adults"
                  ? "bg-white text-[color:var(--brand-green)] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              adults
            </button>
            <button
              type="button"
              onClick={() => setTravelerType("children")}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                travelerType === "children"
                  ? "bg-white text-[color:var(--brand-green)] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              children
            </button>
          </div>

          <div className="mt-4 max-w-[540px] rounded-md bg-slate-100 px-3 py-2.5 text-sm text-slate-700 sm:px-4">
            {selectedTravelerMeta.notice}
          </div>

          <div className="mt-4 space-y-4">
            {selectedTravelerMeta.included.map((item) => (
              <div key={`in-${item.title}`} className="flex items-start gap-3">
                <Check className="mt-0.5 size-5 shrink-0 text-[color:var(--brand-green)]" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">{item.title}</h3>
                  <p className="text-slate-700">{item.description}</p>
                </div>
              </div>
            ))}

            {selectedTravelerMeta.excluded.map((item) => (
              <div key={`out-${item.title}`} className="flex items-start gap-3">
                <X className="mt-0.5 size-5 shrink-0 text-rose-500" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">{item.title}</h3>
                  <p className="text-slate-700">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 flex items-center gap-2 rounded-xl bg-[color:var(--brand-mist)] px-4 py-3 text-sm text-slate-700">
          <CalendarDays className="size-4 text-[color:var(--brand-green)]" />
          Select a date and click Check availability to add this tour to your cart.
        </div>
      </main>

      <Footer />
    </div>
  );
}

function TourDetailPage() {
  return (
    <AuthModalProvider>
      <RecentlyViewedProvider>
        <TourDetailContent />
      </RecentlyViewedProvider>
    </AuthModalProvider>
  );
}

export default TourDetailPage;
