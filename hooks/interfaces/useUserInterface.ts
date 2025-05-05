import { useInfiniteQuery } from "@tanstack/react-query";
import { getToken } from "@/hooks/useSetToken";
import { router } from "expo-router";
import { ProfileType } from "@/types/usersType";

// Type for user search results based on API documentation
export interface UserSearchResult {
  userID: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  score: number;
}

// Type for the API response structure
interface UserSearchResponse {
  total: number;
  users: UserSearchResult[];
}

/**
 * Hook for searching users by display name or username
 * @param query Search query string
 * @param page Page number (optional, default: 1)
 * @param limit Number of results per page (optional, default: 10)
 */
export function useUserSearchQuery(query: string) {
  return useInfiniteQuery<UserSearchResponse>({
    queryKey: ["userSearch", { query }],
    enabled: !!query.trim(),
    queryFn: async ({ pageParam = 1 }) => {
      const token = await getToken();
      const url = new URL(`${process.env.EXPO_PUBLIC_API_URL}/users/search`);

      url.searchParams.append("page", pageParam.toString());
      url.searchParams.append("limit", "10");
      if (query) {
        url.searchParams.append("query", query);
      }

      console.log('Fetching search results from:', url.toString());

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });

      if (res.status === 401) {
        router.push("/login");
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch search results: ${res.status}`);
      }

      const data = await res.json();
      console.log('Search API response:', data);
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // Calculate if there are more pages based on total and current results
      const currentResultsCount = lastPage.users.length;
      const hasMorePages = currentResultsCount > 0 && currentResultsCount * 10 < lastPage.total;
      return hasMorePages ? (typeof lastPage.page === 'number' ? lastPage.page + 1 : 2) : undefined;
    },
  });
}
