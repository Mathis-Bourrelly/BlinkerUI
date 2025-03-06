import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {usePostMutation} from "@/hooks/repository/usePostMutation";
import {getToken} from "@/hooks/useLoginMutation";
import {router} from "expo-router";

type User = {
    userID: string | null;
    //avatarUrl: string;
};

type UserContextType = {
    user: User | null;
    storeUser: (user: User) => void;
    clearUser: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUserState] = useState<User | null>(null);
    const { mutate } = usePostMutation("/auth");
    // Charger les informations de l'utilisateur au montage du composant
    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUserID = await AsyncStorage.getItem("userID");
                //const storedAvatarUrl = await AsyncStorage.getItem("avatarUrl");
                if (storedUserID !== null || storedUserID !== undefined) {
                    const token = await getToken()
                    mutate({body: { token },},
                        {
                            onSuccess: (data) => {
                                storeUser(data.decoded);
                            },
                            onError: (error) => {
                                router.push("/login")
                            }
                        }
                    );}
                setUserState({ userID: storedUserID });
            } catch (error) {
                console.error("Erreur lors du chargement de l'utilisateur", error);
            }
        };
        loadUser();
    }, []);

    const storeUser = async (user: User) => {
        setUserState(user);
        try {
            if (typeof user.userID === "string") {
                await AsyncStorage.setItem("userID", user.userID);
            }
            //await AsyncStorage.setItem("avatarUrl", user.avatarUrl);
        } catch (error) {
            console.error("Erreur lors du stockage de l'utilisateur", error);
        }
    };

    const clearUser = async () => {
        setUserState(null);
        try {
            await AsyncStorage.removeItem("userID");
            //await AsyncStorage.removeItem("avatarUrl");
        } catch (error) {
            console.error("Erreur lors de la suppression des données utilisateur", error);
        }
    };

    return (
        <UserContext.Provider value={{ user, storeUser: storeUser, clearUser }}>
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
