import React from "react";
import { View, TouchableOpacity, Image, StyleSheet, useWindowDimensions } from "react-native";
import { Icon } from "@/components/images/Icon";
import {useTheme} from "@/context/ThemeContext";
import {router} from "expo-router";

export default function TabBar() {
    const { width } = useWindowDimensions();
    const { colors } = useTheme();
    if (width > 768) return null;
    const dynamicColor = {
        color: colors.text,
        borderColor: colors.border,
        backgroundColor: colors.background,
    };
    return (
        <View style={[styles.tabBar, dynamicColor]}>
            <TouchableOpacity onPress={() => router.push("/")}>
                <Icon name="search" size={32} color={dynamicColor.color} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/")}>
                <Icon name="home" size={32} color={dynamicColor.color} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/profil")}>
                <Image
                    source={{ uri: "https://i.pravatar.cc/32" }}
                    style={[styles.avatar, {borderColor: colors.text}]}
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
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 20,
        borderWidth: 2,
    },
});
