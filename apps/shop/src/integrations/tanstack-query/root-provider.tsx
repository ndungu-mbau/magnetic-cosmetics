import { QueryClient } from "@tanstack/react-query";
import { CMSError } from "@/server/client";

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Show stale data while revalidating in the background
        staleTime: 1000 * 60 * 2, // 2 minutes default; overridden per-hook
        gcTime: 1000 * 60 * 10, // keep unused cache for 10 minutes
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,

        // Don't retry on auth errors — they won't self-resolve
        retry: (failureCount, error) => {
          if (error instanceof CMSError) {
            if (error.status === 401 || error.status === 403 || error.status === 404) {
              return false
            }
          }
          return failureCount < 2
        },
      },

      mutations: {
        // Surface errors consistently to your toast / error boundary system
        onError: (error) => {
          const message =
            error instanceof CMSError ? error.message : "Something went wrong.";
          console.error("[CMS Mutation]", message);
        },
      },
    },
  });

  return {
    queryClient,
  }
}
export default function TanstackQueryProvider() {}
