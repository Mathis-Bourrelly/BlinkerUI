import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import {useTheme} from "@/context/ThemeContext";

export function ThemedTitle() {
    const { theme } = useTheme(); // Récupère le thème actuel

    const titleSource = theme === 'dark'
        ? require('@/assets/images/title-dark.svg')
        : require('@/assets/images/title-light.svg'); // Charge le title correspondant

    return <Image source={titleSource} style={styles.title} resizeMode={"contain"} />

}

const styles = StyleSheet.create({
    title: {
        height: 150,
    },
});
