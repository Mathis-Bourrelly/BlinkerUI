import React, { useState } from 'react';
import { View, FlatList, StyleSheet, useWindowDimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/base/ThemedText';
import { InnerContainer } from '@/components/base/InnerContainer';
import NavBar from '@/components/feature/NavBar';
import TabBar from '@/components/feature/TabBar';
import { useCanModerate } from '@/hooks/useUserRole';
import { 
  useReportsQuery, 
  useUpdateReportMutation, 
  useDeleteReportedBlinkMutation,
  useReportStatsQuery 
} from '@/hooks/interfaces/useReportInterface';
import { ReportType, ReportStatus } from '@/types/ReportsType';
import { ReportCard } from '@/components/feature/ReportCard';
import { ReportFilters } from '@/components/feature/ReportFilters';
import { ReportStats } from '@/components/feature/ReportStats';

export default function AdminReportsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { canModerate, isLoading: roleLoading } = useCanModerate();

  // Debug log pour vérifier les permissions
  console.log('🔒 Admin Reports Access:', { canModerate, roleLoading });
  
  const [filters, setFilters] = useState<{
    status?: ReportStatus;
    reason?: string;
  }>({});

  // Requêtes
  const { 
    data: reportsData, 
    isLoading: reportsLoading, 
    error: reportsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useReportsQuery(filters);

  const { data: statsData } = useReportStatsQuery();
  const deleteBlinkMutation = useDeleteReportedBlinkMutation();

  // Vérification des permissions
  if (roleLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={colors.gradient} style={styles.background}>
          <InnerContainer>
            <NavBar />
            <View style={styles.loadingContainer}>
              <ThemedText>{t('common.loading')}</ThemedText>
            </View>
          </InnerContainer>
        </LinearGradient>
        <TabBar />
      </SafeAreaView>
    );
  }

  if (!canModerate) {
    // Rediriger vers la page d'accueil après 2 secondes
    setTimeout(() => {
      router.push('/');
    }, 2000);

    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={colors.gradient} style={styles.background}>
          <InnerContainer>
            <NavBar />
            <View style={styles.errorContainer}>
              <ThemedText style={{ color: colors.danger, textAlign: 'center' }}>
                {t('admin.accessDenied')}
              </ThemedText>
              <ThemedText style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
                {t('admin.redirecting')}
              </ThemedText>
            </View>
          </InnerContainer>
        </LinearGradient>
        <TabBar />
      </SafeAreaView>
    );
  }

  // Aplatir les données paginées
  const reports = reportsData?.pages.flatMap(page => page.data.data) || [];

  const handleReportAction = async (reportID: string, action: 'review' | 'reject' | 'delete') => {
    try {
      if (action === 'delete') {
        const report = reports.find(r => r.reportID === reportID);
        if (!report) return;

        Alert.alert(
          t('admin.confirmDelete'),
          t('admin.confirmDeleteMessage'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('common.delete'),
              style: 'destructive',
              onPress: async () => {
                await deleteBlinkMutation.mutateAsync({
                  blinkID: report.blinkID
                });
              }
            }
          ]
        );
      } else {
        // Pour l'instant, on va juste logger l'action
        // TODO: Implémenter la mise à jour du statut
        console.log(`Action ${action} sur le report ${reportID}`);
        Alert.alert(t('common.success'), `Action ${action} effectuée`);
      }
    } catch (error) {
      Alert.alert(t('common.error'), error instanceof Error ? error.message : t('common.unknownError'));
    }
  };

  const renderReport = ({ item }: { item: ReportType }) => (
    <ReportCard
      report={item}
      onAction={(action) => handleReportAction(item.reportID, action)}
    />
  );

  return (
    <>
      <Stack.Screen options={{ title: t('admin.reports') }} />
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={colors.gradient} style={styles.background}>
          <InnerContainer>
            <NavBar />
            
            <ThemedText variant="Title" style={styles.title}>
              {t('admin.reportsManagement')}
            </ThemedText>

            {/* Statistiques */}
            {statsData && (
              <ReportStats stats={statsData.data} />
            )}

            {/* Filtres */}
            <ReportFilters
              filters={filters}
              onFiltersChange={setFilters}
            />

            {/* Liste des reports */}
            {reportsLoading ? (
              <View style={styles.loadingContainer}>
                <ThemedText>{t('common.loading')}</ThemedText>
              </View>
            ) : reportsError ? (
              <View style={styles.errorContainer}>
                <ThemedText style={{ color: colors.danger }}>
                  {t('common.error')}
                </ThemedText>
              </View>
            ) : (
              <FlatList
                data={reports}
                renderItem={renderReport}
                keyExtractor={(item) => item.reportID}
                contentContainerStyle={styles.listContainer}
                onEndReached={() => {
                  if (hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                  }
                }}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <ThemedText>{t('admin.noReports')}</ThemedText>
                  </View>
                }
              />
            )}
          </InnerContainer>
        </LinearGradient>
        <TabBar />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
});
