import { useMutation } from "@tanstack/react-query";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {router} from "expo-router";


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
        router.push("/login");
    }
};


type LoginCredentials = {
    email: string;
    password: string;
};

type LoginResponse = {
    message: string;
    token: string;
    userID: string;
};

export function useLoginMutation() {

    return useMutation<LoginResponse, Error, LoginCredentials>({
        mutationFn: async (credentials: LoginCredentials) => {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const text = await response.text();
            let data: LoginResponse;
            
            try {
              data = JSON.parse(text);
            } catch (e) {
              console.error('Réponse non JSON:', text);
              throw new Error('Réponse invalide du serveur');
            }
            
            if (!response.ok) {
                console.log(data);
                throw new Error(data.message);
            }
            
            await storeToken(data.token);
            (data.token);
            return data;
        }
    });
}
