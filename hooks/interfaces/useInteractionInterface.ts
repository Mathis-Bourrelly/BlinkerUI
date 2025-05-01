import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getToken } from "@/hooks/useSetToken";

type InteractionResponse = {
    created: boolean;
    removed: boolean;
    updated: boolean;
};

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

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
                throw new Error(errorData.message || `Failed to like blink. Status: ${response.status}`);
            }

            return response.json() as Promise<InteractionResponse>;
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

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
                throw new Error(errorData.message || `Failed to dislike blink. Status: ${response.status}`);
            }

            return response.json() as Promise<InteractionResponse>;
        },
        onSuccess: () => {
            // Invalidate and refetch blinks query to update the UI
            queryClient.invalidateQueries({ queryKey: ['blinks'] });
        }
    });
}

// Cette fonction vérifie si l'utilisateur a déjà liké ou disliké un blink
// Note: Cette fonction est un placeholder car l'API ne semble pas fournir cette information
// Dans une implémentation réelle, vous devriez avoir un endpoint pour vérifier l'état des interactions
export function useCheckInteractionStatus(blinkID: string) {
    return useQuery({
        queryKey: ['interaction', blinkID],
        queryFn: async () => {
            const token = await getToken();
            if (!token) {
                return { hasLiked: false, hasDisliked: false };
            }

            // Ici, vous devriez faire un appel à l'API pour vérifier l'état des interactions
            // Comme nous n'avons pas cet endpoint, nous retournons des valeurs par défaut
            return { hasLiked: false, hasDisliked: false };

            /* Exemple d'implémentation avec un endpoint réel:
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/interactions/status/${blinkID}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                return { hasLiked: false, hasDisliked: false };
            }

            return response.json();
            */
        },
        // Ne pas refetch automatiquement, seulement quand explicitement demandé
        staleTime: Infinity,
        retry: false
    });
}
