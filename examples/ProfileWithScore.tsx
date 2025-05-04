import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { UserScoreDisplay } from '@/components/feature/UserScoreDisplay';
import { UserScoreInfoModal } from '@/components/feature/UserScoreInfoModal';
import { ProfileType } from '@/types/usersType';
import { ThemedSeparator } from '@/components/base/ThemedSeparator';

// Example profile data
const exampleProfile: ProfileType = {
  userID: '123',
  username: 'example_user',
  display_name: 'Example User',
  bio: 'This is an example user profile',
  avatar_url: 'https://example.com/avatar.jpg',
  score: 172800, // 48 hours in seconds
  followingCount: 42,
  followersCount: 120,
  blinksCount: 15
};

export function ProfileWithScore() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [showScoreInfo, setShowScoreInfo] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.profileSection}>
        <ThemedText variant="Title">{exampleProfile.display_name}</ThemedText>
        <ThemedText variant="Body" color={colors.textSecondary}>
          @{exampleProfile.username}
        </ThemedText>
        
        {exampleProfile.bio && (
          <ThemedText variant="Body" style={styles.bio}>
            {exampleProfile.bio}
          </ThemedText>
        )}
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText variant="SubTitle">{exampleProfile.blinksCount}</ThemedText>
            <ThemedText variant="Caption" color={colors.textSecondary}>
              {t('profile.blink')}
            </ThemedText>
          </View>
          
          <View style={styles.statItem}>
            <ThemedText variant="SubTitle">{exampleProfile.followingCount}</ThemedText>
            <ThemedText variant="Caption" color={colors.textSecondary}>
              {t('profile.follow')}
            </ThemedText>
          </View>
          
          <View style={styles.statItem}>
            <ThemedText variant="SubTitle">{exampleProfile.followersCount}</ThemedText>
            <ThemedText variant="Caption" color={colors.textSecondary}>
              {t('profile.follower')}
            </ThemedText>
          </View>
        </View>
      </View>
      
      <ThemedSeparator barColor={colors.border} />
      
      {/* User Score Display */}
      <UserScoreDisplay 
        profile={exampleProfile} 
        showDescription={true}
        onInfoPress={() => setShowScoreInfo(true)}
      />
      
      {/* Score Info Modal */}
      <UserScoreInfoModal 
        visible={showScoreInfo}
        onClose={() => setShowScoreInfo(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    marginBottom: 16,
  },
  bio: {
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
});
