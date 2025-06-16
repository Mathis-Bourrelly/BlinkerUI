import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/context/UserContext';
import { InnerContainer } from '@/components/base/InnerContainer';
import { ThemedText } from '@/components/base/ThemedText';
import NavBar from '@/components/feature/NavBar';
import TabBar from '@/components/feature/TabBar';
import { TrendingTagsList } from '@/components/feature/TrendingTagsList';
import CreateBlinkModal from '@/components/feature/CreateBlinkModal';

type ViewMode = 'popular' | 'trending';

export default function TrendsPage() {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { user } = useUser();
    const { width } = useWindowDimensions();
    const [viewMode, setViewMode] = useState<ViewMode>('popular');
    const [isModalVisible, setIsModalVisible] = useState(false);

    const gradientColors = colors.gradient;
    const isDesktop = width > 768;

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    // Redirection si l'utilisateur n'est pas connecté
    if (!user) {
        return null; // Ou redirection vers login
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: t('trends.title'),
                    headerShown: false,
                }}
            />
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={gradientColors} style={styles.background}>
                    <InnerContainer>
                        <NavBar />


                        {/* Liste des tags */}
                        <View style={styles.contentContainer}>
                            <TrendingTagsList/>
                        </View>
                    </InnerContainer>
                </LinearGradient>

                {/* Modal de création de blink */}
                <CreateBlinkModal
                    visible={isModalVisible}
                    onClose={handleCloseModal}
                />

                {/* TabBar pour mobile */}
                <TabBar onCreatePress={handleOpenModal} />
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        alignItems: 'center',
    },
    headerContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        alignItems: 'center',
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modeSelectorContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    modeSelector: {
        flexDirection: 'row',
        borderRadius: 12,
        borderWidth: 1,
        padding: 4,
    },
    modeButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    modeButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    contentContainer: {
        flex: 1,
    },
});