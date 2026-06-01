import { useQuery } from "@tanstack/react-query";
import { fetchTours } from "@/api/tours";
import { adaptTourCard } from "@/lib/tourAdapter";

export function useAllTours(params = {}) {
  const {
    page = 1,
    limit = 8,
    category,
    subcategory,
    minRating,
    minPrice,
    maxPrice,
    search,
    sortBy,
    sortOrder = "desc",
    freeCancellation,
    enabled = true,
  } = params;

  const queryParams = { page, limit };

  if (category && category !== "all") queryParams.category = category;
  if (subcategory) queryParams.subcategory = subcategory;
  if (minRating) queryParams.minRating = minRating;
  if (minPrice != null) queryParams.minPrice = minPrice;
  if (maxPrice != null) queryParams.maxPrice = maxPrice;
  if (search) queryParams.search = search;
  if (sortBy) queryParams.sortBy = sortBy;
  if (sortOrder) queryParams.sortOrder = sortOrder;
  if (freeCancellation) queryParams.freeCancellation = true;

  return useQuery({
    queryKey: ["tours", "all", queryParams],
    queryFn: async () => {
      const response = await fetchTours(queryParams);
      const tours = (response?.tours || []).map(adaptTourCard);
      return {
        tours,
        pagination: response?.pagination || {
          currentPage: page,
          totalPages: 1,
          totalCount: tours.length,
          hasNextPage: false,
          hasPrevPage: false,
          limit,
        },
      };
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    enabled,
  });
}
