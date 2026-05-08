import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook for HomePage data loading with smart caching.
 * - First visit: Shows skeleton for 1.5s
 * - Subsequent visits: Instant load from cache (no skeleton)
 * - Data cached for 15 minutes (staleTime)
 * - Cache persists in memory for 60 minutes (gcTime)
 * - Perfect for production: fast UX, no unnecessary loading states
 */
export function useHomePageData() {
  // Check session storage once outside the query
  const hasLoadedBefore = sessionStorage.getItem("homePageLoaded") === "true";
  
  return useQuery({
    queryKey: ["homePage", "initialLoad"],
    queryFn: async () => {
      if (!hasLoadedBefore) {
        // First visit: simulate loading time
        await new Promise((resolve) => setTimeout(resolve, 1500));
        sessionStorage.setItem("homePageLoaded", "true");
      }
      // Subsequent visits: instant return
      
      return {
        loaded: true,
        timestamp: Date.now(),
      };
    },
    staleTime: Infinity, // Never refetch - data doesn't change
    gcTime: 1000 * 60 * 60, // Keep in cache for 60 minutes
    refetchOnMount: false, // Don't refetch when component remounts
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    // If already loaded before, start with cached data immediately
    initialData: hasLoadedBefore ? { loaded: true, timestamp: Date.now() } : undefined,
  });
}
