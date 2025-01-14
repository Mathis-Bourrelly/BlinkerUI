import { useMutation } from "@tanstack/react-query";

const endpoint = "http://dev.blinker.eterny.fr";

type LoginCredentials = {
    email: string;
    password: string;
};

type LoginResponse = {
    token: string;
    user: {
        id: number;
        email: string;
    };
};

export function useLoginMutation() {
    return useMutation<LoginResponse, Error, LoginCredentials>({
        mutationFn: async (credentials: LoginCredentials) => {
            const response = await fetch(`${endpoint}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            return response.json();
        }
    });
}
