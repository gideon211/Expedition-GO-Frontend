import { useQuery } from "@tanstack/react-query";
import { fetchPopularByCategory, fetchFilterOptions } from "@/api/tours";
import { adaptTourCard, extractDestinations } from "@/lib/tourAdapter";

const DEFAULT_INITIAL_DELAY_MS = 250;
const POST_AUTH_INITIAL_DELAY_MS = 150;

export function useHomePageData({
  skipInitialDelay = false,
  enabled = true,
  handoffNonce = null,
  postAuthHandoff = false,
} = {}) {
  const delayMs = postAuthHandoff
    ? POST_AUTH_INITIAL_DELAY_MS
    : skipInitialDelay
      ? 0
      : DEFAULT_INITIAL_DELAY_MS;

  const nonceKey =
    typeof handoffNonce === "number" && Number.isFinite(handoffNonce) ? String(handoffNonce) : "stable";

  const delayModeKey = delayMs === 0 ? "skipDelay" : delayMs === POST_AUTH_INITIAL_DELAY_MS ? "postAuthDelay" : "defaultDelay";

  return useQuery({
    queryKey: [
      "homePage",
      "initialLoad",
      delayModeKey,
      postAuthHandoff ? "postAuth" : "default",
      nonceKey,
    ],
    queryFn: async () => {
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      const [popularData, filterData] = await Promise.allSettled([
        fetchPopularByCategory({ perCategory: 8 }),
        fetchFilterOptions(),
      ]);

      const categories = {};
      if (popularData.status === "fulfilled" && popularData.value?.categories) {
        for (const [cat, tours] of Object.entries(popularData.value.categories)) {
          categories[cat] = (tours || []).map(adaptTourCard);
        }
      }

      let destinations = [];
      if (filterData.status === "fulfilled" && filterData.value?.filterOptions?.locations) {
        const locs = filterData.value.filterOptions.locations;
        const cities = locs.cities || [];
        const countries = locs.countries || [];
        destinations = cities.map((city, i) => ({
          title: city,
          region: countries[i % countries.length] || "",
          tours: "",
          image: "",
        }));
      }

      const allTours = Object.values(categories).flat();
      if (allTours.length > 0 && destinations.length === 0) {
        destinations = extractDestinations(allTours);
      }

      return {
        loaded: true,
        timestamp: Date.now(),
        categories,
        destinations,
        filterOptions: filterData.status === "fulfilled" ? filterData.value?.filterOptions : null,
      };
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled,
  });
}
