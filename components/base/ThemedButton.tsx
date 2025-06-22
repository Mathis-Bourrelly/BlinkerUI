import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ThemedText } from './ThemedText';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function ThemedButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  style 
}: ThemedButtonProps) {
  const { colors } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = [styles.button, style];
    
    if (disabled || loading) {
      return [...baseStyle, { backgroundColor: colors.textSecondary, opacity: 0.6 }];
    }

    switch (variant) {
      case 'primary':
        return [...baseStyle, { backgroundColor: colors.accent }];
      case 'secondary':
        return [...baseStyle, { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }];
      case 'danger':
        return [...baseStyle, { backgroundColor: colors.danger }];
      default:
        return [...baseStyle, { backgroundColor: colors.accent }];
    }
  };

  const getTextColor = () => {
    if (disabled || loading) {
      return colors.background;
    }

    switch (variant) {
      case 'primary':
        return colors.background;
      case 'secondary':
        return colors.text;
      case 'danger':
        return colors.background;
      default:
        return colors.background;
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <ThemedText variant="ButtonText" style={{ color: getTextColor() }}>
          {title}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
});
