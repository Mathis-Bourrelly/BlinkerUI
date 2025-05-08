import { useFetchQuery } from "@/hooks/repository/useFetchQuery";
import { usePostMutation } from "@/hooks/repository/usePostMutation";
import { usePutMutation } from "@/hooks/repository/usePutMutation";
import { useDeleteMutation } from "@/hooks/repository/useDeleteMutation";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { BlinkType } from "@/types/BlinksType";
import { useQuery } from "@tanstack/react-query";
import { getToken } from "@/hooks/useSetToken";

export function useBlinkInterface(blinkID: string, queryKeys: string[] = []) {
    return useFetchQuery<{ data: BlinkType }>(`/blinks/${blinkID}`, ["blink", blinkID, ...queryKeys]);
}

export function useCreateBlinkMutation() {
    return usePostMutation(`/blinks`);
}

export function useUpdateBlinkMutation(blinkID: string) {
    return usePutMutation<Partial<BlinkType>>(`/blinks/${blinkID}`);
}

export function useDeleteBlinkMutation(blinkID: string) {
    return useDeleteMutation(`/blinks/${blinkID}`);
}

export function useBlinksQuery(params?: { userId?: string }) {
    // Utiliser une clé de cache spécifique si userId est fourni
    const queryKey = params?.userId ? `blinks-user-${params.userId}` : "blinks";
    console.log(`Using query key: ${queryKey} with params:`, params);
    return usePaginatedQuery<BlinkType>(queryKey, "/blinks", params);
}

export function useSearchBlinksQuery(query: string) {
    return usePaginatedQuery<BlinkType>("searchBlinks", `/blinks/search`, { query });
}

export function useLikedBlinksQuery() {
    return usePaginatedQuery<BlinkType>("likedBlinks", `/blinks/liked`);
}

// Hook pour calculer le temps restant d'un Blink
export function useRemainingTimeQuery(blinkID: string) {
    return useQuery({
        queryKey: ['blinkRemainingTime', blinkID],
        queryFn: async () => {
            const token = await getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            try {
                const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/blinks/remaining-time/${blinkID}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    console.warn(`Failed to get remaining time for blink ${blinkID}: ${data.message}`);
                    return { remainingTime: null };
                }

                // Retourner les données au format standard
                return { remainingTime: data.data?.remainingTime || null };
            } catch (error) {
                console.warn(`Error fetching remaining time for blink ${blinkID}:`, error);
                return { remainingTime: null };
            }
        },
        // Refetch toutes les minutes pour mettre à jour le temps restant
        refetchInterval: 60 * 1000,
        // Ne pas échouer complètement en cas d'erreur
        retry: false,
        useErrorBoundary: false,
        // Garder les données en cache pendant un temps raisonnable
        staleTime: 30 * 1000 // 30 secondes
    });
}
