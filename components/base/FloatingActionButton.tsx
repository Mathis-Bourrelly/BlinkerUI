import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Icon } from '@/components/images/Icon';
import { useTheme } from '@/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

interface FloatingActionButtonProps {
    onPress: () => void;
    iconName: string;
    size?: number;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
    onPress,
    iconName,
    size = 56
}) => {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
                style={[styles.button, { width: size, height: size, borderRadius: size / 2 }]}
            >
                <LinearGradient
                    colors={colors.accentGradient}
                    style={[styles.gradient, { width: size, height: size, borderRadius: size / 2 }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Icon name={iconName} size={size / 2} color="#FFFFFF" />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 999,
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    gradient: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
