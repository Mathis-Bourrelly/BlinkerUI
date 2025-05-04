import React, { useState, useEffect } from "react";
import { StyleSheet, FlatList, TouchableOpacity, View, useWindowDimensions, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/base/ThemedText";
import NavBar from "@/components/feature/NavBar";
import TabBar from "@/components/feature/TabBar";
import { InnerContainer } from "@/components/base/InnerContainer";
import { useConversationsQuery, useUnreadMessagesQuery } from "@/hooks/interfaces/useMessageInterface";
import { ConversationPreviewType } from "@/types/MessagesType";
import { useFormatMessageDate } from "@/utils/dateUtils";
import { Icon } from "@/components/images/Icon";

export default function MessagesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const router = useRouter();
  const { formatMessageDate } = useFormatMessageDate();

  // Récupérer les conversations et les messages non lus
  const { data: conversationsData, isLoading, error } = useConversationsQuery();
  const { data: unreadMessages } = useUnreadMessagesQuery();

  // État local pour les conversations
  const [conversations, setConversations] = useState<ConversationPreviewType[]>([]);

  // Traiter les données de conversation de l'API
  useEffect(() => {
    if (conversationsData) {
      // Utiliser les données réelles de l'API
      setConversations(conversationsData);
    }
  }, [conversationsData, unreadMessages]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <InnerContainer>
          <NavBar />
          {!isDesktop && <TabBar />}
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        </InnerContainer>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <InnerContainer>
          <NavBar />
          {!isDesktop && <TabBar />}
          <View style={styles.errorContainer}>
            <ThemedText style={{ color: colors.danger }}>{t("base.error")}</ThemedText>
          </View>
        </InnerContainer>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <InnerContainer>
        <NavBar />
        {!isDesktop && <TabBar />}
        <ThemedText variant="Title" style={styles.title}>
          {t("messages.title")}
        </ThemedText>

        {conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText>{t("messages.noMessages")}</ThemedText>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.conversationID}
            showsVerticalScrollIndicator={true}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.card, { borderBottomColor: colors.border }]}
                onPress={() => {
                  // If we have a participant, navigate with both userID and conversationID
                  // Otherwise, just navigate with conversationID
                  if (item.participant) {
                    router.push({
                      pathname: "/messages/[userID]",
                      params: { userID: item.participant.userID, conversationID: item.conversationID },
                    });
                  } else {
                    router.push({
                      pathname: "/messages/[userID]",
                      params: { userID: "unknown", conversationID: item.conversationID },
                    });
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.conversationContainer}>
                  <Image
                    source={{ uri: item.participant?.avatar_url || `${process.env.EXPO_PUBLIC_API_URL}/uploads/default_user.png` }}
                    style={styles.avatar}
                  />

                  <View style={styles.messageContent}>
                    <View style={styles.row}>
                      <ThemedText style={styles.name}>{item.participant?.display_name || "User"}</ThemedText>
                      <ThemedText style={styles.date}>{formatMessageDate(item.lastMessage?.createdAt || new Date().toISOString())}</ThemedText>
                    </View>

                    <View style={styles.previewContainer}>
                      <ThemedText
                        style={[styles.preview, item.lastMessage && !item.lastMessage.read && styles.unreadText]}
                        numberOfLines={1}
                      >
                        {item.lastMessage?.content || t("messages.noMessages")}
                      </ThemedText>

                      {item.unreadCount > 0 && (
                        <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                          <ThemedText style={styles.badgeText}>{item.unreadCount}</ThemedText>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </InnerContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
  },
  title: {
    marginBottom: 16,
  },
  card: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    width: "100%",
  },
  conversationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: {
    fontWeight: "600",
    fontSize: 16,
  },
  date: {
    fontSize: 12,
    color: "#aaa",
  },
  previewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preview: {
    fontSize: 14,
    color: "#888",
    flex: 1,
  },
  unreadText: {
    fontWeight: 'bold',
    color: '#000',
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
