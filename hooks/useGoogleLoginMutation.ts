import { useMutation } from "@tanstack/react-query";

type GoogleLoginParams = { id_token: string };

type GoogleLoginResponse = {
    success: boolean;
    status: number;
    message: string;
    data: {
        token: string;
        userID: string;
    };
};
export function useGoogleLoginMutation() {
    return useMutation<GoogleLoginResponse, Error, GoogleLoginParams>({
        mutationFn: async ({ id_token }: GoogleLoginParams) => {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/login/google`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id_token }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }
            return response.json();
        },
    });
}
