import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Icon} from "@/components/images/Icon";

export const ThemeToggleButton: React.FC = () => {
    const { theme, colors, toggleTheme } = useTheme();

    const handleToggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        toggleTheme(); // Change le thème via le contexte
        await AsyncStorage.setItem('theme', newTheme); // Stocke le nouveau thème
    };

    return (
        <View>
            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.card }]}
                onPress={handleToggleTheme}
            >
                <Icon name={"roller-brush"} color={colors.text} size={32}/>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
