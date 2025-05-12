import React, { useState } from "react";
import {StyleSheet, View, ActivityIndicator, Image, useWindowDimensions, TouchableOpacity} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import {SafeAreaView} from "react-native-safe-area-context";
import {LinearGradient} from "expo-linear-gradient";
import {router, Stack, useLocalSearchParams, useRouter} from "expo-router";
import {useTranslation} from "react-i18next";
import {useTheme} from "@/context/ThemeContext";
import {useUserProfileQuery} from "@/hooks/interfaces/useProfileInterface";
import {ThemedText} from "@/components/base/ThemedText";
import {Row} from "@/components/base/Row";
import TabBar from "@/components/feature/TabBar";
import {ThemedSeparator} from "@/components/base/ThemedSeparator";
import NavBar from "@/components/feature/NavBar";
import {InnerContainer} from "@/components/base/InnerContainer";
import {useUser} from "@/context/UserContext";
import {Icon} from "@/components/images/Icon";
import {ScoreDot} from "@/components/feature/ScoreDot";
import {useFollowMutation, useUnfollowMutation} from "@/hooks/interfaces/useFollowInterface";
import { UserBlinkList } from "@/components/feature/UserBlinkList";

export default function ProfileScreen() {
    const {colors} = useTheme();
    const {t} = useTranslation();
    const router = useRouter();
    const gradientColors = colors.gradient;
    const {width} = useWindowDimensions();
    const isDesktop = width >= 768;
    const {user, clearUser} = useUser();
    const queryClient = useQueryClient();

    const { userID } = useLocalSearchParams<{ userID: string }>();
    console.log('Profile page - userID:', userID);

    const {data, isLoading, error} = useUserProfileQuery(userID);

    // Mutations pour suivre/ne plus suivre
    const followMutation = useFollowMutation();
    const unfollowMutation = useUnfollowMutation();

    // État local pour gérer l'état de suivi pendant les mutations
    const [isFollowingState, setIsFollowingState] = useState(false);

    // Mettre à jour l'état local lorsque les données du profil sont chargées
    React.useEffect(() => {
        if (data?.data?.isFollowing !== undefined) {
            setIsFollowingState(data.data.isFollowing);
        } else {
            // Réinitialiser l'état si nous n'avons pas de données
            setIsFollowingState(false);
        }
    }, [data, userID]);

    // Fonction pour gérer le suivi/ne plus suivre
    const handleFollowToggle = () => {
        if (isFollowingState) {
            unfollowMutation.mutate(userID as string, {
                onSuccess: () => {
                    setIsFollowingState(false);
                    // Invalider la requête du profil pour obtenir les données mises à jour
                    queryClient.invalidateQueries({ queryKey: ["profile", userID] });
                }
            });
        } else {
            followMutation.mutate(userID as string, {
                onSuccess: () => {
                    setIsFollowingState(true);
                    // Invalider la requête du profil pour obtenir les données mises à jour
                    queryClient.invalidateQueries({ queryKey: ["profile", userID] });
                }
            });
        }
    };

    // Debug log to check profile data
    console.log('Profile data:', data);
    const avatarStyle = [
        styles.avatar,
        isDesktop && {width: 120, height: 120, borderRadius: 60}
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
                            <View style={styles.contentContainer}>
                                {/* En-tête fixe avec un gradient */}
                                <LinearGradient
                                    colors={colors.gradient_profile}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 0, y: 1 }}
                                    style={styles.fixedHeader}>
                                    <Row gap={isDesktop ? 24 : 12}>
                                        <Image
                                            source={{uri: data.data.avatar_url || `${process.env.EXPO_PUBLIC_API_URL}/uploads/default_user.png`}}
                                            style={avatarStyle}
                                            onError={(e) => console.log('Error loading profile image:', e.nativeEvent.error)}
                                        />
                                        <View style={[isDesktop && {paddingHorizontal: 20}, styles.userInfoContainer]}>
                                            <ThemedText variant="SubTitle">
                                                {data.data.display_name}
                                            </ThemedText>
                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                <ThemedText variant="Body" color={colors.textSecondary}>
                                                    @{data.data.username}
                                                </ThemedText>
                                                <View style={{marginLeft: 6}}>
                                                    <ScoreDot score={data.data.score} showValue={true} size={10} />
                                                </View>
                                            </View>

                                            {/* Boutons d'action (seulement si ce n'est pas le profil de l'utilisateur actuel) */}
                                            {user && user.userID !== userID && (
                                                <View style={styles.actionButtonsContainer}>
                                                    {/* Bouton Follow/Unfollow */}
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.followButton,
                                                            {
                                                                backgroundColor: isFollowingState ? colors.background : colors.accent,
                                                                borderWidth: isFollowingState ? 1 : 0,
                                                                borderColor: colors.accent
                                                            }
                                                        ]}
                                                        onPress={handleFollowToggle}
                                                        disabled={followMutation.isPending || unfollowMutation.isPending}
                                                    >
                                                        {followMutation.isPending || unfollowMutation.isPending ? (
                                                            <ActivityIndicator size="small" color={isFollowingState ? colors.accent : colors.textInvert} />
                                                        ) : (
                                                            <ThemedText
                                                                variant="Body"
                                                                color={isFollowingState ? colors.accent : colors.textInvert}
                                                            >
                                                                {isFollowingState ? t('profile.unfollow') : t('profile.followButton')}
                                                            </ThemedText>
                                                        )}
                                                    </TouchableOpacity>

                                                    {/* Bouton Envoyer un message */}
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.messageButton,
                                                            {
                                                                backgroundColor: colors.background,
                                                                borderWidth: 1,
                                                                borderColor: colors.accent
                                                            }
                                                        ]}
                                                        onPress={() => router.push(`/messages/${userID}`)}
                                                    >
                                                        <ThemedText
                                                            variant="Body"
                                                            color={colors.accent}
                                                        >
                                                            {t('profile.sendMessage')}
                                                        </ThemedText>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                            <Row gap={isDesktop ? 20 : 12} style={styles.statsRow}>
                                                <TouchableOpacity onPress={() => router.push(`/following/${userID}`)}>
                                                    <View style={styles.statItem}>
                                                        <ThemedText variant={"Body"}>
                                                            {t('profile.follow')}
                                                        </ThemedText>
                                                        <ThemedText variant={"SubTitle"}>
                                                            {data.data.followingCount}
                                                        </ThemedText>
                                                    </View>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => router.push(`/followers/${userID}`)}>
                                                    <View style={styles.statItem}>
                                                        <ThemedText variant={"Body"}>
                                                            {t('profile.follower')}
                                                        </ThemedText>
                                                        <ThemedText variant={"SubTitle"}>
                                                            {data.data.followersCount}
                                                        </ThemedText>
                                                    </View>
                                                </TouchableOpacity>
                                                <View style={styles.statItem}>
                                                    <ThemedText variant={"Body"}>
                                                        {t('profile.blink')}
                                                    </ThemedText>
                                                    <ThemedText variant={"SubTitle"}>
                                                        {data.blinksCount}
                                                    </ThemedText>
                                                </View>
                                            </Row>
                                        </View>
                                    </Row>

                                    {data.data.bio && (
                                        <View style={styles.infoContainer}>
                                            <ThemedText variant={"Body"}>
                                                {data.data.bio}
                                            </ThemedText>
                                        </View>
                                    )}

                                    {/* Bouton de déconnexion (seulement pour le profil de l'utilisateur actuel) */}
                                    {user && user.userID === userID && (
                                        <View style={styles.logoutButtonContainer}>
                                            <TouchableOpacity
                                                style={[styles.logoutButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.danger }]}
                                                onPress={() => {
                                                    clearUser();
                                                    router.push('/login');
                                                }}
                                            >
                                                <Icon name="exit" size={24} color={colors.danger} />
                                                <ThemedText variant="Body" color={colors.danger}>
                                                    {t('profile.logout')}
                                                </ThemedText>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    <ThemedSeparator barColor={colors.border} style={styles.separator}/>

                                    {/* Titre de la section des blinks */}
                                    <ThemedText variant="SubTitle" style={styles.sectionTitle}>
                                        {t('profile.userBlinks')}
                                    </ThemedText>
                                </LinearGradient>

                                {/* Zone de défilement pour les blinks */}
                                <View style={styles.scrollableContent}>
                                    <UserBlinkList userID={userID} />
                                </View>
                            </View>
                        )}
                        {!isDesktop && (
                            <TabBar/>
                        )}
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
    contentContainer: {
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    fixedHeader: {
        width: '100%',
        paddingHorizontal: 10,
        paddingTop: 12,
        paddingBottom: 10,
        zIndex: 10,
        borderRadius: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128,128,128,0.15)',
        boxShadow: "0px 2px 3px rgba(0, 0, 0, 0.1)",
        elevation: 3, // Pour Android
    },
    scrollableContent: {
        flex: 1,
        width: '100%',
        paddingTop: 10,
    },
    scrollContainer: {
        flex: 1,
        width: '100%',
    },
    headerContainer: {
        marginTop: 12,
        paddingBottom: 80, // Espace supplémentaire en bas pour le défilement
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    userInfoContainer: {
        flex: 1,
    },
    statItem: {
        alignItems: 'center',
        marginHorizontal: 4,
    },
    statsRow: {
        marginTop: 16,
    },
    infoContainer: {
        marginVertical: 16,
        alignSelf: "flex-start",
        paddingHorizontal: 4,
    },
    logoutButtonContainer: {
        marginTop: 16,
        marginBottom: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
        alignSelf: 'flex-start',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 10,
    },
    followButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    messageButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    separator: {
        marginVertical: 16,
    },
    blinksSection: {
        marginTop: 8,
        width: '100%',
    },
    sectionTitle: {
        marginBottom: 16,
    },
});
