import { useQuery } from "@tanstack/react-query";
import { fetchTourById } from "@/api/tours";

export function useTourById(id) {
  return useQuery({
    queryKey: ["tour", "detail", id],
    queryFn: async () => {
      const data = await fetchTourById(id);
      return data?.tour || data || null;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}
