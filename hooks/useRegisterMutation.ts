import { useMutation } from "@tanstack/react-query";
import { Endpoint } from "@/constants/Endpoint";

type RegisterCredentials = {
    email: string;
    password: string;
    name: string;
    role?: string;
};

type RegisterResponse = {
    message: string;
    data: any;
};

export function useRegisterMutation() {
    return useMutation<RegisterResponse, Error, RegisterCredentials>({
        mutationFn: async (credentials: RegisterCredentials) => {
            const response = await fetch(`${Endpoint.url}/users/register`, {
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
