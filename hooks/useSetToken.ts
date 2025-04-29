import AsyncStorage from "@react-native-async-storage/async-storage";
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