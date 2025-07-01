import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getToken } from "@/hooks/useSetToken";

// Types for tag-related API responses
export interface TagType {
  tagID: string;
  name: string;
  usageCount?: number;
}

export interface TagSearchResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    tags: TagType[];
    total: number;
  };
}

export interface TagValidationResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    valid: boolean;
    error?: string;
    invalidTags?: string[];
  };
}

export interface PopularTagsResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    tags: TagType[];
  };
}

export interface TagStats {
  tagID: string;
  name: string;
  usageCount: number;
  recentUsage: number;
}

export interface TrendingTagsResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    trending: {
      last24h: TagStats[];
      last7days: TagStats[];
      last30days: TagStats[];
      allTime: TagStats[];
    };
  };
}

export interface PopularTagsResponseUpdated {
  success: boolean;
  status: number;
  message: string;
  data: {
    tags: TagStats[];
    timeFilter: string;
    message: string;
  };
}

export interface TagStatsResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    tagID: string;
    name: string;
    usageCount: number;
    recentUsage: number;
  };
}

// Hook for searching tags
export function useTagSearchQuery(query: string, limit: number = 10) {
  return useQuery({
    queryKey: ["tagSearch", query, limit],
    queryFn: async (): Promise<TagSearchResponse> => {
      if (!query.trim()) {
        return {
          success: true,
          status: 200,
          message: "Empty query",
          data: { tags: [], total: 0 }
        };
      }

      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/tags/search?q=${encodeURIComponent(query)}&limit=${limit}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to search tags: ${response.status}`);
      }

      return response.json();
    },
    enabled: query.trim().length > 0,
    staleTime: 30000, // 30 seconds
  });
}

// Hook for validating tags
export function useValidateTagsMutation() {
  return useMutation({
    mutationFn: async ({ body }: { body: { tags: string[] } }): Promise<TagValidationResponse> => {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/tags/validate`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to validate tags: ${response.status}`);
      }

      return response.json();
    },
  });
}

// Hook for getting popular tags with time filter
export function usePopularTagsQuery(timeFilter: string = 'all', limit: number = 20) {
  return useQuery({
    queryKey: ["popularTags", timeFilter, limit],
    queryFn: async (): Promise<PopularTagsResponseUpdated> => {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/tags/popular?timeFilter=${timeFilter}&limit=${limit}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch popular tags: ${response.status}`);
      }

      return response.json();
    },
    staleTime: 300000, // 5 minutes
  });
}

// Hook for getting trending tags
export function useTrendingTagsQuery() {
  return useQuery({
    queryKey: ["trendingTags"],
    queryFn: async (): Promise<TrendingTagsResponse> => {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/tags/trending`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch trending tags: ${response.status}`);
      }

      return response.json();
    },
    staleTime: 300000, // 5 minutes
  });
}

// Hook for getting tag statistics
export function useTagStatsQuery(tagName: string) {
  return useQuery({
    queryKey: ["tagStats", tagName],
    queryFn: async (): Promise<TagStatsResponse> => {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/tags/stats/${encodeURIComponent(tagName)}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch tag stats: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!tagName,
    staleTime: 300000, // 5 minutes
  });
}

// Hook for getting blinks by tag
export function useBlinksByTagQuery(tagName: string, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ["blinksByTag", tagName, page, limit],
    queryFn: async () => {
      const token = await getToken();

      // Première requête pour obtenir les IDs des blinks
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/tags/${encodeURIComponent(tagName)}/blinks?page=${page}&limit=${limit}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch blinks by tag: ${response.status}`);
      }

      const tagData = await response.json();

      // Si pas de blinks, retourner la structure attendue
      if (!tagData.data?.blinkIDs || tagData.data.blinkIDs.length === 0) {
        return {
          ...tagData,
          data: {
            ...tagData.data,
            data: []
          }
        };
      }

      // Récupérer les détails de chaque blink
      const blinkPromises = tagData.data.blinkIDs.map(async (blinkID: string) => {
        try {
          const blinkResponse = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/blinks/${blinkID}`,
            {
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (blinkResponse.ok) {
            const blinkData = await blinkResponse.json();
            return blinkData.data;
          }
          return null;
        } catch (error) {
          console.warn(`Failed to fetch blink ${blinkID}:`, error);
          return null;
        }
      });

      const blinks = await Promise.all(blinkPromises);
      const validBlinks = blinks.filter(blink => blink !== null);

      // Retourner la structure avec les blinks complets
      return {
        ...tagData,
        data: {
          ...tagData.data,
          data: validBlinks
        }
      };
    },
    enabled: !!tagName,
    staleTime: 60000, // 1 minute
    retry: 1, // Limiter les tentatives de retry
  });
}
