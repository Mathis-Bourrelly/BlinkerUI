import React, { useState, useEffect, useRef } from 'react';
import { FlatList, ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { BlinkCard } from './BlinkCard';
import { useBlinksQuery } from '@/hooks/interfaces/useBlinkInterface';
import { BlinkType } from '@/types/BlinksType';
import { ThemedText } from '../base/ThemedText';
import { useTranslation } from 'react-i18next';

interface UserBlinkListProps {
    userID: string;
}

export function UserBlinkList({ userID }: UserBlinkListProps) {
    const { colors } = useTheme();
    const { t } = useTranslation();
    // Utiliser la route existante avec le paramètre userId
    // Assurons-nous que le paramètre est correctement nommé (userId avec un 'd' minuscule)
    console.log(`Fetching blinks for userId: ${userID}`);
    // Utiliser exactement le même nom de paramètre que dans le backend (userId avec un 'd' minuscule)
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useBlinksQuery({ userId: userID });

    const [blinks, setBlinks] = useState<BlinkType[]>([]);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (data?.pages) {
            const allBlinks = data.pages.flatMap(page => page.data.data);
            console.log(`Received ${allBlinks.length} blinks for user ${userID}:`, allBlinks);
            setBlinks(allBlinks);
        }
    }, [data, userID]);

    const handleExpire = (blinkID: string) => {
        setBlinks(prevBlinks => prevBlinks.filter(blink => blink.blinkID !== blinkID));
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <ThemedText variant="Body" color={colors.danger}>
                    {t('common.error')}: {error instanceof Error ? error.message : 'Unknown error'}
                </ThemedText>
            </View>
        );
    }

    if (blinks.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <ThemedText variant="Body" color={colors.textSecondary}>
                    {t('profile.noBlinkYet')}
                </ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={blinks}
                keyExtractor={(item) => item.blinkID}
                renderItem={({ item }) => <BlinkCard blink={item} onExpire={handleExpire} />}
                onEndReached={() => {
                    if (hasNextPage) {
                        fetchNextPage();
                    }
                }}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={true}
                ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" color={colors.accent} /> : null}
                contentContainerStyle={styles.listContainer}
                // Désactiver le rebond pour une meilleure expérience avec l'en-tête fixe
                bounces={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    listContainer: {
        paddingBottom: 100, // Ajouter plus d'espace en bas pour permettre un défilement complet
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
