import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export function ThemedFullLogo() {
    const { theme } = useTheme(); // Utilise le hook du contexte
    const logoSource = theme === 'dark'
        ? require('@/assets/images/full-logo-light.svg')
        : require('@/assets/images/full-logo-dark.svg'); // Charge le logo correspondant

    return <Image source={logoSource} style={styles.logo} resizeMode={"contain"} />;
}

const styles = StyleSheet.create({
    logo: {
        width: '100%',
    },
});