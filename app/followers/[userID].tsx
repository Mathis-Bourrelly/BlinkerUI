import React from "react";
import {StyleSheet, ActivityIndicator, useWindowDimensions} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {LinearGradient} from "expo-linear-gradient";
import {Stack, useLocalSearchParams, useRouter} from "expo-router";
import {useTranslation} from "react-i18next";
import {useTheme} from "@/context/ThemeContext";
import {useUserFollowersQuery} from "@/hooks/interfaces/useProfileInterface";
import {ThemedText} from "@/components/base/ThemedText";
import TabBar from "@/components/feature/TabBar";
import NavBar from "@/components/feature/NavBar";
import {InnerContainer} from "@/components/base/InnerContainer";
import {ProfilList} from "@/components/feature/ProfilList";


export default function followersScreen() {
    const {colors} = useTheme();
    const {t} = useTranslation();
    const router = useRouter();
    const gradientColors = colors.gradient;
    const {width} = useWindowDimensions();
    const isDesktop = width >= 768;

    const { userID } = useLocalSearchParams<{ userID: string }>();

    return (
        <>
            <Stack.Screen/>
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={gradientColors} style={styles.background}>
                    <InnerContainer>
                        <NavBar/>
                        {!isDesktop && (
                            <TabBar/>
                        )}
                        <ThemedText variant={"Title"}>{t('profile.follower')}</ThemedText>
                        {/*@ts-ignore*/}
                        <ProfilList fetchProfiles={() => useUserFollowersQuery(userID)} />
                    </InnerContainer>
                </LinearGradient>
            </SafeAreaView>
        </>

    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    background: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
    },
});
