import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/images/Icon';
import { ThemedSeparator } from '@/components/base/ThemedSeparator';

type UserScoreInfoModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function UserScoreInfoModal({ visible, onClose }: UserScoreInfoModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <ThemedText variant="Title">{t('profile.score')}</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ThemedSeparator barColor={colors.border} />
          
          <ScrollView style={styles.scrollContent}>
            <ThemedText variant="SubTitle" style={styles.sectionTitle}>
              {t('profile.scoreInfo')}
            </ThemedText>
            
            <ThemedText variant="Body" style={styles.paragraph}>
              Your user score is calculated based on the average lifetime of your blinks (posts) that have been deleted.
            </ThemedText>
            
            <ThemedText variant="Body" style={styles.paragraph}>
              The higher your score, the longer your messages will remain available to other users before they expire.
            </ThemedText>
            
            <ThemedText variant="SubTitle" style={styles.sectionTitle}>
              How to improve your score
            </ThemedText>
            
            <View style={styles.bulletPoint}>
              <View style={[styles.bullet, { backgroundColor: colors.accent }]} />
              <ThemedText variant="Body" style={styles.bulletText}>
                Create high-quality content that engages users
              </ThemedText>
            </View>
            
            <View style={styles.bulletPoint}>
              <View style={[styles.bullet, { backgroundColor: colors.accent }]} />
              <ThemedText variant="Body" style={styles.bulletText}>
                Post regularly to maintain user interest
              </ThemedText>
            </View>
            
            <View style={styles.bulletPoint}>
              <View style={[styles.bullet, { backgroundColor: colors.accent }]} />
              <ThemedText variant="Body" style={styles.bulletText}>
                Interact with other users' content
              </ThemedText>
            </View>
            
            <ThemedText variant="Caption" style={[styles.note, { color: colors.textSecondary }]}>
              Note: Your score is updated when blinks are deleted, when you create new blinks, and periodically every 12 hours.
            </ThemedText>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scrollContent: {
    marginTop: 12,
  },
  sectionTitle: {
    marginVertical: 12,
  },
  paragraph: {
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
  },
  note: {
    marginTop: 16,
    fontStyle: 'italic',
  }
});
