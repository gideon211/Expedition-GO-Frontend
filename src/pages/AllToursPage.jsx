import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, SlidersHorizontal, X, CircleCheck, Star, Heart, Search } from "lucide-react";
import { Navbar } from "@/components/homepage/Navbar";
import { Footer } from "@/components/homepage/Footer";
import { TourCard } from "@/components/homepage/TourCard";
import { DestinationCard } from "@/components/homepage/DestinationCard";
import { Calendar } from "@/components/ui/calendar";
import {
  pickupTours,
  recommendedTours,
  topRatedTours,
  leisureTours,
  destinations,
  lastMinuteDeals,
  sidebarTopRated,
} from "@/components/homepage/data";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { AuthModal } from "@/components/ui/auth-modal";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCurrency } from "@/contexts/CurrencyContext";

function MobileAllToursCard({ item }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { convertPrice } = useCurrency();
  const [showDescription, setShowDescription] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const isFavorited = isInWishlist(item.title);
  const convertedPrice = convertPrice(item.price);

  const descriptionText = `Visit the castles of cape coast and explore the adventures of Kakum National Park with this guided tour from Accra. You'll learn and discover the history of Cape Coast Castle and Elmina Castle and also undertake the canopy walkway experience at Kakum National Park.`;
  const showReadMore = descriptionText.length > 170;

  const handleTouchStart = (event) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event) => {
    if (touchStartX === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX;
    const deltaX = endX - touchStartX;
    if (deltaX < -40) setShowDescription(true);
    if (deltaX > 40) setShowDescription(false);
    setTouchStartX(null);
  };

  return (
    <article
      className="overflow-hidden rounded-md border border-slate-300 bg-white"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`flex w-[200%] transition-transform duration-300 ease-out ${showDescription ? "-translate-x-1/2" : "translate-x-0"}`}
      >
        <div className="w-1/2">
          <div className="flex h-[188px]">
            <div className="relative w-[38%] overflow-hidden">
              <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
              <span className="absolute left-2 top-2 rounded-md bg-slate-900/80 px-2 py-1 text-[8px] font-bold text-white shadow-sm">
                {item.duration || "11 to 15 hours"}
              </span>
              <button
                type="button"
                onClick={() =>
                  toggleWishlist({
                    title: item.title,
                    duration: item.duration,
                    price: item.price,
                    rating: item.rating,
                    reviews: item.reviews,
                    image: item.image,
                    discount: item.discount,
                  })
                }
                className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/92 text-slate-700 shadow"
              >
                <Heart className={`size-4 ${isFavorited ? "fill-[color:var(--brand-green)] text-[color:var(--brand-green)]" : ""}`} />
              </button>
            </div>

            <div className="flex h-full w-[62%] flex-col bg-slate-100/80 p-2.5">
              <span className="inline-flex rounded-full bg-[color:var(--brand-mint)] px-3 py-1 text-[10px] font-semibold text-[color:var(--brand-green)]">
                Best Seller
              </span>
              <h3 className="mt-2 line-clamp-3 font-semibold leading-4 text-slate-900" style={{ fontSize: 'clamp(0.8875rem, 0.7vw + 0.4rem, 0.8125rem)' }}>{item.title}</h3>
              <div className="mt-2.5 space-y-1.5 text-[10px] text-slate-900">
                <p className="flex items-center gap-2">
                  <CircleCheck className="size-4" />
                  {t("features.freeCancellation")}
                </p>
                <p className="flex items-center gap-2">
                  <CircleCheck className="size-4" />
                  {t("tourDetail.pickupIncluded")}
                </p>
              </div>
              <div className="mt-auto mb-1 flex items-end justify-between">
                <div className="flex items-center gap-1 text-slate-800">
                  <Star className="size-4 fill-current text-emerald-500" />
                  <span className="text-[12px] leading-none text-emerald-500">4.8</span>
                  <span className="text-[10px] text-slate-700">({item.reviews})</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-600">from</p>
                  <p className="text-[16px] font-bold leading-[0.95] text-slate-900">{convertedPrice.formatted}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[188px] w-1/2 overflow-hidden bg-slate-100/60 p-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowDescription(false)}
              className="rounded p-1 text-slate-600"
              aria-label="Close description"
            >
              <X className="size-6" />
            </button>
          </div>
          <p className="mt-3 line-clamp-5 text-[11px] leading-5 text-slate-700">{descriptionText}</p>
          {showReadMore && (
            <button
              type="button"
              onClick={() => navigate(`/tour/${encodeURIComponent(item.title)}`)}
              className="mt-2 text-[11px] font-semibold text-slate-800 underline"
            >
              Read more
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function AllToursPageContent() {
  const CARDS_PER_PAGE = 8;
  const { t } = useTranslation();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [category]);
  const { isAuthModalOpen, closeAuthModal } = useAuthModal();
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const [appliedAdults, setAppliedAdults] = useState(2);
  const [appliedChildren, setAppliedChildren] = useState(0);
  const [appliedChildAges, setAppliedChildAges] = useState([]);

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState([]);

  const [showTravelers, setShowTravelers] = useState(false);
  const [selectedDates, setSelectedDates] = useState({ from: null, to: null });
  const [showDateCalendar, setShowDateCalendar] = useState(false);

  const [showTimeOfDayMenu, setShowTimeOfDayMenu] = useState(false);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState("");

  const [showPriceMenu, setShowPriceMenu] = useState(false);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(500);

  const [showRatingMenu, setShowRatingMenu] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedExperienceFilter, setSelectedExperienceFilter] = useState("All");
  const [canScrollFiltersLeft, setCanScrollFiltersLeft] = useState(false);
  const [canScrollFiltersRight, setCanScrollFiltersRight] = useState(false);
  const experienceFiltersRef = useRef(null);
  const [activeReview, setActiveReview] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);

  const adultsTriggerRef = useRef(null);
  const travelersPanelRef = useRef(null);
  const [travelersPanelPosition, setTravelersPanelPosition] = useState({ top: 0, left: 0 });

  const desktopDateTriggerRef = useRef(null);
  const mobileDateTriggerRef = useRef(null);
  const dateCalendarRef = useRef(null);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });

  const timeTriggerRef = useRef(null);
  const timeMenuRef = useRef(null);
  const [timeMenuPosition, setTimeMenuPosition] = useState({ top: 0, left: 0 });

  const priceTriggerRef = useRef(null);
  const priceMenuRef = useRef(null);
  const [priceMenuPosition, setPriceMenuPosition] = useState({ top: 0, left: 0 });

  const ratingTriggerRef = useRef(null);
  const ratingMenuRef = useRef(null);
  const [ratingMenuPosition, setRatingMenuPosition] = useState({ top: 0, left: 0 });

  const sidebarNewExperiences = [...sidebarTopRated, ...sidebarTopRated.slice(0, 2)];

  const categoryMap = {
    tours: { title: t("sections.featuredTitle"), items: pickupTours, type: "tours" },
    recommended: { title: t("sections.recommendedTitle"), items: recommendedTours, type: "tours" },
    deals: { title: t("sections.topRatedTitle"), items: topRatedTours, type: "tours" },
    leisure: { title: t("sections.likelyToSellOut"), items: leisureTours, type: "tours" },
    "last-minute-deals": { title: t("sections.lastMinuteDeals"), items: lastMinuteDeals, type: "tours" },
    "new-experiences": { title: t("sections.newExperiences"), items: sidebarNewExperiences, type: "tours" },
    destinations: { title: t("sections.destinations"), items: destinations, type: "destinations" },
    all: { title: t("sections.allToursTitle", { defaultValue: "All Tours" }), items: [...pickupTours, ...recommendedTours, ...topRatedTours, ...leisureTours], type: "tours" },
  };
  const peopleReviews = [
    {
      title: "Accra Guided City Tour Cultural and Historical Experience",
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=400&q=80",
      author: "Marcia_D, Apr 2026",
      headline: "Enjoyable and Informative tour",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent varius, risus non feugiat accumsan, sem libero ultrices neque...",
      fullText:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus porta faucibus sem, vitae convallis magna luctus et. Integer suscipit augue ut neque luctus, quis commodo justo vulputate. Suspendisse potenti. Donec posuere nisl at velit feugiat, a suscipit nisi semper. Curabitur rutrum cursus turpis, ut laoreet sem efficitur vel.",
    },
    {
      title: "Boti Waterfalls, Umbrella Rock, Aburi Gardens & Cocoa Farm",
      image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=400&q=80",
      author: "Kayley_E, Mar 2026",
      headline: "Unforgettable tour with Emmanuel",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis vitae velit in quam posuere pellentesque et ut neque...",
      fullText:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas vitae justo sit amet mi condimentum faucibus. Morbi luctus bibendum erat, sed faucibus magna suscipit et. Aliquam erat volutpat. Nunc tincidunt, nisl id dictum bibendum, risus arcu fermentum sem, in facilisis sapien nibh eget lorem.",
    },
    {
      title: "African Drum and Dance Lessons",
      image: "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?auto=format&fit=crop&w=400&q=80",
      author: "Audrey_D, Mar 2026",
      headline: "Exceptional!!",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ut mauris et risus porttitor tincidunt in sed nibh...",
      fullText:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum blandit orci in justo convallis, eget mattis velit malesuada. Donec sit amet urna et lacus rhoncus congue. Fusce in sapien non enim posuere fermentum. Cras commodo, mauris in viverra ultricies, lectus mauris commodo nunc, in posuere est arcu eu elit.",
    },
    {
      title: "Makola Market Walking Tour",
      image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=400&q=80",
      author: "ZsaZsa_S, Feb 2026",
      headline: "Sunday shopping trip to Makola ...",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed id leo eget augue tempus faucibus sed eu justo...",
      fullText:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc molestie ultrices urna, in laoreet nulla varius nec. Nam in efficitur erat. In feugiat, tortor sed pretium bibendum, purus dui posuere sem, a feugiat sapien justo et augue. Aenean euismod vulputate ligula, eget posuere nibh varius id.",
    },
    {
      title: "Cape Coast Castle Heritage Experience",
      image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
      author: "Nora_B, Feb 2026",
      headline: "History brought to life",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque varius justo non lectus fermentum, in ullamcorper risus dictum...",
      fullText:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras a malesuada lorem. Vestibulum ac purus sit amet risus sagittis pellentesque. Morbi mattis libero sed sem luctus, id feugiat justo dignissim. Sed in lorem egestas, imperdiet risus et, faucibus sapien.",
    },
    {
      title: "Volta Region Nature Day Trip",
      image: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=400&q=80",
      author: "Pius_T, Jan 2026",
      headline: "Worth every minute",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In placerat, sem vel fermentum tristique, tortor tortor tincidunt urna...",
      fullText:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur luctus sed purus at aliquet. Integer gravida, est non malesuada vestibulum, lorem justo pretium augue, in egestas risus sem non purus. Etiam eget tellus et augue pretium pretium vel non orci.",
    },
    {
      title: "Kakum Canopy Walk and Forest Tour",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
      author: "Eddy_W, Jan 2026",
      headline: "Fantastic and well organized",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ullamcorper, erat id faucibus tristique, erat nunc gravida enim...",
      fullText:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse interdum, erat ut pulvinar luctus, mi arcu faucibus nisl, eget suscipit nibh mi at enim. Sed non massa id lorem faucibus convallis. Integer id lectus in lorem consequat fringilla.",
    },
    {
      title: "Aburi Gardens Relaxation Tour",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80",
      author: "Clara_A, Dec 2025",
      headline: "Peaceful and refreshing",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse condimentum tincidunt dolor, id ultrices ligula lacinia non...",
      fullText:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean eu risus malesuada, pellentesque nisi at, vulputate velit. Sed eget urna in dui posuere iaculis at vitae odio. Vivamus pharetra ultrices egestas. Aliquam erat volutpat.",
    },
    {
      title: "Wli Waterfalls and Village Experience",
      image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=400&q=80",
      author: "Jared_K, Dec 2025",
      headline: "Refreshing and memorable",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent congue volutpat augue, sit amet tempus arcu tempor sed...",
      fullText:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vitae posuere massa. Morbi volutpat nunc at justo vestibulum, in facilisis nibh feugiat. Integer ac pulvinar mi, vitae feugiat lorem. Cras at lorem vitae magna sollicitudin eleifend.",
    },
    {
      title: "Bojo Beach and Sunset Canoe Tour",
      image: "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=400&q=80",
      author: "Selina_P, Nov 2025",
      headline: "Perfect end to our trip",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur efficitur, sapien eget faucibus bibendum, nibh leo feugiat purus...",
      fullText:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, odio at hendrerit tincidunt, magna neque pretium arcu, eget porta tortor libero id ante. Sed luctus, justo at fringilla malesuada, mauris justo varius felis, non porttitor ipsum velit id leo.",
    },
    ...Array.from({ length: 20 }, (_, index) => ({
      title: `Traveller Review Spotlight ${index + 1}`,
      image: `https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=400&q=80&sig=review${index + 1}`,
      author: `Guest_${index + 1}, 2026`,
      headline: "Great experience from start to finish",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer congue neque vitae justo iaculis, id porta sem commodo...",
      fullText:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer dignissim, enim vitae facilisis egestas, neque augue mattis mi, in faucibus sem leo vitae risus. Vivamus luctus, justo quis congue pulvinar, turpis nibh pulvinar magna, vel semper quam justo ac turpis.",
    })),
  ];

  const experienceFilters = [
    "All",
    "Multi-day",
    "Day trips",
    "Plantations & farms",
    "Quads & ATVs",
    "Monkeys",
    "Cooking classes",
    "African-American heritage",
    "Wellness & spas",
    "Safaris & wildlife",
    "Jungle",
    "Canopy walks",
    "Boat cruises",
    "Waterfalls",
    "Prohibition",
    "Bus tours",
  ];

  const { title, items, type } = categoryMap[category] || categoryMap.all;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const getExperienceKeywords = (filterLabel) => {
    const map = {
      "multi-day": ["expedition", "safari", "adventure", "heritage"],
      "day trips": ["city", "tour", "castle", "coast", "waterfall", "park"],
      "plantations & farms": ["farm", "cocoa", "plantation"],
      "quads & atvs": ["atv", "quad"],
      monkeys: ["monkey", "forest", "wildlife"],
      "cooking classes": ["cooking", "food", "culinary"],
      "african-american heritage": ["heritage", "history", "castle", "museum"],
    };

    return map[filterLabel.toLowerCase()] || [];
  };

  const matchesExperienceFilter = (item) => {
    if (selectedExperienceFilter === "All") return true;
    const keywords = getExperienceKeywords(selectedExperienceFilter);
    if (!keywords.length) return true;
    const haystack = Object.values(item)
      .filter((value) => typeof value === "string")
      .join(" ")
      .toLowerCase();
    return keywords.some((keyword) => haystack.includes(keyword));
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !normalizedQuery ||
      Object.values(item).some((value) =>
        typeof value === "string" ? value.toLowerCase().includes(normalizedQuery) : false
      );
    return matchesSearch && matchesExperienceFilter(item);
  });
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / CARDS_PER_PAGE));
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * CARDS_PER_PAGE,
    currentPage * CARDS_PER_PAGE
  );
  const totalReviewPages = Math.max(1, Math.ceil(peopleReviews.length / CARDS_PER_PAGE));
  const paginatedReviews = peopleReviews.slice(
    (currentReviewPage - 1) * CARDS_PER_PAGE,
    currentReviewPage * CARDS_PER_PAGE
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedDesktopDateTrigger = desktopDateTriggerRef.current?.contains(event.target);
      const clickedMobileDateTrigger = mobileDateTriggerRef.current?.contains(event.target);
      const clickedDateCalendar = dateCalendarRef.current?.contains(event.target);
      const clickedAdultsTrigger = adultsTriggerRef.current?.contains(event.target);
      const clickedTravelersPanel = travelersPanelRef.current?.contains(event.target);

      const clickedTimeTrigger = timeTriggerRef.current?.contains(event.target);
      const clickedTimeMenu = timeMenuRef.current?.contains(event.target);
      const clickedPriceTrigger = priceTriggerRef.current?.contains(event.target);
      const clickedPriceMenu = priceMenuRef.current?.contains(event.target);
      const clickedRatingTrigger = ratingTriggerRef.current?.contains(event.target);
      const clickedRatingMenu = ratingMenuRef.current?.contains(event.target);

      if (!clickedDesktopDateTrigger && !clickedMobileDateTrigger && !clickedDateCalendar) setShowDateCalendar(false);
      if (!clickedAdultsTrigger && !clickedTravelersPanel) setShowTravelers(false);
      if (!clickedTimeTrigger && !clickedTimeMenu) setShowTimeOfDayMenu(false);
      if (!clickedPriceTrigger && !clickedPriceMenu) setShowPriceMenu(false);
      if (!clickedRatingTrigger && !clickedRatingMenu) setShowRatingMenu(false);
    };

    if (showDateCalendar || showTravelers || showTimeOfDayMenu || showPriceMenu || showRatingMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDateCalendar, showTravelers, showTimeOfDayMenu, showPriceMenu, showRatingMenu]);

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const dateLabel = selectedDates?.from
    ? selectedDates?.to
      ? `${formatDate(selectedDates.from)} - ${formatDate(selectedDates.to)}`
      : `${formatDate(selectedDates.from)}`
    : "";

  const toggleDateCalendar = () => {
    const activeDateTrigger = window.innerWidth >= 768 ? desktopDateTriggerRef.current : mobileDateTriggerRef.current;
    if (!showDateCalendar && activeDateTrigger) {
      const rect = activeDateTrigger.getBoundingClientRect();
      setCalendarPosition({ top: rect.bottom + 8, left: rect.left });
    }
    setShowDateCalendar((value) => !value);
  };

  const toggleTravelersPanel = () => {
    if (!showTravelers && adultsTriggerRef.current) {
      const rect = adultsTriggerRef.current.getBoundingClientRect();
      setTravelersPanelPosition({ top: rect.bottom + 8, left: rect.left });
      setAdults(appliedAdults);
      setChildren(appliedChildren);
      setChildAges(Array.from({ length: appliedChildren }, (_, index) => appliedChildAges[index] ?? 7));
    }
    setShowTravelers((value) => !value);
  };

  const toggleTimeOfDayMenu = () => {
    if (!showTimeOfDayMenu && timeTriggerRef.current) {
      const rect = timeTriggerRef.current.getBoundingClientRect();
      setTimeMenuPosition({ top: rect.bottom + 8, left: rect.left });
    }
    setShowTimeOfDayMenu((value) => !value);
  };

  const togglePriceMenu = () => {
    if (!showPriceMenu && priceTriggerRef.current) {
      const rect = priceTriggerRef.current.getBoundingClientRect();
      setPriceMenuPosition({ top: rect.bottom + 8, left: rect.left });
    }
    setShowPriceMenu((value) => !value);
  };

  const toggleRatingMenu = () => {
    if (!showRatingMenu && ratingTriggerRef.current) {
      const rect = ratingTriggerRef.current.getBoundingClientRect();
      setRatingMenuPosition({ top: rect.bottom + 8, left: rect.left });
    }
    setShowRatingMenu((value) => !value);
  };

  const totalTravelers = adults + children;
  const canAddTraveler = totalTravelers < 15;
  const travelerLabel =
    appliedChildren > 0
      ? `${appliedAdults} Adult${appliedAdults === 1 ? "" : "s"}, ${appliedChildren} Child${appliedChildren === 1 ? "" : "ren"}`
      : `${appliedAdults} Adult${appliedAdults === 1 ? "" : "s"}`;

  const setChildrenCount = (nextChildren) => {
    const safeChildren = Math.max(0, nextChildren);
    setChildren(safeChildren);
    setChildAges((prev) => {
      if (safeChildren <= prev.length) return prev.slice(0, safeChildren);
      return [...prev, ...Array.from({ length: safeChildren - prev.length }, () => 7)];
    });
  };

  const timeOfDayLabel = selectedTimeOfDay || "Time of Day";
  const priceLabel = priceMin === 0 && priceMax === 500 ? "Price" : `$${priceMin} - $${priceMax}${priceMax === 500 ? "+" : ""}`;
  const ratingLabel = selectedRating ? `${selectedRating}+ Stars` : "Rating";

  const handleMinPriceChange = (value) => {
    const nextMin = Math.min(value, priceMax - 10);
    setPriceMin(nextMin);
  };

  const handleMaxPriceChange = (value) => {
    const nextMax = Math.max(value, priceMin + 10);
    setPriceMax(nextMax);
  };

  const renderStars = (filled) => {
    const stars = [];
    for (let i = 1; i <= 5; i += 1) {
      if (i <= filled) {
        stars.push(<span key={`star-${filled}-${i}`}>⭐</span>);
      }
    }
    return stars;
  };

  const updateFilterArrows = () => {
    const container = experienceFiltersRef.current;
    if (!container) return;
    const maxLeft = container.scrollWidth - container.clientWidth;
    setCanScrollFiltersLeft(container.scrollLeft > 2);
    setCanScrollFiltersRight(maxLeft > 2 && container.scrollLeft < maxLeft - 2);
  };

  const scrollExperienceFilters = (direction) => {
    const container = experienceFiltersRef.current;
    if (!container) return;
    const amount = 220;
    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
    requestAnimationFrame(updateFilterArrows);
    setTimeout(updateFilterArrows, 220);
  };
  useEffect(() => {
    const container = experienceFiltersRef.current;
    if (!container) return;

    updateFilterArrows();
    container.addEventListener("scroll", updateFilterArrows, { passive: true });
    window.addEventListener("resize", updateFilterArrows);

    return () => {
      container.removeEventListener("scroll", updateFilterArrows);
      window.removeEventListener("resize", updateFilterArrows);
    };
  }, [experienceFilters.length, category]);

  useEffect(() => {
    const container = experienceFiltersRef.current;
    if (!container) return;
    if (selectedExperienceFilter === "All") {
      container.scrollTo({ left: 0, behavior: "smooth" });
    }
    const frameId = requestAnimationFrame(updateFilterArrows);

    return () => cancelAnimationFrame(frameId);
  }, [selectedExperienceFilter]);

  useEffect(() => {
    const toggleBackToTop = () => {
      setShowBackToTop(window.scrollY > 320);
    };

    toggleBackToTop();
    window.addEventListener("scroll", toggleBackToTop, { passive: true });

    return () => {
      window.removeEventListener("scroll", toggleBackToTop);
    };
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [category, searchQuery, selectedExperienceFilter]);

  useEffect(() => {
    setCurrentReviewPage(1);
  }, [category]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (currentReviewPage > totalReviewPages) {
      setCurrentReviewPage(totalReviewPages);
    }
  }, [currentReviewPage, totalReviewPages]);

  return (
    <>
      <div className="flex min-h-screen flex-col">
        {/* Navbar - visible on all screens */}
        <div className="bg-white text-slate-900">
          <Navbar
            forceShowCompactSearch={true}
            externalSearchQuery={searchQuery}
            onExternalSearchChange={setSearchQuery}
          />
        </div>
        
        {/* Navbar spacer */}
        <div className="h-[68px] sm:h-[88px] lg:h-[104px]" />

        <main className="mx-auto flex-1 w-full max-w-[1520px] overflow-x-hidden bg-white px-4 pt-2 pb-6 sm:px-6 lg:px-8 lg:py-6">
          <div className="mb-8 mt-4">
            <h1 className="font-bold tracking-tight text-slate-900" style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.75rem)' }}>{title}</h1>
          </div>

          <div className="w-full">
            {category !== "destinations" && (
              <div className="mb-6 overflow-y-visible pb-1">
                <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 scrollbar-hide overscroll-x-contain lg:min-w-0 lg:overflow-visible lg:pb-0">
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                  >
                    <SlidersHorizontal className="size-4" />
                    <span>Filter</span>
                  </button>

                  <div className="relative">
                    <button
                      ref={desktopDateTriggerRef}
                      onClick={toggleDateCalendar}
                      className="hidden items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-100 lg:inline-flex"
                    >
                      <CalendarDays className="size-4" />
                      <span>{dateLabel ? `Date ${dateLabel}` : "Date"}</span>
                    </button>
                  </div>

                  <button
                    ref={adultsTriggerRef}
                    onClick={toggleTravelersPanel}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-900 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    <span>{travelerLabel}</span>
                    <ChevronDown className="size-4" />
                  </button>

                  <button
                    ref={timeTriggerRef}
                    onClick={toggleTimeOfDayMenu}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                  >
                    <span>{timeOfDayLabel}</span>
                    <ChevronDown className="size-4" />
                  </button>

                  <button
                    ref={priceTriggerRef}
                    onClick={togglePriceMenu}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                  >
                    <span>{priceLabel}</span>
                    <ChevronDown className="size-4" />
                  </button>

                  <button
                    ref={ratingTriggerRef}
                    onClick={toggleRatingMenu}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                  >
                    <span>{ratingLabel}</span>
                    <ChevronDown className="size-4" />
                  </button>

                  <span className="mx-1 h-8 w-px shrink-0 bg-slate-300" aria-hidden="true" />

                  <button
                    type="button"
                    onClick={() => scrollExperienceFilters("left")}
                    disabled={!canScrollFiltersLeft}
                    className="hidden lg:grid size-9 shrink-0 place-items-center rounded-full border border-slate-300 bg-slate-50 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Scroll filters left"
                  >
                    <ChevronLeft className="size-4" />
                  </button>

                  <div
                    ref={experienceFiltersRef}
                    className="flex shrink-0 items-center gap-2 lg:w-0 lg:flex-1 lg:shrink lg:overflow-x-auto lg:overscroll-x-contain lg:[scrollbar-width:none] lg:[-ms-overflow-style:none] lg:[&::-webkit-scrollbar]:hidden"
                  >
                    {experienceFilters.map((filterLabel) => {
                      const isActive = selectedExperienceFilter === filterLabel;
                      return (
                        <button
                          key={filterLabel}
                          type="button"
                          onClick={() => {
                            setSelectedExperienceFilter(filterLabel);
                            requestAnimationFrame(updateFilterArrows);
                          }}
                          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                            isActive
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                          }`}
                        >
                          {filterLabel}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => scrollExperienceFilters("right")}
                    disabled={!canScrollFiltersRight}
                    className="hidden lg:grid size-9 shrink-0 place-items-center rounded-full border border-slate-300 bg-slate-50 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Scroll filters right"
                  >
                    <ChevronRight className="size-4" />
                  </button>

                </div>
              </div>
            )}

            <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
              <p className="text-sm font-medium text-slate-600">
                {filteredItems.length} {type === "destinations" ? t("common.destinations") : t("common.tours")} available
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded px-3 py-2 text-sm font-medium text-slate-900 outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pb-2 sm:pb-0 sm:gap-x-1.5 sm:gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedItems.map((item, index) =>
                type === "destinations" ? (
                  <div key={`${item.title}-${index}`} className="w-full">
                    <DestinationCard {...item} variant="allTours" />
                  </div>
                ) : (
                  <div key={`${item.title}-${index}`} className="w-full">
                    <div className="sm:hidden">
                      <MobileAllToursCard item={item} />
                    </div>
                    <div className="hidden sm:block">
                      <TourCard {...item} variant="allTours" />
                    </div>
                  </div>
                )
              )}
            </div>
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-sm font-medium text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}

            <section className="relative mt-12 px-2 sm:px-4 pb-2">
              <h2 className="mb-6 font-semibold tracking-tight text-slate-900 text-center" style={{ fontSize: 'clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)' }}>What are people saying about Ghana</h2>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory sm:grid sm:overflow-visible sm:pb-0 sm:snap-none sm:gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {paginatedReviews.map((review, idx) => (
                  <article
                    key={`${review.title}-${idx}`}
                    className="min-h-[390px] w-[86%] shrink-0 snap-start rounded-xl border border-slate-300 bg-white p-4 sm:p-5 md:p-6 sm:w-auto sm:shrink"
                  >
                    <div className="mb-4 flex items-start gap-3 sm:gap-4">
                      <img 
                        src={review.image} 
                        alt={review.title} 
                        className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-lg object-cover shrink-0" 
                      />
                      <h3 className="line-clamp-3 font-semibold leading-tight text-slate-900" style={{ fontSize: 'clamp(0.9375rem, 1.2vw + 0.5rem, 1.125rem)' }}>{review.title}</h3>
                    </div>

                    <p className="mb-2 text-xl text-emerald-500">★★★★★</p>
                    <p className="mb-4 text-xs sm:text-sm text-slate-600">{review.author}</p>
                    <p className="mb-1 font-semibold text-slate-800" style={{ fontSize: 'clamp(0.875rem, 0.8vw + 0.4rem, 0.9375rem)' }}>{review.headline}</p>
                    <p className="line-clamp-3 text-slate-700" style={{ fontSize: 'clamp(0.8125rem, 0.6vw + 0.4rem, 0.875rem)' }}>{review.body}</p>
                    <button
                      type="button"
                      onClick={() => setActiveReview(review)}
                      className="mt-2 font-semibold text-slate-900 underline" style={{ fontSize: 'clamp(0.8125rem, 0.6vw + 0.4rem, 0.875rem)' }}
                    >
                      Read more
                    </button>
                    <div className="mt-4">
                      <button
                        type="button"
                        className="rounded-xl bg-emerald-700 px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 font-semibold text-white transition hover:bg-emerald-800" style={{ fontSize: 'clamp(0.875rem, 0.8vw + 0.5rem, 1rem)' }}
                      >
                        View Experience
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {totalReviewPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentReviewPage((value) => Math.max(1, value - 1))}
                    disabled={currentReviewPage === 1}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span className="text-sm font-medium text-slate-700">
                    Page {currentReviewPage} of {totalReviewPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentReviewPage((value) => Math.min(totalReviewPages, value + 1))}
                    disabled={currentReviewPage === totalReviewPages}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>

        <Footer />
      </div>

      {showDateCalendar && (
        <div
          ref={dateCalendarRef}
          className="fixed z-[250]"
          style={{ top: `${calendarPosition.top}px`, left: `${calendarPosition.left}px` }}
        >
          <Calendar
            mode="range"
            selected={selectedDates}
            onSelect={setSelectedDates}
            onClose={() => setShowDateCalendar(false)}
          />
        </div>
      )}

      {showTimeOfDayMenu && (
        <div
          ref={timeMenuRef}
          className="fixed z-[250] w-[210px] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
          style={{ top: `${timeMenuPosition.top}px`, left: `${timeMenuPosition.left}px` }}
        >
          {["Morning", "Afternoon", "Evening"].map((option) => (
            <button
              key={option}
              onClick={() => {
                setSelectedTimeOfDay(option);
                setShowTimeOfDayMenu(false);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-100"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {showPriceMenu && (
        <div
          ref={priceMenuRef}
          className="fixed z-[250] w-[420px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
          style={{ top: `${priceMenuPosition.top}px`, left: `${priceMenuPosition.left}px` }}
        >
          <p className="text-2xl font-semibold text-slate-900">Price</p>
          <div className="mt-4 flex items-center justify-between text-3xl font-medium text-slate-900">
            <span>${priceMin}</span>
            <span>${priceMax}{priceMax === 500 ? "+" : ""}</span>
          </div>
          <div className="relative mt-4 h-10">
            <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-slate-200" />
            <div
              className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-900"
              style={{ left: `${(priceMin / 500) * 100}%`, right: `${100 - (priceMax / 500) * 100}%` }}
            />
            <input
              type="range"
              min="0"
              max="500"
              value={priceMin}
              onChange={(e) => handleMinPriceChange(Number(e.target.value))}
              className="pointer-events-none absolute h-10 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-slate-300 [&::-webkit-slider-thumb]:bg-white"
            />
            <input
              type="range"
              min="0"
              max="500"
              value={priceMax}
              onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
              className="pointer-events-none absolute h-10 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-slate-300 [&::-webkit-slider-thumb]:bg-white"
            />
          </div>
          <div className="mt-4 border-t border-slate-200" />
        </div>
      )}

      {showRatingMenu && (
        <div
          ref={ratingMenuRef}
          className="fixed z-[250] w-[360px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
          style={{ top: `${ratingMenuPosition.top}px`, left: `${ratingMenuPosition.left}px` }}
        >
          <p className="text-2xl font-semibold text-slate-900">Rating</p>
          <div className="mt-4 grid grid-cols-1 gap-2">
            {[5, 4, 3].map((rating) => (
              <button
                key={rating}
                onClick={() => {
                  setSelectedRating(rating);
                  setShowRatingMenu(false);
                }}
                className={`flex items-center gap-3 rounded-lg p-2 text-left transition hover:bg-slate-50 ${
                  selectedRating === rating ? "bg-slate-50" : ""
                }`}
              >
                <span className="text-2xl leading-none tracking-wide">{renderStars(rating)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showTravelers && (
        <div
          ref={travelersPanelRef}
          className="fixed z-[250] w-[340px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
          style={{ top: `${travelersPanelPosition.top}px`, left: `${travelersPanelPosition.left}px` }}
        >
          <p className="text-sm text-slate-700">You can select up to 15 travelers in total.</p>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-semibold text-slate-900">Adult (18+)</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setAdults((value) => Math.max(1, value - 1))}
                  className="grid size-8 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100"
                  aria-label="Decrease adults"
                >
                  <span className="text-xl leading-none">-</span>
                </button>
                <span className="w-6 text-center text-xl font-semibold text-slate-900">{adults}</span>
                <button
                  onClick={() => canAddTraveler && setAdults((value) => value + 1)}
                  className="grid size-8 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Increase adults"
                  disabled={!canAddTraveler}
                >
                  <span className="text-xl leading-none">+</span>
                </button>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-2xl font-semibold text-slate-900">Child (0-17)</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setChildrenCount(children - 1)}
                    className="grid size-8 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Decrease children"
                    disabled={children === 0}
                  >
                    <span className="text-xl leading-none">-</span>
                  </button>
                  <span className="w-6 text-center text-xl font-semibold text-slate-900">{children}</span>
                  <button
                    onClick={() => canAddTraveler && setChildrenCount(children + 1)}
                    className="grid size-8 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Increase children"
                    disabled={!canAddTraveler}
                  >
                    <span className="text-xl leading-none">+</span>
                  </button>
                </div>
              </div>
            </div>

            {children > 0 && (
              <div className="border-t border-slate-200 pt-4">
                <p className="mb-3 text-sm font-medium text-slate-700">Child age(s)</p>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: children }).map((_, index) => (
                    <label key={`child-age-${index}`} className="text-xs text-slate-600">
                      Child {index + 1}
                      <select
                        value={childAges[index] ?? 7}
                        onChange={(e) => {
                          const age = Number(e.target.value);
                          setChildAges((prev) => {
                            const next = [...prev];
                            next[index] = age;
                            return next;
                          });
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
                      >
                        {Array.from({ length: 18 }).map((__, age) => (
                          <option key={`age-${age}`} value={age}>
                            {age} years
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                setAdults(1);
                setChildren(0);
                setChildAges([]);
              }}
              className="flex-1 rounded-xl border border-slate-900 px-4 py-2.5 text-lg font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Reset
            </button>
            <button
              onClick={() => {
                setAppliedAdults(adults);
                setAppliedChildren(children);
                setAppliedChildAges(childAges.slice(0, children));
                setShowTravelers(false);
              }}
              className="flex-1 rounded-xl border border-slate-900 px-4 py-2.5 text-lg font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />

      {activeReview && (
        <div className="fixed inset-0 z-[300] grid place-items-center p-4">
          <button
            type="button"
            aria-label="Close review details"
            className="absolute inset-0 bg-black/40"
            onClick={() => setActiveReview(null)}
          />
          <div className="relative z-[301] w-full max-w-[700px] rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h3 className="text-2xl font-semibold text-slate-900">{activeReview.title}</h3>
              <button
                type="button"
                onClick={() => setActiveReview(null)}
                className="rounded-md px-2 py-1 text-slate-600 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>
            <p className="mb-2 text-emerald-500">★★★★★</p>
            <p className="mb-4 text-sm text-slate-600">{activeReview.author}</p>
            <p className="mb-3 text-lg font-semibold text-slate-800">{activeReview.headline}</p>
            <p className="text-base leading-7 text-slate-700">{activeReview.fullText}</p>
          </div>
        </div>
      )}

      {showBackToTop && (
        <button
          type="button"
          onClick={handleBackToTop}
          className="fixed bottom-6 right-6 z-[260] grid size-11 place-items-center rounded-full bg-slate-900 text-white shadow-lg transition hover:bg-slate-800"
          aria-label="Back to top"
        >
          <ChevronUp className="size-5" />
        </button>
      )}
    </>
  );
}

function AllToursPage() {
  return (
    <AuthModalProvider>
      <AllToursPageContent />
    </AuthModalProvider>
  );
}

export default AllToursPage;
