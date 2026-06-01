function extractPrice(tour) {
  try {
    const schedules = tour?.schedulesAndPricing?.pricingSchedules?.schedules;
    if (schedules?.length) {
      const adultPrice = schedules[0].prices?.find((p) => p.ageGroup === "Adult");
      if (adultPrice?.retailPrice != null) return Number(adultPrice.retailPrice);
      if (schedules[0].prices?.length) return Number(schedules[0].prices[0].retailPrice);
    }
  } catch {}
  return 0;
}

function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return "Flexible";
  const mins = Number(minutes);
  if (!Number.isFinite(mins) || mins <= 0) return "Flexible";
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  if (days >= 1) return `${days} day${days > 1 ? "s" : ""} / ${days - 1} night${days - 1 !== 1 ? "s" : ""}`;
  if (hours >= 1) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return `${mins} minute${mins !== 1 ? "s" : ""}`;
}

function extractStartDates(tour) {
  try {
    const schedules = tour?.schedulesAndPricing?.pricingSchedules?.schedules;
    if (schedules?.length) {
      return schedules.map((s) => s.startDate).filter(Boolean);
    }
  } catch {}
  return [];
}

function formatItems(items) {
  if (!items?.length) return [];
  return items.map((item) => {
    if (typeof item === "string") return { title: item, description: "" };
    return { title: item.title || item, description: item.description || "" };
  });
}

function buildIncludesByTraveler(tour) {
  const included = tour?.productContent?.included || [];
  const excluded = tour?.productContent?.excluded || [];
  const formattedIncluded = formatItems(included);
  const formattedExcluded = formatItems(excluded);
  return {
    adults: {
      notice: "The following instructions apply to adults (12 years or over).",
      included: formattedIncluded,
      excluded: formattedExcluded,
    },
    children: {
      notice: "Child pricing and inclusions apply to travelers aged 2-11 years.",
      included: formattedIncluded,
      excluded: formattedExcluded,
    },
  };
}

export function adaptTourDetail(tour) {
  if (!tour) return null;
  return {
    name: tour.title || tour.name || "",
    price: extractPrice(tour),
    duration: formatDuration(tour.durationMinutes),
    groupType: tour.groupType || tour.categorization?.activityType || "Private tour",
    location: tour.city || tour.productContent?.location?.city || tour.location || "Accra",
    language: tour.language || "English",
    transferInfo: tour.transferInfo || "Airport/station pick-up and drop-off included",
    summaryTags: tour.tags || ["Departure guaranteed"],
    imageCover: tour.coverPhoto || tour.photos?.[0] || "",
    images: tour.photos || [],
    ratingsAverage: tour.averageRating ?? 4.8,
    ratingsQuantity: tour.reviewCount ?? 0,
    highlight: tour.productContent?.highlights?.[0] || tour.description || tour.summary || "",
    itinerary: tour.productContent?.highlights || tour.itinerary || [],
    includesByTraveler: buildIncludesByTraveler(tour),
    startDates: extractStartDates(tour),
  };
}

export function buildOverviewHighlights(tour) {
  if (!tour) return [];
  if (tour.productContent?.highlights?.length > 0) return tour.productContent.highlights;
  if (tour.itinerary?.length > 0) return tour.itinerary;
  if (tour.summary) return [tour.summary];
  return [];
}

export function buildDescriptionSteps(tour) {
  if (!tour) return [];
  if (tour.description) {
    const paragraphs = tour.description.split("\n").filter(Boolean);
    if (paragraphs.length > 1) {
      return paragraphs.map((p, i) => ({
        title: i === 0 ? "About this tour" : "Details",
        body: p,
      }));
    }
    return [{ title: "About this tour", body: tour.description }];
  }
  if (tour.productContent?.highlights?.length > 0) {
    return tour.productContent.highlights.map((item, i) => ({
      title: i === 0 ? "About this tour" : `Highlight ${i + 1}`,
      body: item,
    }));
  }
  if (tour.summary) return [{ title: "Overview", body: tour.summary }];
  return [];
}

export function parseItineraryStops(rawTour) {
  const itineraryText = rawTour?.productContent?.itinerary || "";
  const location = rawTour?.city || rawTour?.productContent?.location?.city || "Accra";
  const stops = [
    { label: "Start", title: `You'll start at ${location}`, meta: "Or, you can also get picked up" },
  ];

  if (itineraryText) {
    const sections = itineraryText.split("\n\n").filter(Boolean);
    let stopNumber = 1;
    for (const section of sections) {
      const lines = section.trim().split("\n").filter(Boolean);
      if (!lines.length) continue;
      const title = lines[0].replace(/^[:\s]+|[:\s]+$/g, "").trim();
      const body = lines.slice(1).join(" ").trim();
      if (title.toLowerCase().includes("inclusion") || title.toLowerCase().includes("note")) continue;
      stops.push({
        label: String(stopNumber),
        title: title || `Stop ${stopNumber}`,
        meta: body || undefined,
      });
      stopNumber += 1;
    }
  }

  stops.push({ label: "End", title: "Tour concludes", meta: "" });
  return stops;
}

export function extractAgePrices(rawTour) {
  const map = {};
  try {
    const schedules = rawTour?.schedulesAndPricing?.pricingSchedules?.schedules;
    if (schedules?.length) {
      for (const price of schedules[0].prices || []) {
        map[price.ageGroup.toLowerCase()] = Number(price.retailPrice) || 0;
      }
    }
  } catch {}
  return map;
}
