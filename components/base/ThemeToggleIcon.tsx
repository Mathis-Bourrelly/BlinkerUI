import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Icon } from "@/components/images/Icon";

// Composant qui affiche uniquement l'icône du thème sans le bouton
export const ThemeToggleIcon: React.FC = () => {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <Icon name={"roller-brush"} color={colors.text} size={24} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
