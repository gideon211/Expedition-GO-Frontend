import { useQuery } from "@tanstack/react-query";
import { fetchTours } from "@/api/tours";
import { adaptTourCard } from "@/lib/tourAdapter";

export function useTourSearch(params = {}) {
  const { category, search, sortBy = "popularity", limit = 8 } = params;

  const queryParams = { limit, sortBy, sortOrder: "desc" };
  if (category && category !== "all") queryParams.category = category;
  if (search) queryParams.search = search;

  return useQuery({
    queryKey: ["tours", "search", queryParams],
    queryFn: async () => {
      const response = await fetchTours(queryParams);
      return (response?.tours || []).map(adaptTourCard);
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    enabled: true,
  });
}
