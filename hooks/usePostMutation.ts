import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { Endpoint } from "@/constants/Endpoint";

type PostMutationVariables = {
    path: string;
    body: any;
    headers?: Record<string, string>;
};

type PostMutationResponse = any;

export function usePostMutation() {
    return useMutation<PostMutationResponse, Error, PostMutationVariables>({
        mutationFn: async ({ path, body, headers }) => {
            const response = await fetch(Endpoint.url + path, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...headers,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'An error occurred');
            }

            return response.json();
        }
    });
}
