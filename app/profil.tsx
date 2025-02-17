import { StyleSheet, View, Text, ActivityIndicator, Image } from 'react-native';
import { ThemedText } from "@/components/base/ThemedText";
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useTranslation } from "react-i18next";
import { Row } from "@/components/base/Row";
import { LanguageDropdown } from "@/components/base/LanguageDropdown";
import { ThemeToggleButton } from "@/components/base/ThemeToggleButton";
import { ThemedButtonIcon } from "@/components/base/ThemedButtonIcon";
import { useUserProfileQuery } from "@/hooks/interfaces/useProfileInterface"// Import du hook

export default function Index() {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const router = useRouter();
    const gradientColors = colors.gradient;
    const userID = "829669a1-8fc8-4398-b975-249fbda5045c"; // Exemple d'ID utilisateur à remplacer par la logique de ton application
    const { data, isLoading, error } = useUserProfileQuery(userID);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={gradientColors} style={styles.background}>
                    <ActivityIndicator size="large" color={colors.accent} />
                </LinearGradient>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={gradientColors} style={styles.background}>
                    <ThemedText variant="Title" color={colors.text}>
                        {t('profile.errorLoadingProfile')}
                    </ThemedText>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={gradientColors} style={styles.background}>
                <ThemedText variant="Title" color={colors.text}>
                    Profil
                </ThemedText>

                <View style={styles.profileContainer}>
                    <Text style={styles.profileText}>{t('profile.username')}: {data?.username}</Text>
                    <Text style={styles.profileText}>{t('profile.score')}: {data?.score}</Text>

                    {data?.bio && (
                        <Text style={styles.profileText}>{t('profile.bio')}: {data?.bio}</Text>
                    )}

                    {data?.avatarUrl ? (
                        <Image
                            source={{ uri: data.avatarUrl }}
                            style={styles.avatar}
                        />
                    ) : (
                        <Text style={styles.profileText}>{t('profile.noAvatar')}</Text>
                    )}
                </View>

                <ThemedButtonIcon
                    text={t("profile.goToLogin")}
                    onPress={() => router.push("/login")}
                    iconName={"circled-left--v2"}
                />
                <Row gap={12}>
                    <LanguageDropdown />
                    <ThemeToggleButton />
                </Row>
            </LinearGradient>
        </SafeAreaView>
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
        justifyContent: 'center',
        width: '100%',
        padding: 20,
    },
    profileContainer: {
        marginTop: 20,
        width: '100%',
        padding: 10,
        alignItems: 'center',
    },
    profileText: {
        fontSize: 18,
        marginVertical: 5,
        color: 'white', // Assurer la visibilité du texte sur fond sombre
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginTop: 10,
    },
});
