import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
    title: string;
    onPress: () => void;
    disabled?: boolean;

};

export function ThemedButton({ title, onPress, disabled = false }: Props) {
    const { colors } = useTheme();

    const gradientColors = [colors.secondary,colors.secondary,colors.secondary,colors.accent] as const;

    return (
        <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[styles.gradient, disabled && styles.disabledButton]}
        >
            <TouchableOpacity
                onPress={onPress}
                style={styles.button}
                disabled={disabled}
            >
                <Text style={[styles.text, { color: colors.background }]}>
                    {title}
                </Text>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        borderRadius: 20,
        marginVertical: 6,
    },
    button: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.6,
    },
});
