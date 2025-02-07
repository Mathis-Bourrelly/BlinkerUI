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
            return value
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



            const data: LoginResponse = await response.json();

            if (!response.ok) {
                console.log(data);
                throw new Error(data.message);
            }

            await storeToken(data.token);
            return data;
        }
    });
}
