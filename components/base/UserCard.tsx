// components/UserCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export interface Follow {
    userID: string;
    display_name: string;
    username: string;
    name: string;
    avatarUrl?: string;
}

type UserCardProps = {
    follow: Follow;
};

export function UserCard({ follow }: UserCardProps) {
    const { colors } = useTheme();

    return (
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Image
                source={{ uri: follow.avatarUrl || 'https://i.pravatar.cc/40' }}
                style={styles.avatar}
            />
            <View style={styles.info}>
                <Text style={[styles.display_name, { color: colors.text }]}>{follow.display_name}</Text>
                <Text style={[styles.username, { color: colors.textSecondary }]}>@{follow.username}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        padding: 8,
        borderWidth: 1,
        borderRadius: 8,
        marginVertical: 4,
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    info: {
        marginLeft: 10,
    },
    display_name: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    username: {
        fontSize: 14,
    },
});
