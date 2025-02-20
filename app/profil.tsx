import React from 'react';
import {StyleSheet, View, Text, ActivityIndicator, Image} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {Stack, useRouter} from 'expo-router';
import {useTranslation} from 'react-i18next';

import {useTheme} from '@/context/ThemeContext';
import {useUserProfileQuery} from '@/hooks/interfaces/useProfileInterface';
import {ThemedText} from '@/components/base/ThemedText';
import {Row} from '@/components/base/Row';
import {LanguageDropdown} from '@/components/base/LanguageDropdown';
import {ThemeToggleButton} from '@/components/base/ThemeToggleButton';
import {ThemedButtonIcon} from '@/components/base/ThemedButtonIcon';
import TabBar from '@/components/base/TabBar';
import {ThemedSeparator} from "@/components/base/ThemedSeparator";

export default function ProfileScreen() {
    const {colors} = useTheme();
    const {t} = useTranslation();
    const router = useRouter();
    const gradientColors = colors.gradient;

    // Exemple d'ID utilisateur (à adapter selon votre logique)
    const userID = '829669a1-8fc8-4398-b975-249fbda5045c';

    // Récupération des données utilisateur via votre hook
    const {data, isLoading, error} = useUserProfileQuery(userID);
    return (
        <>
            <Stack.Screen/>
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={gradientColors} style={styles.background}>

                    {isLoading && (
                        <ActivityIndicator size="large" color={colors.accent}/>
                    )}

                    {error && (
                        <ThemedText variant="Title" color={colors.text}>
                            {t('profile.errorLoadingProfile')}
                        </ThemedText>
                    )}

                    {!isLoading && !error && data && (
                        <>
                            <View style={styles.headerContainer}>
                                <Row gap={12}>
                                    <Image
                                        source={{uri: "https://i.pravatar.cc/250"}}
                                        style={styles.avatar}
                                    />
                                    <View>
                                        <ThemedText variant="Title" style={styles.username}>
                                            {data.username}
                                        </ThemedText>
                                        <Text style={styles.handle}>
                                            @{data.name}
                                        </Text>
                                        <Row>
                                            <View style={styles.statItem}>
                                                <ThemedText variant={"Body"}>
                                                    {t('profile')}
                                                </ThemedText>
                                                <Text style={styles.statNumber}>
                                                    {data.score}
                                                </Text>
                                            </View>
                                            <View style={styles.statItem}>
                                                <ThemedText variant={"Body"}>
                                                    {t('profile')}
                                                </ThemedText>
                                                <Text style={styles.statNumber}>
                                                    {data.score}
                                                </Text>
                                            </View>
                                            <View style={styles.statItem}>
                                                <ThemedText variant={"Body"}>
                                                    {t('profile')}
                                                </ThemedText>
                                                <Text style={styles.statNumber}>
                                                    {data.score}
                                                </Text>
                                            </View>
                                        </Row>
                                    </View>
                                </Row>
                                {data.bio && (
                                    <View style={styles.infoContainer}>

                                        <Text style={styles.infoText}>
                                            {data.bio}
                                        </Text>
                                    </View>
                                )}
                                <ThemedSeparator barColor={colors.border} maxWidth={300}/>
                            </View>

                        </>
                    )}
                </LinearGradient>

                <TabBar/>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
    ,
    background: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
        padding: 20,
    }
    ,
    headerContainer: {
        alignItems: 'center',
        marginBottom: 5
    }
    ,
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    }
    ,
    username: {
        color: '#ffffff',
        marginBottom: 4,
    }
    ,
    handle: {
        fontSize: 16,
        color: '#8b949e',
    }
    ,
    statItem: {
        alignItems: 'center',
        marginHorizontal: 4,
    }
    ,
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    }
    ,
    infoContainer: {
        marginVertical: 8,
        alignSelf: "flex-start"
    }
    ,
    infoText: {
        fontSize: 16,
        color: '#ffffff',
        marginBottom: 4,
        textAlign: 'center',
    }
    ,
});
