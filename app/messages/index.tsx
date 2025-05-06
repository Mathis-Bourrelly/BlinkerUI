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
import { useMessageContext } from "@/context/MessageContext";
import { useWebSocket } from "@/context/WebSocketContext";
import { ServerEvents } from "@/types/WebSocketTypes";

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
  const { setEnableConversationsQuery, setEnableUnreadMessagesQuery } = useMessageContext();

  // Activer les requêtes lorsque ce composant est monté
  useEffect(() => {
    setEnableConversationsQuery(true);
    setEnableUnreadMessagesQuery(true);

    // Désactiver les requêtes lorsque le composant est démonté
    return () => {
      setEnableConversationsQuery(false);
      setEnableUnreadMessagesQuery(false);
    };
  }, [setEnableConversationsQuery, setEnableUnreadMessagesQuery]);

  // Récupérer les conversations et les messages non lus
  const { data: conversationsData, isLoading, error } = useConversationsQuery();
  const { data: unreadMessages } = useUnreadMessagesQuery();

  // État local pour les conversations
  const [conversations, setConversations] = useState<ConversationPreviewType[]>([]);

  // Traiter les données de conversation de l'API
  useEffect(() => {
    if (conversationsData) {
      // Utiliser directement les données de l'API sans transformation
      setConversations(conversationsData);

      // Commentaire pour débogage si nécessaire
      // console.log('Conversations:', conversationsData);
    }
  }, [conversationsData]); // Retirer unreadMessages de la dépendance pour éviter les boucles

  // WebSocket integration for real-time updates
  const { isConnected, onNewMessage, onMessageNotification } = useWebSocket();

  // Listen for new messages via WebSocket
  useEffect(() => {
    if (!isConnected) return;

    // Handler for new messages
    const handleNewMessage = (message: any) => {
      console.log('WebSocket: New message received in conversations list', message);
      updateConversationWithNewMessage(message);
    };

    // Handler for message notifications
    const handleMessageNotification = (data: any) => {
      console.log('WebSocket: Message notification received in conversations list', data);
      if (data.message) {
        updateConversationWithNewMessage(data.message);
      }
    };

    // Helper function to update conversations with a new message
    const updateConversationWithNewMessage = (message: any) => {
      setConversations(prevConversations => {
        // Check if the conversation already exists
        const conversationIndex = prevConversations.findIndex(
          conv => conv.conversationID === message.conversationID
        );

        if (conversationIndex >= 0) {
          // Update existing conversation
          const updatedConversations = [...prevConversations];
          const conversation = updatedConversations[conversationIndex];

          // Update the conversation with the new message
          updatedConversations[conversationIndex] = {
            ...conversation,
            lastMessage: {
              content: message.content,
              createdAt: message.createdAt,
              read: false,
              isFromUser: false // Assume it's from another user if received via WebSocket
            },
            unreadCount: conversation.unreadCount + 1
          };

          // Move the updated conversation to the top
          updatedConversations.splice(conversationIndex, 1);
          updatedConversations.unshift(updatedConversations[conversationIndex]);

          return updatedConversations;
        }

        // If the conversation doesn't exist, we might need to fetch it
        // This would typically happen when receiving a message from a new conversation
        // For now, we'll just return the current state and let the next API poll update it
        return prevConversations;
      });
    };

    // Register event handlers
    const unsubscribeNewMessage = onNewMessage(handleNewMessage);
    const unsubscribeMessageNotification = onMessageNotification(handleMessageNotification);

    // Cleanup function
    return () => {
      unsubscribeNewMessage();
      unsubscribeMessageNotification();
    };
  }, [isConnected, onNewMessage, onMessageNotification]);

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


