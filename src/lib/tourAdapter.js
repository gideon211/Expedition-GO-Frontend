export function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return "";
  if (minutes < 60) return `${minutes}m`;
  const hours = minutes / 60;
  if (hours % 1 === 0) return `${hours}h`;
  if (hours < 24) {
    const whole = Math.floor(hours);
    const rem = Math.round((hours - whole) * 60);
    return rem > 0 ? `${whole}h ${rem}m` : `${whole}h`;
  }
  const days = hours / 24;
  return days % 1 === 0 ? `${days}d` : `${days.toFixed(1)}d`;
}

export function extractPrice(schedulesAndPricing) {
  if (!schedulesAndPricing) return null;
  try {
    const sp =
      typeof schedulesAndPricing === "string"
        ? JSON.parse(schedulesAndPricing)
        : schedulesAndPricing;
    const schedule = sp?.pricingSchedules?.schedules?.[0];
    if (!schedule) return null;
    const adultPrice = schedule.prices?.find(
      (p) => p.ageGroup === "Adult" || p.ageGroup?.toLowerCase() === "adult"
    );
    return adultPrice?.retailPrice ?? schedule.prices?.[0]?.retailPrice ?? null;
  } catch {
    return null;
  }
}

export function adaptTourCard(tour) {
  const price = extractPrice(tour.schedulesAndPricing);
  const image = tour.coverPhoto || tour.photos?.[0] || "";
  const duration = formatDuration(tour.durationMinutes);
  return {
    title: tour.title || "",
    slug: tour.slug || "",
    duration,
    price: price != null ? price : null,
    rating: tour.averageRating != null ? String(Number(tour.averageRating).toFixed(1)) : "0",
    reviews: tour.reviewCount ?? tour._count?.reviews ?? 0,
    image,
    discount: null,
    category: tour.category || "",
    city: tour.city || "",
    country: tour.country || "",
  };
}

export function adaptCompactCard(tour) {
  return adaptTourCard(tour);
}

export function adaptSidebarDeal(tour) {
  const card = adaptTourCard(tour);
  return {
    ...card,
    oldPrice: null,
    discount: null,
    countdown: null,
  };
}

export function extractDestinations(tours) {
  const map = {};
  for (const t of tours) {
    const city = t.city || t.productContent?.location?.city;
    const country = t.country || t.productContent?.location?.country;
    if (!city && !country) continue;
    const key = `${city || "Unknown"}, ${country || "Unknown"}`;
    if (!map[key]) {
      map[key] = { title: city || country, region: country || "", tours: 0, image: t.coverPhoto || t.photos?.[0] || "" };
    }
    map[key].tours += 1;
  }
  return Object.values(map);
}
