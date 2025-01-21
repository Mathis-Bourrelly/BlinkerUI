import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import {ThemedText} from "@/components/base/ThemedText";

type Props = {
    text: string;
    onPress: () => void;
    disabled?: boolean;

};

export function GradientButton({ text, onPress, disabled = false }: Props) {
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
                <ThemedText variant={"ButtonText"} color={colors.textInvert}>
                    {text}
                </ThemedText>
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
    disabledButton: {
        opacity: 0.6,
    },
});
