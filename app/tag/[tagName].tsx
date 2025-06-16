import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/context/UserContext';
import { InnerContainer } from '@/components/base/InnerContainer';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedButtonIcon } from '@/components/base/ThemedButtonIcon';
import NavBar from '@/components/feature/NavBar';
import TabBar from '@/components/feature/TabBar';
import { TagChip } from '@/components/feature/TagChip';
import { BlinkCard } from '@/components/feature/BlinkCard';
import CreateBlinkModal from '@/components/feature/CreateBlinkModal';
import { useBlinksByTagQuery } from '@/hooks/interfaces/useTagInterface';
import { BlinkType } from '@/types/BlinksType';

export default function TagPage() {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { user } = useUser();
    const { tagName } = useLocalSearchParams<{ tagName: string }>();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [blinks, setBlinks] = useState<BlinkType[]>([]);

    const gradientColors = colors.gradient;
    const decodedTagName = tagName ? decodeURIComponent(tagName) : '';

    const {
        data: tagData,
        isLoading,
        error,
        refetch,
        isFetching
    } = useBlinksByTagQuery(decodedTagName, page);

    useEffect(() => {
        if (tagData?.data?.data) {
            // Si nous avons des données et que c'est la première page, remplacer les blinks
            // Sinon, ajouter aux blinks existants
            setBlinks(prev =>
                page === 1
                    ? tagData.data.data || []
                    : [...prev, ...(tagData.data.data || [])]
            );
        }
    }, [tagData, page]);

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const handleGoBack = () => {
        router.back();
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setPage(1);
        await refetch();
        setRefreshing(false);
    };

    const handleLoadMore = () => {
        if (tagData?.data?.totalPages && page < tagData.data.totalPages) {
            setPage(prev => prev + 1);
        }
    };

    // Redirection si l'utilisateur n'est pas connecté
    if (!user) {
        return null;
    }

    if (!decodedTagName) {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={gradientColors} style={styles.background}>
                    <InnerContainer>
                        <NavBar />
                        <View style={styles.errorContainer}>
                            <ThemedText style={[styles.errorText, { color: colors.danger }]}>
                                {t('base.error')}
                            </ThemedText>
                        </View>
                    </InnerContainer>
                </LinearGradient>
                <TabBar onCreatePress={handleOpenModal} />
            </SafeAreaView>
        );
    }

    const renderBlink = ({ item }: { item: BlinkType }) => (
        <BlinkCard 
            blink={item} 
            onExpire={(blinkID) => {
                // Supprimer le blink expiré de la liste
                setBlinks(prev => prev.filter(b => b.blinkID !== blinkID));
            }} 
        />
    );

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.headerTop}>
                <ThemedButtonIcon
                    iconName="arrow-left"
                    onPress={handleGoBack}
                    style={styles.backButton}
                />
                <View style={styles.tagContainer}>
                    <TagChip 
                        tag={decodedTagName} 
                        size="medium"
                        style={styles.mainTag}
                    />
                </View>
            </View>
            
            {tagData?.data?.total > 0 && (
                <ThemedText style={[styles.statsText, { color: colors.textSecondary }]}>
                    {t('trends.stats.usageCount', { count: tagData.data.total })}
                </ThemedText>
            )}
        </View>
    );

    const renderFooter = () => {
        if (!isLoading && !isFetching) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.accent} />
            </View>
        );
    };

    const renderEmpty = () => {
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
                    <ThemedText style={[styles.errorDetails, { color: colors.textSecondary }]}>
                        {error?.message || 'Erreur API'}
                    </ThemedText>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                    {t('trends.noData')}
                </ThemedText>
            </View>
        );
    };

    return (
        <>
            <Stack.Screen 
                options={{
                    title: `#${decodedTagName}`,
                    headerShown: false,
                }}
            />
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={gradientColors} style={styles.background}>
                    <InnerContainer>
                        <NavBar />
                        
                        <FlatList
                            data={blinks}
                            renderItem={renderBlink}
                            keyExtractor={(item) => item.blinkID}
                            ListHeaderComponent={renderHeader}
                            ListFooterComponent={renderFooter}
                            ListEmptyComponent={renderEmpty}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.1}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={handleRefresh}
                                    tintColor={colors.accent}
                                />
                            }
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                        />
                    </InnerContainer>
                </LinearGradient>

                <CreateBlinkModal
                    visible={isModalVisible}
                    onClose={handleCloseModal}
                />

                <TabBar onCreatePress={handleOpenModal} />
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
    headerContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 16,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    backButton: {
        marginRight: 16,
    },
    tagContainer: {
        flex: 1,
        alignItems: 'center',
    },
    mainTag: {
        marginRight: 0,
    },
    statsText: {
        textAlign: 'center',
        fontSize: 14,
    },
    listContent: {
        flexGrow: 1,
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
        marginBottom: 8,
    },
    errorDetails: {
        fontSize: 12,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    footerLoader: {
        padding: 16,
        alignItems: 'center',
    },
});
