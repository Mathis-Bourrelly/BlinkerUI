import React, { useState, useEffect } from "react";
import { FlatList, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { InnerContainer } from "@/components/base/InnerContainer";
import TabBar from "@/components/feature/TabBar";
import { useConversationsQuery, useUnreadMessagesQuery } from "@/hooks/interfaces/useMessageInterface";
import { ConversationPreviewType } from "@/types/MessagesType";
import { LinearGradient } from "expo-linear-gradient";

// Composants de messages
import { LoadingState } from "@/components/feature/messages/LoadingState";
import { ErrorState } from "@/components/feature/messages/ErrorState";
import { EmptyState } from "@/components/feature/messages/EmptyState";
import { ConversationItem } from "@/components/feature/messages/ConversationItem";
import { MessagesHeader } from "@/components/feature/messages/MessagesHeader";
import { MessagesFooter } from "@/components/feature/messages/MessagesFooter";
import { messagesStyles } from "@/components/feature/messages/MessagesStyles";

export default function MessagesScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

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
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <>
      <Stack.Screen />
      <SafeAreaView style={messagesStyles.container}>
        <LinearGradient colors={colors.gradient} style={messagesStyles.background}>
          <InnerContainer>
            <MessagesHeader />

            {conversations.length === 0 ? (
              <EmptyState />
            ) : (
              <FlatList
                data={conversations}
                keyExtractor={(item) => item.conversationID}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={messagesStyles.listContainer}
                renderItem={({ item }) => <ConversationItem conversation={item} />}
              />
            )}

            <MessagesFooter />
          </InnerContainer>
        </LinearGradient>
        <TabBar />
      </SafeAreaView>
    </>
  );
}


