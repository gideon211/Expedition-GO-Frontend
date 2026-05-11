import { useQuery } from "@tanstack/react-query";

/**
 * HomePage loading orchestration.
 * - After splash: show skeleton for 1 second before rendering content
 * - Subsequent mounts in the same app session: instant (served from query cache)
 */
export function useHomePageData({ skipInitialDelay = false } = {}) {
  return useQuery({
    queryKey: ["homePage", "initialLoad", skipInitialDelay ? "skipDelay" : "withDelay"],
    queryFn: async () => {
      if (!skipInitialDelay) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
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
