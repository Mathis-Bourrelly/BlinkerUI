import { useInfiniteQuery } from "@tanstack/react-query";
import { getToken } from "@/hooks/useSetToken";
import { router } from "expo-router";
import { ProfileType } from "@/types/usersType";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";

// Type for user search results based on API documentation
export interface UserSearchResult {
  userID: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  score: number;
}

// Type for the API response structure based on the Swagger documentation
interface UserSearchResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    data: UserSearchResult[];
  };
}

/**
 * Hook for searching users by display name or username
 * @param query Search query string
 */
export function useUserSearchQuery(query: string) {
  // Utiliser le hook usePaginatedQuery qui est déjà utilisé pour d'autres recherches dans l'application
  return usePaginatedQuery<UserSearchResult>(
    "userSearch", // Clé pour React Query
    "/users/search", // URL relative de l'API
    { query }, // Paramètres de recherche
    { enabled: !!query.trim() } // N'activer la requête que si la chaîne de recherche n'est pas vide
  );
}
