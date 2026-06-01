import { useQuery } from "@tanstack/react-query";
import { fetchFilterOptions } from "@/api/tours";

export function useFilterOptions() {
  return useQuery({
    queryKey: ["tours", "filterOptions"],
    queryFn: async () => {
      const data = await fetchFilterOptions();
      return data?.filterOptions || null;
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}
