import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {usePostMutation} from "@/hooks/repository/usePostMutation";
import {getToken} from "@/hooks/useSetToken";
import {router} from "expo-router";

type User = {
    userID: string | null;
    avatarUrl?: string;
};

type UserContextType = {
    user: User | null;
    storeUser: (user: User) => Promise<void>;
    clearUser: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUserState] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { mutate } = usePostMutation("/checkToken");

    useEffect(() => {
        const loadUser = async () => {
            try {
                setIsLoading(true);
                const storedUserID = await AsyncStorage.getItem("userID");
                const storedToken = await getToken();
                const storedAvatarUrl = await AsyncStorage.getItem("avatarUrl");

                if (storedUserID && storedToken) {
                    setToken(storedToken);

                    // Use the token directly in the headers for the API call
                    mutate(
                        {
                            body: {}
                        },
                        {
                            onSuccess: (data) => {
                                if (data.valid) {
                                    storeUser({
                                        userID: storedUserID,
                                        avatarUrl: storedAvatarUrl || undefined
                                    });
                                } else {
                                    // Token invalide, rediriger vers login
                                    clearUser();
                                    router.push("/login");
                                }
                                setIsLoading(false);
                            },
                            onError: (error) => {
                                // En cas d'erreur, rediriger vers login
                                console.error("Token validation error:", error);
                                clearUser();
                                router.push("/login");
                                setIsLoading(false);
                            }
                        }
                    );
                } else {
                    // Pas de token ou userID, rediriger vers login
                    setIsLoading(false);
                    router.push("/login");
                }
            } catch (error) {
                console.error("Erreur lors du chargement de l'utilisateur", error);
                setIsLoading(false);
                router.push("/login");
            }
        };
        loadUser();
    }, []);

    const storeUser = async (user: User) => {
        console.log("Storing user with data:", user);
        setUserState(user);
        try {
            if (typeof user.userID === "string") {
                await AsyncStorage.setItem("userID", user.userID);
            }
            if (user.avatarUrl) {
                console.log("Storing avatarUrl in AsyncStorage:", user.avatarUrl);
                await AsyncStorage.setItem("avatarUrl", user.avatarUrl);
            }
        } catch (error) {
            console.error("Erreur lors du stockage de l'utilisateur", error);
        }
    };

    const clearUser = async () => {
        setUserState(null);
        setToken(null);
        try {
            await AsyncStorage.removeItem("userID");
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("avatarUrl");
        } catch (error) {
            console.error("Erreur lors de la suppression des données utilisateur", error);
        }
    };

    return (
        <UserContext.Provider value={{ user, storeUser, clearUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};

