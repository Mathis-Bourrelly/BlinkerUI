import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ProfileType } from '@/types/usersType';
import { useFormatUserScore } from '@/utils/scoreUtils';
import { Icon } from '@/components/images/Icon';
import { LinearGradient } from 'expo-linear-gradient';

type UserScoreDisplayProps = {
  profile: ProfileType;
  showDescription?: boolean;
  onInfoPress?: () => void;
};

export function UserScoreDisplay({ 
  profile, 
  showDescription = false,
  onInfoPress
}: UserScoreDisplayProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { formatScore, getScoreDescription } = useFormatUserScore();

  return (
    <View style={styles.container}>
      <View style={styles.scoreHeader}>
        <ThemedText variant="SubTitle">{t('common.score')}</ThemedText>
        {onInfoPress && (
          <TouchableOpacity onPress={onInfoPress}>
            <Icon name="info" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      
      <LinearGradient
        colors={colors.accentGradient}
        style={[styles.scoreContainer, { borderRadius: 12 }]}
      >
        <ThemedText 
          variant="Title"
          color={colors.textInvert}
          style={styles.scoreValue}
        >
          {formatScore(profile.score)}
        </ThemedText>
      </LinearGradient>
      
      {showDescription && (
        <ThemedText 
          variant="Caption" 
          color={colors.textSecondary}
          style={styles.description}
        >
          {getScoreDescription(profile)}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreContainer: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 8,
    textAlign: 'center',
  }
});
