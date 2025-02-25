import { useMutation } from "@tanstack/react-query";
import {Endpoint} from "@/constants/Endpoint";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {router} from "expo-router";


export const storeToken = async (token: string) => {
    try {
        await AsyncStorage.setItem('token', token);
    } catch (e) {
        console.error(e);
    }
};

export const storeUserID = async (userID: string) => {
    try {
        await AsyncStorage.setItem('userID', userID);
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

export const getUserID = async () => {
    try {
        const value = await AsyncStorage.getItem('userID');
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
            await storeUserID(data.userID);
            return data;
        }
    });
}
