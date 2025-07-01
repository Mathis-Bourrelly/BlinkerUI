import React, { useState, useRef } from 'react';
import { FlatList, ActivityIndicator, StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { CommentCard } from './CommentCard';
import { CommentInput } from './CommentInput';
import { useCommentsQuery } from '@/hooks/interfaces/useCommentInterface';
import { CommentType } from '@/types/CommentsType';
import { ThemedText } from '../base/ThemedText';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/images/Icon';
import { LinearGradient } from 'expo-linear-gradient';

interface CommentListProps {
  blinkID: string;
  showInput?: boolean;
}

export function CommentList({ blinkID, showInput = true }: CommentListProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useCommentsQuery(blinkID);

  // Debug: Log the data structure to understand what we're receiving
  console.log('Comments query data:', data);

  const comments = data?.pages?.flatMap(page => {
    console.log('Processing page:', page);
    // Handle different possible response structures
    let rawComments = [];
    if (page?.data?.data) {
      rawComments = page.data.data;
    } else if (page?.data && Array.isArray(page.data)) {
      rawComments = page.data;
    } else if (Array.isArray(page)) {
      rawComments = page;
    }

    // Transform API response to match CommentType interface
    return rawComments.map((comment: any) => {
      // Check if comment has the API structure (user.Profile) and transform it
      if (comment.user && comment.user.Profile) {
        // Construct full avatar URL
        const avatarUrl = comment.user.Profile.avatar_url
          ? `${process.env.EXPO_PUBLIC_API_URL}/uploads/${comment.user.Profile.avatar_url}`
          : `${process.env.EXPO_PUBLIC_API_URL}/uploads/default_user.png`;

        return {
          ...comment,
          profile: {
            userID: comment.user.userID,
            username: comment.user.Profile.username,
            display_name: comment.user.Profile.display_name,
            avatar_url: avatarUrl,
            score: 86400 // Default score (24 hours in seconds) since API doesn't provide it
          }
        };
      }
      // If comment already has the correct structure, return as is
      return comment;
    });
  }).filter(Boolean) || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleCommentCreated = () => {
    refetch();
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowScrollToTop(offsetY > 300);
      }
    }
  );

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const renderComment = ({ item }: { item: CommentType }) => (
    <CommentCard 
      comment={item}
      onEdit={(commentID, newContent) => {
        // Optionally handle local state update
        refetch();
      }}
      onDelete={(commentID) => {
        // Optionally handle local state update
        refetch();
      }}
    />
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.accent} />
        <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t('comment.loadingMore')}
        </ThemedText>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Icon name="comments--v1" size={48} color={colors.textSecondary} />
        <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
          {t('comment.noComments')}
        </ThemedText>
        <ThemedText style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          {t('comment.beFirst')}
        </ThemedText>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t('comment.loading')}
        </ThemedText>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={48} color={colors.danger} />
        <ThemedText style={[styles.errorTitle, { color: colors.danger }]}>
          {t('comment.loadError')}
        </ThemedText>
        <ThemedText style={[styles.errorSubtitle, { color: colors.textSecondary }]}>
          {error?.message || t('comment.tryAgain')}
        </ThemedText>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.accent }]}
          onPress={() => refetch()}
        >
          <ThemedText style={[styles.retryButtonText, { color: colors.color }]}>
            {t('common.retry')}
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Input de commentaire en haut */}
      {showInput && (
        <CommentInput 
          blinkID={blinkID} 
          onCommentCreated={handleCommentCreated}
        />
      )}

      {/* Liste des commentaires */}
      <FlatList
        ref={flatListRef}
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item, index) => {
          // Safety check to prevent undefined errors
          if (!item || !item.commentID) {
            console.warn('Invalid comment item:', item, 'at index:', index);
            return `comment-${index}`;
          }
          return item.commentID;
        }}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.listContent,
          comments.length === 0 && styles.emptyListContent
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Bouton scroll to top */}
      {showScrollToTop && (
        <TouchableOpacity style={styles.scrollToTopContainer} onPress={scrollToTop}>
          <LinearGradient
            colors={[colors.accent, colors.accent]}
            style={styles.scrollToTopButton}
          >
            <Icon name="arrow-up" size={20} color={colors.color} />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  scrollToTopContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  scrollToTopButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
