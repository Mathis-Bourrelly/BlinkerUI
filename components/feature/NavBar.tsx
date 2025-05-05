import React from "react";
import {View, TouchableOpacity, Image, StyleSheet, useWindowDimensions} from "react-native";
import {Icon} from "@/components/images/Icon";
import {useTheme} from "@/context/ThemeContext";
import {router} from "expo-router";
import {ThemedText} from "@/components/base/ThemedText";
import {ThemedVerticalSeparator} from "@/components/base/ThemedVerticalSeparator";
import {ThemedLogo} from "@/components/images/ThemedLogo";
import {Row} from "@/components/base/Row";
import {useUser} from "@/context/UserContext";

export default function NavBar() {
    const {width} = useWindowDimensions();
    const {colors} = useTheme();
    const { user } = useUser();

    // Debug log to check if user and avatar_url are available
    console.log("NavBar user:", user);

    if (width < 768) return null;

    return (
        <View style={styles.navBar}>
            <View style={styles.navLinkContainer}>
                <ThemedLogo height={40}/>
                <TouchableOpacity onPress={() => router.push("/")}>
                    <ThemedText>Accueil</ThemedText>
                </TouchableOpacity>
                <ThemedVerticalSeparator barColor={colors.border} height={20}/>
                <TouchableOpacity onPress={() => router.push("/")}>
                    <ThemedText>Tendances</ThemedText>
                </TouchableOpacity>
                <ThemedVerticalSeparator barColor={colors.border} height={20}/>
                <TouchableOpacity onPress={() => router.push("/")}>
                    <ThemedText>Leaderboard</ThemedText>
                </TouchableOpacity>
                <ThemedVerticalSeparator barColor={colors.border} height={20}/>
                <TouchableOpacity onPress={() => router.push("/")}>
                    <ThemedText>Poster</ThemedText>
                </TouchableOpacity>
                <ThemedVerticalSeparator barColor={colors.border} height={20} />
                <TouchableOpacity onPress={() => router.push("/messages")}>
                <ThemedText>Messagerie</ThemedText>
                </TouchableOpacity>
                <ThemedVerticalSeparator barColor={colors.border} height={20} />
                <TouchableOpacity onPress={() => router.push("/search")}>
                <ThemedText>Rechercher</ThemedText>
                </TouchableOpacity>
            </View>
            <Row gap={12}>
                <TouchableOpacity onPress={() => router.push("/search")}>
                    <Icon name={"search"} size={32} color={colors.text}></Icon>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push(`/profile/${user?.userID}`)}>
                    {/* Use user's avatar URL if available, otherwise use a default avatar */}
                    <Image
                        source={{uri: user?.avatar_url || `${process.env.EXPO_PUBLIC_API_URL}/uploads/default_user.png` }}
                        style={[styles.avatar, {borderColor: colors.text}]}
                    />
                </TouchableOpacity>
            </Row>
        </View>
    );
}

const styles = StyleSheet.create({
    navBar: {
        height: 60,
        flexDirection: "row",
        justifyContent: "space-between",
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
