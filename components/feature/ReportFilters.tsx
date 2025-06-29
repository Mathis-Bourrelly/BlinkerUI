import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/base/ThemedText';
import { ReportStatus, ReportReason } from '@/types/ReportsType';

interface ReportFiltersProps {
  filters: {
    status?: ReportStatus;
    reason?: string;
  };
  onFiltersChange: (filters: { status?: ReportStatus; reason?: string }) => void;
}

export function ReportFilters({ filters, onFiltersChange }: ReportFiltersProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const statusOptions = [
    { value: undefined, label: t('reports.filters.allStatuses') },
    { value: ReportStatus.PENDING, label: t('reports.status.pending') },
    { value: ReportStatus.REVIEWED, label: t('reports.status.reviewed') },
    { value: ReportStatus.REJECTED, label: t('reports.status.rejected') },
    { value: ReportStatus.ACTION_TAKEN, label: t('reports.status.action_taken') },
  ];

  const reasonOptions = [
    { value: undefined, label: t('reports.filters.allReasons') },
    { value: ReportReason.INAPPROPRIATE, label: t('reports.reasons.inappropriate') },
    { value: ReportReason.SPAM, label: t('reports.reasons.spam') },
    { value: ReportReason.HARASSMENT, label: t('reports.reasons.harassment') },
    { value: ReportReason.VIOLENCE, label: t('reports.reasons.violence') },
    { value: ReportReason.OTHER, label: t('reports.reasons.other') },
  ];

  const handleStatusChange = (status?: ReportStatus) => {
    onFiltersChange({ ...filters, status });
  };

  const handleReasonChange = (reason?: string) => {
    onFiltersChange({ ...filters, reason });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText variant="SubTitle" style={styles.title}>
        {t('reports.filters.title')}
      </ThemedText>

      {/* Filtres par statut */}
      <View style={styles.filterSection}>
        <ThemedText variant="BodyBold" style={styles.filterLabel}>
          {t('reports.filters.status')}
        </ThemedText>
        <View style={styles.filterOptions}>
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option.value || 'all'}
              style={[
                styles.filterOption,
                {
                  backgroundColor: filters.status === option.value ? colors.accent : colors.background,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => handleStatusChange(option.value)}
            >
              <ThemedText
                variant="Caption"
                style={{
                  color: filters.status === option.value ? colors.background : colors.text
                }}
              >
                {option.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Filtres par raison */}
      <View style={styles.filterSection}>
        <ThemedText variant="BodyBold" style={styles.filterLabel}>
          {t('reports.filters.reason')}
        </ThemedText>
        <View style={styles.filterOptions}>
          {reasonOptions.map((option) => (
            <TouchableOpacity
              key={option.value || 'all'}
              style={[
                styles.filterOption,
                {
                  backgroundColor: filters.reason === option.value ? colors.accent : colors.background,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => handleReasonChange(option.value)}
            >
              <ThemedText
                variant="Caption"
                style={{
                  color: filters.reason === option.value ? colors.background : colors.text
                }}
              >
                {option.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bouton pour réinitialiser les filtres */}
      <TouchableOpacity
        style={[styles.resetButton, { borderColor: colors.border }]}
        onPress={() => onFiltersChange({})}
      >
        <ThemedText variant="Body" style={{ color: colors.accent }}>
          {t('reports.filters.reset')}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 12,
  },
  title: {
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  resetButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
});
