import { useMutation } from "@tanstack/react-query";


type RegisterCredentials = {
    email: string;
    password: string;
    username: string;
    display_name: string;
};

type RegisterResponse = {
    message: string;
    data: any;
};

export function useRegisterMutation() {
    return useMutation<RegisterResponse, Error, RegisterCredentials>({
        mutationFn: async (credentials: RegisterCredentials) => {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }
            return response.json();
        }
    });
}
