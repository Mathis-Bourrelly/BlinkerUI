import React from 'react';
import { FlatList, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ProfilCard } from './ProfilCard';
import { UseInfiniteQueryResult } from '@tanstack/react-query';
import { Profiles } from '@/types/Profiles'

type UserListProps = {
    fetchProfiles: () => UseInfiniteQueryResult<{ data: Profiles[] }, Error>; // Fonction pour récupérer les profils
};

export function ProfilList({ fetchProfiles }: UserListProps) {
    const { colors } = useTheme();
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
    } = fetchProfiles();

    const profiles = data ? data.pages.flatMap(page => page.data) : [];

    if (isLoading) {
        return <ActivityIndicator size="large" color={colors.accent} />;
    }

    if (error) {
        return <Text style={{ color: colors.danger }}>Error: {error.message}</Text>;
    }
    return (
        <FlatList
            data={profiles}
            keyExtractor={(item) => item.userID}
            renderItem={({ item }) => <ProfilCard profil={item} />}
            onEndReached={() => {
                if (hasNextPage) {
                    fetchNextPage();
                }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
                isFetchingNextPage ? <ActivityIndicator size="small" color={colors.accent} /> : null
            }
            contentContainerStyle={styles.listContainer}
        />
    );
}

const styles = StyleSheet.create({
    listContainer: {
        padding: 10,
    },
});
