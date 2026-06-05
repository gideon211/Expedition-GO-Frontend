import { extractStopCoordinates } from "@/lib/itineraryMap";

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

const ITINERARY_TIME_PATTERN =
  /(\d{1,2}:\d{2}\s*(?:AM|PM)?)(?:\s*[–-]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?))?\s*[|]\s*/i;

function parseItineraryLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const timeMatch = trimmed.match(ITINERARY_TIME_PATTERN);
  if (timeMatch) {
    const time = timeMatch[1].trim();
    const rest = trimmed.slice(timeMatch[0].length).trim();
    const colonIdx = rest.indexOf(": ");
    if (colonIdx > 0) {
      return {
        time,
        title: rest.slice(0, colonIdx).trim(),
        description: rest.slice(colonIdx + 2).trim(),
      };
    }
    return { time, title: rest, description: "" };
  }

  const colonIdx = trimmed.indexOf(": ");
  if (colonIdx > 0 && colonIdx < 60) {
    return {
      title: trimmed.slice(0, colonIdx).trim(),
      description: trimmed.slice(colonIdx + 2).trim(),
    };
  }

  return { description: trimmed };
}

/**
 * Normalizes supplier-dashboard itinerary payloads for consumer display.
 * Supports structured stop objects, line-based strings, and legacy string arrays.
 */
export function normalizeItinerary(itinerary) {
  if (!itinerary) return [];

  if (Array.isArray(itinerary)) {
    if (itinerary.length === 0) return [];
    if (typeof itinerary[0] === "object" && itinerary[0] !== null) {
      return itinerary.map((item) => {
        const coords = extractStopCoordinates(item);
        return {
          day: item.day != null ? String(item.day) : "",
          time: item.time || "",
          title: item.title || "",
          description: item.description || "",
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
          coordinates: item.coordinates,
          location: item.location,
        };
      });
    }
    return itinerary
      .filter((item) => item && String(item).trim())
      .map((item) => ({ description: String(item).trim() }));
  }

  if (typeof itinerary === "string" && itinerary.trim()) {
    return itinerary
      .split("\n")
      .map(parseItineraryLine)
      .filter(Boolean);
  }

  return [];
}

export function formatItineraryMeta(item) {
  const parts = [];
  if (item?.day != null && String(item.day).trim()) {
    const day = String(item.day).trim();
    parts.push(/^day\s/i.test(day) ? day : `Day ${day}`);
  }
  if (item?.time?.trim()) parts.push(item.time.trim());
  return parts.join(" — ");
}

export function parseItineraryStops(rawTour) {
  return normalizeItinerary(rawTour?.productContent?.itinerary);
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
