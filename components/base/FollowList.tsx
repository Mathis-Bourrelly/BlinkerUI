import React from 'react';
import { FlatList, ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { useUserFollowsQuery } from '@/hooks/useUserFollowsQuery';
import { UserCard } from './UserCard';
import { useTheme } from '@/context/ThemeContext';

type FollowListProps = {
    userID: string;
};

export function FollowList({ userID }: FollowListProps) {
    console.log(userID);
    const { colors } = useTheme();
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
    } = useUserFollowsQuery(userID);

    const follows = data ? data.pages.flatMap(page => page.follows) : [];

    if (isLoading) {
        return <ActivityIndicator size="large" color={colors.accent} />;
    }

    if (error) {
        return <Text style={{ color: colors.danger }}>Error: {error.message}</Text>;
    }

    return (
        <FlatList
            data={data?.pages.flatMap(page => page.data)}
            renderItem={({ item }) => <UserCard follow={item} />}
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
