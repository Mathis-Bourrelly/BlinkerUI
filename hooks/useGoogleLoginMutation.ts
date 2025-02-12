import { useMutation } from "@tanstack/react-query";
import { Endpoint } from "@/constants/Endpoint";

type GoogleLoginParams = { id_token: string };

export function useGoogleLoginMutation() {
    return useMutation({
        mutationFn: async ({ id_token }: GoogleLoginParams) => {
            const response = await fetch(`${Endpoint.url}/auth/google`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id_token }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            return response.json();
        },
    });
}
