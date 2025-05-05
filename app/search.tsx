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
import { UserSearchItem } from "@/components/feature/UserSearchItem";
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
      console.log('Setting debounced query:', searchQuery);
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
    error,
    isError
  } = useUserSearchQuery(debouncedQuery);

  // Log error for debugging
  useEffect(() => {
    if (isError && error) {
      console.error('Search error:', error);
    }
  }, [isError, error]);

  // Update search results when data changes
  useEffect(() => {
    if (data?.pages) {
      try {
        const allResults = data.pages.flatMap(page => {
          // Check if page.users exists and is an array
          if (page && page.users && Array.isArray(page.users)) {
            console.log(`Processing ${page.users.length} search results`);
            return page.users;
          }
          console.warn('Invalid page data structure:', page);
          return [];
        });
        // Filter out any undefined or null items
        const filteredResults = allResults.filter(Boolean);
        console.log(`Setting ${filteredResults.length} search results`);
        setSearchResults(filteredResults);
      } catch (err) {
        console.error('Error processing search results:', err);
        setSearchResults([]);
      }
    } else {
      // Reset results if no data
      console.log('No search data available, resetting results');
      setSearchResults([]);
    }
  }, [data]);

  // Render user item function - Safe to use with FlatList
  const renderUserItem = ({ item }: { item: UserSearchResult | undefined }) => {
    console.log('Rendering item:', item);
    // Skip rendering if item is undefined or is the current user
    if (!item || item.userID === user?.userID) return null;

    // Use our separate component that can safely use hooks
    return <UserSearchItem user={item} />;
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

            {/* Loading state */}
            {isLoading && debouncedQuery.length > 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
              </View>
            ) : isError ? (
              /* Error state */
              <View style={styles.messageContainer}>
                <ThemedText variant="Body">{t('search.error', 'Une erreur est survenue')}</ThemedText>
                {error && <ThemedText variant="Caption" style={{color: colors.danger}}>{error.toString()}</ThemedText>}
              </View>
            ) : searchResults.length === 0 && debouncedQuery.length > 0 ? (
              /* No results state */
              <View style={styles.messageContainer}>
                <ThemedText variant="Body">{t('search.noResults', 'Aucun résultat trouvé')}</ThemedText>
              </View>
            ) : debouncedQuery.length === 0 ? (
              /* Empty query state */
              <View style={styles.messageContainer}>
                <ThemedText variant="Body">{t('search.enterQuery', 'Entrez un terme de recherche')}</ThemedText>
              </View>
            ) : (
              /* Results state - Debug */
              <>
              {console.log('Rendering FlatList with', searchResults.length, 'results')}
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item?.userID || 'unknown'}
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
              </>
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
