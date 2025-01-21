import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { useIcons8 } from '@/hooks/useIcons8';

type IconProps = {
    name: string;  // Nom de l'icône, par exemple "language"
    size?: number; // Taille en pixels, valeur par défaut à 48
};

export function Icon({ name, size = 48 }: IconProps) {
    const iconUrl = useIcons8(name, size);
    return <Image source={{ uri: iconUrl }} style={[styles.icon, { width: size, height: size }]} />;
}

const styles = StyleSheet.create({
    icon: {
        resizeMode: 'contain',
    },
});
