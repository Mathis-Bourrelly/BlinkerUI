import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/base/ThemedText';
import { Icon } from '@/components/images/Icon';
import { ReportReason } from '@/types/ReportsType';

interface ReportStatsData {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  dismissedReports: number;
  reportsByReason: Record<ReportReason, number>;
}

interface ReportStatsProps {
  stats: ReportStatsData;
}

export function ReportStats({ stats }: ReportStatsProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const statCards = [
    {
      title: t('reports.stats.total'),
      value: stats.totalReports,
      icon: 'flag',
      color: colors.text,
    },
    {
      title: t('reports.stats.pending'),
      value: stats.pendingReports,
      icon: 'clock',
      color: colors.warning,
    },
    {
      title: t('reports.stats.resolved'),
      value: stats.resolvedReports,
      icon: 'checkmark',
      color: colors.success,
    },
    {
      title: t('reports.stats.dismissed'),
      value: stats.dismissedReports,
      icon: 'close',
      color: colors.textSecondary,
    },
  ];

  const topReasons = Object.entries(stats.reportsByReason)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .filter(([, count]) => count > 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText variant="SubTitle" style={styles.title}>
        {t('reports.stats.title')}
      </ThemedText>

      {/* Statistiques principales */}
      <View style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <View 
            key={index}
            style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}
          >
            <View style={styles.statHeader}>
              <Icon name={stat.icon} size={20} color={stat.color.replace('#', '')} />
              <ThemedText variant="BodyBold" style={{ color: stat.color }}>
                {stat.value}
              </ThemedText>
            </View>
            <ThemedText variant="Caption" style={{ color: colors.textSecondary }}>
              {stat.title}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Top des raisons */}
      {topReasons.length > 0 && (
        <View style={styles.reasonsSection}>
          <ThemedText variant="BodyBold" style={styles.reasonsTitle}>
            {t('reports.stats.topReasons')}
          </ThemedText>
          {topReasons.map(([reason, count]) => (
            <View key={reason} style={styles.reasonItem}>
              <ThemedText variant="Body" style={styles.reasonLabel}>
                {t(`reports.reasons.${reason}`)}
              </ThemedText>
              <View style={styles.reasonCount}>
                <ThemedText variant="BodyBold" style={{ color: colors.accent }}>
                  {count}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      )}
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  reasonsSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  reasonsTitle: {
    marginBottom: 12,
  },
  reasonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  reasonLabel: {
    flex: 1,
  },
  reasonCount: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
});
