import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/base/ThemedText';
import { TagStatsCard } from './TagStatsCard';
import { usePopularTagsQuery, TagStats } from '@/hooks/interfaces/useTagInterface';

type TimeFilter = '24h' | '7d' | '30d' | 'all';

interface TrendingTagsListProps {
    variant?: 'popular';
}

export function TrendingTagsList({ variant = 'popular' }: TrendingTagsListProps) {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [selectedTimeFilter, setSelectedTimeFilter] = useState<TimeFilter>('all');

    // Hook pour récupérer les données populaires uniquement
    const {
        data: popularData,
        isLoading: isLoadingPopular,
        error: popularError
    } = usePopularTagsQuery(selectedTimeFilter, 20);

    const isLoading = isLoadingPopular;
    const error = popularError;

    // Fonction simplifiée pour obtenir les tags
    const getTags = (): TagStats[] => {
        return popularData?.data?.tags || [];
    };

    const tags = getTags();
    const timeFilters: TimeFilter[] = ['24h', '7d', '30d', 'all'];

    const renderTimeFilter = (filter: TimeFilter) => (
        <TouchableOpacity
            key={filter}
            style={[
                styles.filterButton,
                {
                    backgroundColor: selectedTimeFilter === filter
                        ? colors.accent
                        : colors.card,
                    borderColor: selectedTimeFilter === filter
                        ? colors.accent
                        : colors.border,
                }
            ]}
            onPress={() => setSelectedTimeFilter(filter)}
        >
            <ThemedText
                style={[
                    styles.filterText,
                    {
                        color: selectedTimeFilter === filter
                            ? '#FFFFFF'
                            : colors.text
                    }
                ]}
            >
                {t(`trends.timeFilters.${filter}`)}
            </ThemedText>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
                <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
                    {t('trends.title')}...
                </ThemedText>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <ThemedText style={[styles.errorText, { color: colors.danger }]}>
                    {t('trends.error')}
                </ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Titre de la section */}
            <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('trends.popularTags')}
                </ThemedText>
                <ThemedText style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                    {t(`trends.descriptions.${variant}`)}
                </ThemedText>
            </View>

            {/* Filtres temporels */}
            <View style={styles.filtersWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContent}
                >
                    {timeFilters.map(renderTimeFilter)}
                </ScrollView>
            </View>

            {/* Liste des tags */}
            <ScrollView
                style={styles.tagsContainer}
                showsVerticalScrollIndicator={false}
            >
                {tags.length > 0 ? (
                    tags.map((tag, index) => (
                        <TagStatsCard
                            key={tag.tagID}
                            tag={tag}
                            rank={index + 1}
                            showRecentUsage={false}
                        />
                    ))
                ) : (
                    <View style={styles.noDataContainer}>
                        <ThemedText style={[styles.noDataText, { color: colors.textSecondary }]}>
                            {t('trends.noData')}
                        </ThemedText>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    sectionHeader: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    sectionDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    filtersWrapper: {
        marginBottom: 16,
    },
    filtersContent: {
        paddingHorizontal: 16,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
        alignSelf: 'flex-start',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
    },
    tagsContainer: {
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
    noDataContainer: {
        padding: 32,
        alignItems: 'center',
    },
    noDataText: {
        fontSize: 16,
        textAlign: 'center',
    },
});