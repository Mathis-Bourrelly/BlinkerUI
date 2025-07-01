import React from 'react';
import { Image, StyleSheet, ImageProps } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type ThemedLogoProps = {
    width?: number;
    height?: number;
} & ImageProps;

export function ThemedLogo({ width = 100, height = 100, ...props }: ThemedLogoProps) {
    const { theme } = useTheme();
    const logoSource = theme === 'dark'
        ? require('@/assets/images/logo-dark.svg')
        : require('@/assets/images/logo-light.svg');

    return <Image source={logoSource} style={[styles.logo, { width, height }]} resizeMode="contain" {...props} />;
}

const styles = StyleSheet.create({
    logo: {},
});
