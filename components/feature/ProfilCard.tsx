import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ProfilesType } from '@/types/ProfilesType';
import { router } from 'expo-router';

type ProfilCardProps = {
    profil: ProfilesType;
};

export function ProfilCard({ profil }: ProfilCardProps) {
    const { colors } = useTheme();

    const handleProfilePress = () => {
        router.push(`/profile/${profil.userID}`);
    };

    return (
        <TouchableOpacity
            onPress={handleProfilePress}
            activeOpacity={0.7}
        >
            <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Image
                    source={{ uri: profil.avatar_url || `${process.env.EXPO_PUBLIC_API_URL}/uploads/default_user.png` }}
                    style={styles.avatar}
                />
                <View style={styles.info}>
                    <Text style={[styles.display_name, { color: colors.text }]}>{profil.display_name}</Text>
                    <Text style={[styles.username, { color: colors.textSecondary }]}>@{profil.username}</Text>
                </View>
            </View>
        </TouchableOpacity>
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
