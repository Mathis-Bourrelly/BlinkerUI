import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export function ThemedLogo() {
    const { theme } = useTheme(); // Utilise le hook du contexte
    const logoSource = theme === 'dark'
        ? require('@/assets/images/logo-dark.svg')
        : require('@/assets/images/logo-light.svg'); // Charge le logo correspondant

    return <Image source={logoSource} style={styles.logo} resizeMode={"contain"} />;
}

const styles = StyleSheet.create({
    logo: {
        height: 150,
    },
});