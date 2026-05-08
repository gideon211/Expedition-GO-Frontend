import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "./client";

/**
 * Production-ready QueryClient configuration.
 * - Stops retrying on auth/forbidden/not-found errors.
 * - Uses gentle backoff and reasonable cache windows.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 30,
        gcTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError) {
            if ([400, 401, 403, 404, 422].includes(error.status)) return false;
          }
          return failureCount < 2;
        },
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8_000),
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
