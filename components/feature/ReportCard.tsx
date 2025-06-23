import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedButton } from '@/components/base/ThemedButton';
import { Icon } from '@/components/images/Icon';
import { ReportType, ReportStatus } from '@/types/ReportsType';

interface ReportCardProps {
  report: ReportType;
  onAction: (action: 'resolve' | 'dismiss' | 'delete') => void;
}

// Fonction pour formater la date de manière relative
const formatTimeAgo = (dateString: string, language: string = 'en'): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return language === 'fr' ? 'à l\'instant' : 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    if (language === 'fr') {
      return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    }
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    if (language === 'fr') {
      return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    }
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    if (language === 'fr') {
      return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (language === 'fr') {
    return `il y a ${diffInMonths} mois`;
  }
  return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
};

export function ReportCard({ report, onAction }: ReportCardProps) {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING:
        return colors.warning;
      case ReportStatus.RESOLVED:
        return colors.success;
      case ReportStatus.DISMISSED:
        return colors.textSecondary;
      default:
        return colors.text;
    }
  };

  const getReasonLabel = (reason: string) => {
    return t(`reports.reasons.${reason}`, reason);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* En-tête du report */}
      <View style={styles.header}>
        <View style={styles.reportInfo}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(report.status) }]} />
            <ThemedText variant="Caption" style={{ color: getStatusColor(report.status) }}>
              {t(`reports.status.${report.status}`)}
            </ThemedText>
          </View>
          <ThemedText variant="Caption" style={{ color: colors.textSecondary }}>
            {formatTimeAgo(report.createdAt, i18n.language)}
          </ThemedText>
        </View>
      </View>

      {/* Informations sur le rapporteur */}
      {report.reporter && (
        <View style={styles.reporterSection}>
          <ThemedText variant="Caption" style={{ color: colors.textSecondary }}>
            {t('reports.reportedBy')}
          </ThemedText>
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: report.reporter.avatar_url || `${process.env.EXPO_PUBLIC_API_URL}/uploads/default_user.png` }}
              style={styles.avatar}
            />
            <View>
              <ThemedText variant="Body">{report.reporter.display_name}</ThemedText>
              <ThemedText variant="Caption" style={{ color: colors.textSecondary }}>
                @{report.reporter.username}
              </ThemedText>
            </View>
          </View>
        </View>
      )}

      {/* Raison du report */}
      <View style={styles.reasonSection}>
        <ThemedText variant="BodyBold" style={{ color: colors.danger }}>
          {getReasonLabel(report.reason)}
        </ThemedText>
        {report.description && (
          <ThemedText variant="Body" style={styles.description}>
            {report.description}
          </ThemedText>
        )}
      </View>

      {/* Aperçu du blink signalé */}
      {report.blink && (
        <View style={[styles.blinkPreview, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.blinkHeader}>
            <Image 
              source={{ uri: report.blink.profile.avatar_url }}
              style={styles.avatar}
            />
            <View>
              <ThemedText variant="Body">{report.blink.profile.display_name}</ThemedText>
              <ThemedText variant="Caption" style={{ color: colors.textSecondary }}>
                @{report.blink.profile.username}
              </ThemedText>
            </View>
          </View>
          
          {/* Contenu du blink */}
          {report.blink.contents.map((content, index) => (
            <View key={content.contentID || index}>
              {content.contentType === 'text' && (
                <ThemedText variant="Body" style={styles.blinkContent} numberOfLines={3}>
                  {content.content}
                </ThemedText>
              )}
              {content.contentType === 'image' && (
                <Image 
                  source={{ uri: content.content }}
                  style={styles.blinkImage}
                  resizeMode="cover"
                />
              )}
            </View>
          ))}
        </View>
      )}

      {/* Actions (seulement si le report est en attente) */}
      {report.status === ReportStatus.PENDING && (
        <View style={styles.actions}>
          <ThemedButton
            title={t('reports.actions.dismiss')}
            onPress={() => onAction('dismiss')}
            variant="secondary"
            style={styles.actionButton}
          />
          <ThemedButton
            title={t('reports.actions.resolve')}
            onPress={() => onAction('resolve')}
            variant="primary"
            style={styles.actionButton}
          />
          <ThemedButton
            title={t('reports.actions.deleteBlink')}
            onPress={() => onAction('delete')}
            variant="danger"
            style={styles.actionButton}
          />
        </View>
      )}

      {/* Informations sur la révision */}
      {report.reviewedAt && report.reviewer && (
        <View style={styles.reviewInfo}>
          <ThemedText variant="Caption" style={{ color: colors.textSecondary }}>
            {t('reports.reviewedBy')} {report.reviewer.display_name} • {formatTimeAgo(report.reviewedAt, i18n.language)}
          </ThemedText>
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
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  reporterSection: {
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  reasonSection: {
    marginBottom: 12,
  },
  description: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  blinkPreview: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  blinkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  blinkContent: {
    marginTop: 4,
  },
  blinkImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  reviewInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});
