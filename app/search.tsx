import React, { useState, useEffect } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator, TouchableOpacity, Image, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { Row } from "@/components/base/Row";
import { LanguageDropdown } from "@/components/base/LanguageDropdown";
import { ThemeToggleButton } from "@/components/base/ThemeToggleButton";
import TabBar from "@/components/feature/TabBar";
import NavBar from "@/components/feature/NavBar";
import { InnerContainer } from "@/components/base/InnerContainer";
import { ThemedText } from "@/components/base/ThemedText";
import { useUser } from "@/context/UserContext";
import { useUserSearchQuery, UserSearchResult } from "@/hooks/interfaces/useUserInterface";
import { ScoreDot } from "@/components/feature/ScoreDot";
import { useFormatUserScore } from "@/utils/scoreUtils";
import { useFollowMutation, useUnfollowMutation, useIsFollowingQuery } from "@/hooks/interfaces/useFollowInterface";
import { Icon } from "@/components/images/Icon";

export default function SearchScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const { formatScore } = useFormatUserScore();
  
  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Fetch search results when debounced query changes
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading, 
    error 
  } = useUserSearchQuery(debouncedQuery);
  
  // Update search results when data changes
  useEffect(() => {
    if (data?.pages) {
      const allResults = data.pages.flatMap(page => page.data);
      setSearchResults(allResults);
    }
  }, [data]);
  
  // Follow/unfollow mutations
  const followMutation = useFollowMutation();
  const unfollowMutation = useUnfollowMutation();
  
  // Render user item
  const renderUserItem = ({ item }: { item: UserSearchResult }) => {
    // Skip rendering the current user
    if (item.userID === user?.userID) return null;
    
    // Check if current user is following this user
    const { data: isFollowing } = useIsFollowingQuery(item.userID, user?.userID || undefined);
    
    const handleFollowToggle = () => {
      if (isFollowing) {
        unfollowMutation.mutate(item.userID);
      } else {
        followMutation.mutate(item.userID);
      }
    };
    
    const handleUserPress = () => {
      router.push(`/profile/${item.userID}`);
    };
    
    const handleMessagePress = () => {
      router.push(`/messages/${item.userID}`);
    };
    
    return (
      <TouchableOpacity 
        style={[styles.userItem, { backgroundColor: colors.card }]}
        onPress={handleUserPress}
      >
        <View style={styles.userInfo}>
          <Image 
            source={{ uri: item.avatar_url || `${process.env.EXPO_PUBLIC_API_URL}/uploads/default_user.png` }}
            style={[styles.avatar, { borderColor: colors.text }]}
          />
          <View style={styles.userDetails}>
            <ThemedText variant="Subtitle">{item.display_name}</ThemedText>
            <Row style={styles.usernameRow}>
              <ThemedText variant="Body">@{item.username}</ThemedText>
              <ScoreDot score={item.score} showText />
            </Row>
            {item.bio && (
              <ThemedText variant="Caption" numberOfLines={1} style={styles.bio}>
                {item.bio}
              </ThemedText>
            )}
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              { 
                backgroundColor: colors.background,
                borderColor: colors.border
              }
            ]}
            onPress={handleMessagePress}
          >
            <Icon name="chat" size={20} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              { 
                backgroundColor: isFollowing ? colors.accent : colors.background,
                borderColor: colors.border
              }
            ]}
            onPress={handleFollowToggle}
          >
            <ThemedText 
              variant="Caption" 
              style={{ color: isFollowing ? "#FFFFFF" : colors.text }}
            >
              {isFollowing ? t('profile.following') : t('profile.follow')}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <>
      <Stack.Screen />
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={colors.gradient} style={styles.background}>
          <InnerContainer>
            <NavBar />
            <ThemedText variant="Title" style={styles.title}>
              {t('search.title', 'Rechercher des utilisateurs')}
            </ThemedText>
            
            <View style={[styles.searchInputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Icon name="search" size={24} color={colors.text} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder={t('search.placeholder', 'Rechercher par nom ou @username')}
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Icon name="cancel" size={24} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>
            
            {isLoading && debouncedQuery.length > 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
              </View>
            ) : error ? (
              <View style={styles.messageContainer}>
                <ThemedText variant="Body">{t('search.error', 'Une erreur est survenue')}</ThemedText>
              </View>
            ) : searchResults.length === 0 && debouncedQuery.length > 0 ? (
              <View style={styles.messageContainer}>
                <ThemedText variant="Body">{t('search.noResults', 'Aucun résultat trouvé')}</ThemedText>
              </View>
            ) : debouncedQuery.length === 0 ? (
              <View style={styles.messageContainer}>
                <ThemedText variant="Body">{t('search.enterQuery', 'Entrez un terme de recherche')}</ThemedText>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.userID}
                renderItem={renderUserItem}
                contentContainerStyle={styles.listContainer}
                onEndReached={() => {
                  if (hasNextPage) {
                    fetchNextPage();
                  }
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  isFetchingNextPage ? (
                    <ActivityIndicator size="small" color={colors.accent} style={styles.loadingMore} />
                  ) : null
                }
              />
            )}
            
            <Row gap={12} style={styles.footer}>
              <LanguageDropdown />
              <ThemeToggleButton />
            </Row>
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
    justifyContent: 'center',
  },
  background: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    fontSize: 16,
  },
  listContainer: {
    width: '100%',
    paddingBottom: 16,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  usernameRow: {
    alignItems: 'center',
    marginTop: 2,
  },
  bio: {
    marginTop: 4,
    opacity: 0.8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMore: {
    marginVertical: 16,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: 16,
  },
});
