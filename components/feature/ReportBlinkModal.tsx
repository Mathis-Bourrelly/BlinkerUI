import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/base/ThemedText';
import { Icon } from '@/components/images/Icon';
import { ThemedTextInput } from '@/components/base/ThemedTextInput';
import { ThemedButton } from '@/components/base/ThemedButton';
import { ReportReason } from '@/types/ReportsType';
import { useCreateReportMutation } from '@/hooks/interfaces/useReportInterface';

interface ReportBlinkModalProps {
  visible: boolean;
  onClose: () => void;
  blinkID: string;
}

export function ReportBlinkModal({ visible, onClose, blinkID }: ReportBlinkModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const createReportMutation = useCreateReportMutation();

  const reportReasons = [
    { key: ReportReason.SPAM, label: t('reports.reasons.spam') },
    { key: ReportReason.HARASSMENT, label: t('reports.reasons.harassment') },
    { key: ReportReason.HATE_SPEECH, label: t('reports.reasons.hate_speech') },
    { key: ReportReason.VIOLENCE, label: t('reports.reasons.violence') },
    { key: ReportReason.NUDITY, label: t('reports.reasons.nudity') },
    { key: ReportReason.COPYRIGHT, label: t('reports.reasons.copyright') },
    { key: ReportReason.MISINFORMATION, label: t('reports.reasons.misinformation') },
    { key: ReportReason.OTHER, label: t('reports.reasons.other') },
  ];

  const handleSubmit = () => {
    if (!selectedReason) {
      Alert.alert(t('reports.error'), t('reports.selectReason'));
      return;
    }

    createReportMutation.mutate({
      blinkID,
      reason: selectedReason,
      description: description.trim() || undefined,
    }, {
      onSuccess: () => {
        Alert.alert(t('reports.success'), t('reports.submitted'));
        handleClose();
      },
      onError: (error) => {
        Alert.alert(t('reports.error'), error.message);
      }
    });
  };

  const handleClose = () => {
    setSelectedReason(null);
    setDescription('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText variant="Title" style={styles.title}>
              {t('reports.reportBlink')}
            </ThemedText>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.text.replace('#', '')} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Raisons */}
            <ThemedText variant="SubTitle" style={styles.sectionTitle}>
              {t('reports.selectReason')}
            </ThemedText>
            
            {reportReasons.map((reason) => (
              <TouchableOpacity
                key={reason.key}
                style={[
                  styles.reasonOption,
                  { 
                    backgroundColor: selectedReason === reason.key ? colors.accent : colors.background,
                    borderColor: colors.border 
                  }
                ]}
                onPress={() => setSelectedReason(reason.key)}
              >
                <ThemedText 
                  style={[
                    styles.reasonText,
                    { color: selectedReason === reason.key ? colors.background : colors.text }
                  ]}
                >
                  {reason.label}
                </ThemedText>
              </TouchableOpacity>
            ))}

            {/* Description optionnelle */}
            <ThemedText variant="SubTitle" style={styles.sectionTitle}>
              {t('reports.additionalInfo')}
            </ThemedText>
            <ThemedTextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t('reports.descriptionPlaceholder')}
              multiline
              numberOfLines={4}
              style={styles.descriptionInput}
            />
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <ThemedButton
              title={t('common.cancel')}
              onPress={handleClose}
              variant="secondary"
              style={styles.actionButton}
            />
            <ThemedButton
              title={t('reports.submit')}
              onPress={handleSubmit}
              loading={createReportMutation.isPending}
              disabled={!selectedReason}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 12,
    marginTop: 8,
  },
  reasonOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 14,
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
