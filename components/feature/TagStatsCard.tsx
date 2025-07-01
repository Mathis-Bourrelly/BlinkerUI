import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/base/ThemedText';
import { TagChip } from './TagChip';
import { TagStats } from '@/hooks/interfaces/useTagInterface';
import { router } from 'expo-router';

interface TagStatsCardProps {
    tag: TagStats;
    rank?: number;
    showRecentUsage?: boolean;
}

export function TagStatsCard({ tag, rank, showRecentUsage = false }: TagStatsCardProps) {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const handleTagPress = () => {
        // Navigate to blinks by tag page
        router.push(`/tag/${encodeURIComponent(tag.name)}`);
    };

    const handleViewBlinks = () => {
        router.push(`/tag/${encodeURIComponent(tag.name)}`);
    };

    return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.header}>
                {rank && (
                    <View style={[styles.rankBadge, { backgroundColor: colors.accent + '20' }]}>
                        <ThemedText style={[styles.rankText, { color: colors.accent }]}>
                            #{rank}
                        </ThemedText>
                    </View>
                )}
                <TagChip 
                    tag={tag} 
                    variant="clickable" 
                    onPress={handleTagPress}
                    style={styles.tagChip}
                />
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <ThemedText style={[styles.statValue, { color: colors.text }]}>
                        {tag.usageCount}
                    </ThemedText>
                    <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                        {t('trends.stats.usageCount', { count: tag.usageCount })}
                    </ThemedText>
                </View>

                {showRecentUsage && (
                    <View style={styles.statItem}>
                        <ThemedText style={[styles.statValue, { color: colors.accent }]}>
                            {tag.recentUsage || 0}
                        </ThemedText>
                        <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                            {t('trends.stats.recentUsage', { count: tag.recentUsage || 0 })}
                        </ThemedText>
                    </View>
                )}
            </View>

            <TouchableOpacity 
                style={[styles.viewButton, { backgroundColor: colors.accent + '10', borderColor: colors.accent + '30' }]}
                onPress={handleViewBlinks}
            >
                <ThemedText style={[styles.viewButtonText, { color: colors.accent }]}>
                    {t('trends.stats.viewBlinks')}
                </ThemedText>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    rankBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 12,
    },
    rankText: {
        fontSize: 14,
        fontWeight: '600',
    },
    tagChip: {
        flex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    viewButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    viewButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
