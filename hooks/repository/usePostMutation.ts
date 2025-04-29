import { useMutation } from "@tanstack/react-query";
import { getToken } from "@/hooks/useSetToken";

type PostMutationResponse = any;

export function usePostMutation(path: string, token?: string) {
    return useMutation<PostMutationResponse, Error, { body: any }>({
        mutationFn: async ({ body }) => {
            // Get token from AsyncStorage if not provided
            let authToken = token;
            if (!authToken) {
                authToken = await getToken() || undefined;
            }

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${path}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                },
                body: JSON.stringify(body), // Sérialise le corps de la requête en JSON
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "An error occurred");
            }

            return response.json();
        }
    });
}
