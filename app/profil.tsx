import React from "react";
import {StyleSheet, View, ActivityIndicator, Image, useWindowDimensions} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {LinearGradient} from "expo-linear-gradient";
import {Stack, useRouter} from "expo-router";
import {useTranslation} from "react-i18next";
import {useTheme} from "@/context/ThemeContext";
import {useUserProfileQuery} from "@/hooks/interfaces/useProfileInterface";
import {ThemedText} from "@/components/base/ThemedText";
import {Row} from "@/components/base/Row";
import TabBar from "@/components/base/TabBar";
import {LanguageDropdown} from "@/components/base/LanguageDropdown";
import {ThemeToggleButton} from "@/components/base/ThemeToggleButton";
import {ThemedSeparator} from "@/components/base/ThemedSeparator";
import NavBar from "@/components/base/NavBar";
import {InnerContainer} from "@/components/base/InnerContainer";
import {FollowList} from "@/components/base/FollowList";

export default function ProfileScreen() {
    const {colors} = useTheme();
    const {t} = useTranslation();
    const router = useRouter();
    const gradientColors = colors.gradient;
    const {width} = useWindowDimensions();
    const isDesktop = width >= 768;

    // Exemple d'ID utilisateur (à adapter selon votre logique)
    const userID = "829669a1-8fc8-4398-b975-249fbda5045c";

    const {data, isLoading, error} = useUserProfileQuery(userID);


    const headerContainerStyle = [
        styles.headerContainer,
        isDesktop && {
            marginBottom: 20,
            width: '100%',
            alignItems: 'flex-start',
        },
    ];
    const avatarStyle = [
        styles.avatar,
        isDesktop && { width: 120, height: 120, borderRadius: 60 }
    ];

    return (
        <>
            <Stack.Screen/>
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={gradientColors} style={styles.background}>
                    <InnerContainer>
                    <NavBar/>
                    {isLoading && (
                        <ActivityIndicator size="large" color={colors.accent}/>
                    )}

                    {error && (
                        <ThemedText variant="Title" color={colors.text}>
                            {t('profile.errorLoadingProfile')}
                        </ThemedText>
                    )}

                    {!isLoading && !error && data && (
                        //@ts-ignore
                        <View style={headerContainerStyle}>
                            <Row gap={isDesktop ? 24 : 12}>
                                <Image
                                    source={{ uri: "https://i.pravatar.cc/250" }}
                                    style={avatarStyle}
                                />
                                <View style={isDesktop && {paddingHorizontal: 20}}>
                                    <ThemedText variant="SubTitle">
                                        {data.username}
                                    </ThemedText>
                                    <ThemedText variant="Body" color={colors.textSecondary}>
                                        @{data.name}
                                    </ThemedText>
                                    <Row gap={isDesktop ? 20 : 12}>
                                        <View style={styles.statItem}>
                                            <ThemedText variant={"Body"}>
                                                {t('profile.follow')}
                                            </ThemedText>
                                            <ThemedText variant={"SubTitle"}>
                                                {data.score}
                                            </ThemedText>
                                        </View>
                                        <View style={styles.statItem}>
                                            <ThemedText variant={"Body"}>
                                                {t('profile.follower')}
                                            </ThemedText>
                                            <ThemedText variant={"SubTitle"}>
                                                {data.score}
                                            </ThemedText>
                                        </View>
                                        <View style={styles.statItem}>
                                            <ThemedText variant={"Body"}>
                                                {t('profile.blink')}
                                            </ThemedText>
                                            <ThemedText variant={"SubTitle"}>
                                                {data.score}
                                            </ThemedText>
                                        </View>
                                    </Row>
                                </View>
                            </Row>
                            {data.bio && (
                                <View style={styles.infoContainer}>
                                    <ThemedText variant={"Body"}>
                                        {data.bio}
                                    </ThemedText>
                                </View>
                            )}
                            <ThemedSeparator barColor={colors.border}/>
                            <Row gap={isDesktop ? 24 : 12}>
                                <LanguageDropdown/>
                                <ThemeToggleButton/>
                            </Row>

                        </View>
                    )}
                    {!isDesktop && (
                        <TabBar/>
                    )}
                        <FollowList userID={userID} />
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
    headerContainer: {
        marginTop: 12
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    statItem: {
        alignItems: 'center',
        marginHorizontal: 4,
    },
    infoContainer: {
        marginVertical: 8,
        alignSelf: "flex-start",
    },
});
