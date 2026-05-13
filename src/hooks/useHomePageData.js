import { useQuery } from "@tanstack/react-query";

/**
 * HomePage loading orchestration.
 * - First paint in a session: brief skeleton (~250ms) unless skipInitialDelay (e.g. returning from sign-in)
 * - Subsequent mounts: instant (query cache)
 */
export function useHomePageData({ skipInitialDelay = false } = {}) {
  return useQuery({
    queryKey: ["homePage", "initialLoad", skipInitialDelay ? "skipDelay" : "withDelay"],
    queryFn: async () => {
      if (!skipInitialDelay) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      return {
        loaded: true,
        timestamp: Date.now(),
      };
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
