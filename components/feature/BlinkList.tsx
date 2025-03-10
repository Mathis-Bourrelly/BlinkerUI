import React, { useState, useEffect } from 'react';
import { FlatList, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { BlinkCard } from './BlinkCard';
import { useBlinksQuery } from '@/hooks/interfaces/useBlinkInterface';
import { BlinkType } from '@/types/BlinksType';

export function BlinkList() {
    const { colors } = useTheme();
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useBlinksQuery();

    const [blinks, setBlinks] = useState<BlinkType[]>([]);

    useEffect(() => {
        if (data?.pages) {
            const allBlinks = data.pages.flatMap(page => page.data);
            setBlinks(allBlinks);
        }
    }, [data]);

    const handleExpire = (blinkID: string) => {
        setBlinks(prevBlinks => prevBlinks.filter(blink => blink.blinkID !== blinkID)); // Supprimer le blink expiré
    };

    if (isLoading) {
        return <ActivityIndicator size="large" color={colors.accent} />;
    }

    if (error) {
        return <Text style={{ color: colors.danger }}>Erreur : {error.message}</Text>;
    }

    if (!blinks.length) {
        return <Text style={{ color: colors.danger }}>Aucun blink disponible</Text>;
    }

    return (
        <FlatList
            data={blinks}
            keyExtractor={(item) => item.blinkID}
            renderItem={({ item }) => <BlinkCard blink={item} onExpire={handleExpire} />}
            onEndReached={() => {
                if (hasNextPage) {
                    fetchNextPage();
                }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" color={colors.accent} /> : null}
            contentContainerStyle={styles.listContainer}
        />
    );
}

const styles = StyleSheet.create({
    listContainer: {
        padding: 10,
    },
});
