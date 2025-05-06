import React, { useCallback } from "react";
import { View, TouchableOpacity, Image, StyleSheet, useWindowDimensions } from "react-native";
import { Icon } from "@/components/images/Icon";
import {useTheme} from "@/context/ThemeContext";
import {router, usePathname} from "expo-router";
import {useUser} from "@/context/UserContext";

export default function TabBar() {
    const { width } = useWindowDimensions();
    const { colors } = useTheme();
    const { user } = useUser();
    const pathname = usePathname();

    // Utiliser useCallback pour éviter les rendus inutiles
    // Doit être défini avant toute condition de retour
    const handleNavigation = useCallback((path: string, condition: boolean) => {
        if (condition) {
            console.log(`TabBar - Navigating to ${path}`);
            // @ts-ignore
            router.push(path);
        }
    }, []);

    // Don't render on desktop
    if (width > 768) return null;
    const dynamicColor = {
        color: colors.text,
        borderColor: colors.border,
        backgroundColor: colors.background,
    };

    return (
        <View style={[styles.tabBar, dynamicColor]}>
            <TouchableOpacity
                onPress={() => handleNavigation("/search", pathname !== "/search")}
                activeOpacity={pathname === "/search" ? 1 : 0.7}
            >
                <Icon name="search" size={32} color={pathname === "/search" ? colors.accent : dynamicColor.color} />
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => handleNavigation("/", pathname !== "/")}
                activeOpacity={pathname === "/" ? 1 : 0.7}
            >
                <Icon name="home" size={32} color={pathname === "/" ? colors.accent : dynamicColor.color} />
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => handleNavigation("/messages", !pathname.startsWith("/messages"))}
                activeOpacity={pathname.startsWith("/messages") ? 1 : 0.7}
            >
                <Icon name="chat" size={32} color={pathname.startsWith("/messages") ? colors.accent : dynamicColor.color} />
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => handleNavigation(`/profile/${user?.userID}`, !pathname.startsWith(`/profile/${user?.userID}`))}
                activeOpacity={pathname.startsWith(`/profile/${user?.userID}`) ? 1 : 0.7}
            >
                <Image
                    source={{ uri: user?.avatar_url || `${process.env.EXPO_PUBLIC_API_URL}/uploads/default_user.png` }}
                    style={[styles.avatar, {borderColor: pathname.startsWith(`/profile/${user?.userID}`) ? colors.accent : colors.text}]}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        borderTopWidth: 1,
        zIndex: 2, // S'assurer que la TabBar est au-dessus des autres éléments
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 20,
        borderWidth: 2,
    },
});
