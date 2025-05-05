import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getToken } from "@/hooks/useSetToken";

type StandardResponse<T> = {
    success: boolean;
    status: number;
    message: string;
    data?: T;
};

type InteractionData = {
    created?: boolean;
    removed?: boolean;
    updated?: boolean;
};

type InteractionResponse = StandardResponse<InteractionData>;

export function useLikeMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (blinkID: string) => {
            const token = await getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/interactions/like/${blinkID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Failed to like blink. Status: ${response.status}`);
            }

            return data as InteractionResponse;
        },
        onSuccess: () => {
            // Invalidate and refetch blinks query to update the UI
            queryClient.invalidateQueries({ queryKey: ['blinks'] });
        }
    });
}

export function useDislikeMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (blinkID: string) => {
            const token = await getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/interactions/dislike/${blinkID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Failed to dislike blink. Status: ${response.status}`);
            }

            return data as InteractionResponse;
        },
        onSuccess: () => {
            // Invalidate and refetch blinks query to update the UI
            queryClient.invalidateQueries({ queryKey: ['blinks'] });
        }
    });
}

// Cette fonction n'est plus nécessaire car nous utilisons directement la propriété isLiked du blink
// qui est fournie par l'API. Elle est conservée pour référence mais n'est plus utilisée.
/*
export function useCheckInteractionStatus(blinkID: string) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: ['interaction', blinkID],
        queryFn: async () => {
            const token = await getToken();
            if (!token) {
                return { hasLiked: false, hasDisliked: false };
            }

            // Essayer de récupérer le blink depuis le cache
            const cachedBlinks = queryClient.getQueriesData<{ data: any }>({ queryKey: ['blinks'] });

            // Parcourir tous les résultats mis en cache
            for (const [, blinksData] of cachedBlinks) {
                if (blinksData?.data?.data) {
                    // Chercher le blink dans les données en cache
                    const blink = blinksData.data.data.find(b => b.blinkID === blinkID);
                    if (blink) {
                        return {
                            hasLiked: blink.isLiked || false,
                            // Nous n'avons pas d'information sur les dislikes dans la nouvelle API
                            hasDisliked: false
                        };
                    }
                }
            }

            // Si nous n'avons pas trouvé le blink dans le cache, faire un appel API pour le récupérer
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/blinks/${blinkID}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                return { hasLiked: false, hasDisliked: false };
            }

            return {
                hasLiked: data.data?.isLiked || false,
                hasDisliked: false
            };
        },
        staleTime: Infinity,
        retry: false
    });
}
*/
