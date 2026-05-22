export const SPECIALS_FILTERS = [
  {
    id: "deals-discounts",
    label: "Deals & Discounts",
    match: (item) => Boolean(item.discount),
  },
  {
    id: "likely-sell-out",
    label: "Likely to Sell Out",
    match: (item) =>
      String(item.discount || "").toLowerCase().includes("sell out") ||
      String(item.title || "").toLowerCase().includes("sell out"),
  },
  {
    id: "free-cancellation",
    label: "Free Cancellation",
    match: () => true,
  },
  {
    id: "skip-the-line",
    label: "Skip-The-Line",
    match: (item) => {
      const haystack = Object.values(item)
        .filter((value) => typeof value === "string")
        .join(" ")
        .toLowerCase();
      return haystack.includes("skip") || haystack.includes("fast track");
    },
  },
];

export const SPECIALS_MORE_FILTERS = [
  {
    id: "small-group",
    label: "Small Group Tours",
    match: (item) => String(item.title || "").toLowerCase().includes("group"),
  },
  {
    id: "private-tours",
    label: "Private Tours",
    match: (item) => String(item.title || "").toLowerCase().includes("private"),
  },
];

export const GHANA_TOUR_CATEGORIES = [
  {
    id: "art-culture",
    label: "Art & Culture",
    subcategories: [
      { id: "museums", label: "Museums", keywords: ["museum", "castle", "heritage", "culture"] },
      { id: "galleries", label: "Galleries & Studios", keywords: ["art", "gallery", "culture"] },
    ],
  },
  {
    id: "classes-workshops",
    label: "Classes & Workshops",
    subcategories: [
      { id: "cooking", label: "Cooking Classes", keywords: ["cooking", "food", "culinary"] },
      { id: "crafts", label: "Craft Workshops", keywords: ["workshop", "craft", "class"] },
    ],
  },
  {
    id: "food-drink",
    label: "Food & Drink",
    subcategories: [
      { id: "tastings", label: "Tastings", keywords: ["food", "drink", "tasting", "culinary"] },
      { id: "markets", label: "Markets & Street Food", keywords: ["market", "street", "food"] },
    ],
  },
  {
    id: "outdoor-activities",
    label: "Outdoor Activities",
    subcategories: [
      { id: "hiking", label: "Hiking & Nature", keywords: ["park", "forest", "waterfall", "nature", "hike"] },
      { id: "wildlife", label: "Wildlife", keywords: ["safari", "wildlife", "monkey", "animal"] },
    ],
  },
  {
    id: "seasonal-occasions",
    label: "Seasonal & Special Occasions",
    subcategories: [
      { id: "festivals", label: "Festivals", keywords: ["festival", "seasonal", "celebration"] },
      { id: "events", label: "Special Events", keywords: ["event", "occasion", "holiday"] },
    ],
  },
  {
    id: "tickets-passes",
    label: "Tickets & Passes",
    subcategories: [
      { id: "attraction-tickets", label: "Attraction Tickets", keywords: ["ticket", "pass", "entry"] },
      { id: "city-passes", label: "City Passes", keywords: ["pass", "city", "admission"] },
    ],
  },
  {
    id: "tours-sightseeing",
    label: "Tours, Sightseeing & Cruises",
    subcategories: [
      { id: "city-tours", label: "City Tours", keywords: ["city", "tour", "sightseeing"] },
      { id: "cruises", label: "Boat Cruises", keywords: ["boat", "cruise", "coast", "ada"] },
    ],
  },
  {
    id: "travel-transport",
    label: "Travel & Transportation Services",
    subcategories: [
      { id: "transfers", label: "Transfers", keywords: ["transfer", "transport", "pickup"] },
      { id: "bus-tours", label: "Bus Tours", keywords: ["bus", "transportation"] },
    ],
  },
];

export function matchesTourFilters(item, selectedSpecials, selectedSubcategories) {
  const allSpecials = [...SPECIALS_FILTERS, ...SPECIALS_MORE_FILTERS];
  const activeSpecials = allSpecials.filter((option) => selectedSpecials.includes(option.id));

  if (activeSpecials.length > 0 && !activeSpecials.some((option) => option.match(item))) {
    return false;
  }

  if (selectedSubcategories.length === 0) {
    return true;
  }

  const haystack = Object.values(item)
    .filter((value) => typeof value === "string")
    .join(" ")
    .toLowerCase();

  const activeKeywords = GHANA_TOUR_CATEGORIES.flatMap((category) =>
    category.subcategories
      .filter((sub) => selectedSubcategories.includes(`${category.id}:${sub.id}`))
      .flatMap((sub) => sub.keywords)
  );

  if (!activeKeywords.length) {
    return true;
  }

  return activeKeywords.some((keyword) => haystack.includes(keyword));
}
