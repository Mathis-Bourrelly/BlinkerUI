import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Profiles } from '@/types/Profiles'

type ProfilCardProps = {
    profil: Profiles;
};

export function ProfilCard({ profil }: ProfilCardProps) {
    const { colors } = useTheme();
    console.log(profil)
    return (
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Image
                source={{ uri: profil.avatarUrl || 'https://i.pravatar.cc/40' }}
                style={styles.avatar}
            />
            <View style={styles.info}>
                <Text style={[styles.display_name, { color: colors.text }]}>{profil.display_name}</Text>
                <Text style={[styles.username, { color: colors.textSecondary }]}>@{profil.username}</Text>
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
