import { useMutation } from "@tanstack/react-query";
import { getToken } from "@/hooks/useSetToken";

type DeleteMutationResponse = {
    success: boolean;
    status: number;
    message: string;
    data: any;
};

export function useDeleteMutation(path: string, token?: string) {
    return useMutation<DeleteMutationResponse, Error, void>({
        mutationFn: async () => {
            // Get token from AsyncStorage if not provided
            let authToken = token;
            if (!authToken) {
                authToken = await getToken() || undefined;
            }

            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${path}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                },
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: `HTTP error! Status: ${res.status}` }));
                throw new Error(errorData.message || "Failed to delete data");
            }
            return res.json();
        },
    });
}
