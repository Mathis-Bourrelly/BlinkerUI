import { useMutation } from "@tanstack/react-query";
import {Endpoint} from "@/constants/Endpoint";
import AsyncStorage from '@react-native-async-storage/async-storage';


export const storeToken = async (token: string) => {
    try {
        await AsyncStorage.setItem('token', token);
    } catch (e) {
        console.error(e);
    }
};

export const getToken = async () => {
    try {
        const value = await AsyncStorage.getItem('token');
        if (value !== null) {
            // value previously stored
        }
    } catch (e) {
        console.error(e);
    }
};

type LoginCredentials = {
    email: string;
    password: string;
};

type LoginResponse = {
    message: string;
    token: string;
};

export function useLoginMutation() {
    return useMutation<LoginResponse, Error, LoginCredentials>({
        mutationFn: async (credentials: LoginCredentials) => {
            const response = await fetch(`${Endpoint.url}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data: LoginResponse = await response.json();
            await storeToken(data.token); // Stocke le token après connexion réussie
            return data;
        }
    });
}
