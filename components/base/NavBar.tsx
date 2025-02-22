import React from "react";
import {View, TouchableOpacity, Image, StyleSheet, useWindowDimensions} from "react-native";
import {Icon} from "@/components/images/Icon";
import {useTheme} from "@/context/ThemeContext";
import {router} from "expo-router";
import {ThemedText} from "@/components/base/ThemedText";
import {ThemedVerticalSeparator} from "@/components/base/ThemedVerticalSeparator";
import {ThemedLogo} from "@/components/images/ThemedLogo";

export default function NavBar() {
    const {width} = useWindowDimensions();
    const {colors} = useTheme();
    if (width < 768) return null;

    return (
        <View style={styles.navBar}>
            <View style={styles.navLinkContainer}>
                <ThemedLogo height={40} />
                <TouchableOpacity onPress={() => router.push("/")}>
                    <ThemedText>Acceuil</ThemedText>
                </TouchableOpacity>
                <ThemedVerticalSeparator barColor={colors.border} height={20}/>
                <TouchableOpacity onPress={() => router.push("/")}>
                    <ThemedText>Tendance</ThemedText>
                </TouchableOpacity>
                <ThemedVerticalSeparator barColor={colors.border} height={20}/>
                <TouchableOpacity onPress={() => router.push("/")}>
                    <ThemedText>Leaderboard</ThemedText>
                </TouchableOpacity>
                <ThemedVerticalSeparator barColor={colors.border} height={20}/>
                <TouchableOpacity onPress={() => router.push("/")}>
                    <ThemedText>Poster</ThemedText>
                </TouchableOpacity>
                <ThemedVerticalSeparator barColor={colors.border} height={20}/>
                <TouchableOpacity onPress={() => router.push("/")}>
                    <ThemedText>Notification</ThemedText>
                </TouchableOpacity>
                <ThemedVerticalSeparator barColor={colors.border} height={20}/>
                <TouchableOpacity onPress={() => router.push("/")}>
                    <ThemedText>Messagerie</ThemedText>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => router.push("/profil")}>
                <Image
                    source={{uri: "https://i.pravatar.cc/32"}}
                    style={[styles.avatar, {borderColor: colors.text}]}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    navBar: {
        height: 60,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        width: "100%",
    },
    navLinkContainer: {
        gap: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 20,
        borderWidth: 2,
    },
});
