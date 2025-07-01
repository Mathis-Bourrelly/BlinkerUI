import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Icon } from "@/components/images/Icon";

// Composant qui affiche uniquement l'icône de la langue sans le dropdown
export const LanguageIcon: React.FC = () => {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <Icon name={"language"} size={24} color={colors.text} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
