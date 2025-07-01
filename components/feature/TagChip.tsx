import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { Icon } from '@/components/images/Icon';

interface TagChipProps {
    tag: string | { tagID?: string; name: string };
    onPress?: () => void;
    onRemove?: () => void;
    variant?: 'default' | 'removable' | 'clickable';
    size?: 'small' | 'medium';
    style?: ViewStyle;
}

export function TagChip({ 
    tag, 
    onPress, 
    onRemove, 
    variant = 'default',
    size = 'medium',
    style 
}: TagChipProps) {
    const { colors } = useTheme();

    // Extract tag name whether it's a string or object
    const tagName = typeof tag === 'string' ? tag : tag.name;

    const handlePress = () => {
        if (variant === 'clickable' && onPress) {
            onPress();
        }
    };

    const handleRemove = (e: any) => {
        e.stopPropagation();
        if (onRemove) {
            onRemove();
        }
    };

    const chipStyles = [
        styles.chip,
        {
            backgroundColor: colors.accent + '20', // Accent color with transparency
            borderColor: colors.accent + '40',
        },
        size === 'small' && styles.chipSmall,
        variant === 'clickable' && styles.clickable,
        style
    ];

    const textSize = size === 'small' ? 12 : 14;

    return (
        <TouchableOpacity
            style={chipStyles}
            onPress={handlePress}
            activeOpacity={variant === 'clickable' ? 0.7 : 1}
            disabled={variant === 'default'}
        >
            <ThemedText 
                style={[
                    styles.tagText, 
                    { color: colors.accent, fontSize: textSize }
                ]}
            >
                #{tagName}
            </ThemedText>
            
            {variant === 'removable' && onRemove && (
                <TouchableOpacity
                    onPress={handleRemove}
                    style={styles.removeButton}
                    hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                >
                    <Icon 
                        name="cancel" 
                        size={size === 'small' ? 14 : 16} 
                        color={colors.accent} 
                    />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        marginRight: 8,
        marginBottom: 8,
    },
    chipSmall: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    clickable: {
        // Styles supplémentaires pour les chips cliquables si nécessaire
    },
    tagText: {
        fontWeight: '600',
    },
    removeButton: {
        marginLeft: 6,
        padding: 2,
    },
});
