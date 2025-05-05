import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
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

/**
 * Hook for searching users by display name or username
 * @param query Search query string
 * @param page Page number (optional, default: 1)
 * @param limit Number of results per page (optional, default: 10)
 */
export function useUserSearchQuery(query: string) {
  return usePaginatedQuery<UserSearchResult>(
    "userSearch", 
    "/users/search", 
    { query }
  );
}
