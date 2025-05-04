import React, { useState, useRef, useEffect } from "react";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/feature/NavBar";
import TabBar from "@/components/feature/TabBar";
import { InnerContainer } from "@/components/base/InnerContainer";
import { LinearGradient } from "expo-linear-gradient";
import {
  useMessagesBetweenQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
  useConversationMessagesQuery,
  useMarkConversationAsReadMutation
} from "@/hooks/interfaces/useMessageInterface";
import { useQueryClient } from "@tanstack/react-query";
import { MessageType } from "@/types/MessagesType";
import { useFormatMessageDate } from "@/utils/dateUtils";

// Composants de messages
import { MessageThreadLoadingState } from "@/components/feature/messages/MessageThreadLoadingState";
import { MessageThreadErrorState } from "@/components/feature/messages/MessageThreadErrorState";
import { ContactHeader } from "@/components/feature/messages/ContactHeader";
import { MessageInput } from "@/components/feature/messages/MessageInput";
import { MessageList } from "@/components/feature/messages/MessageList";
import { MessageThreadFooter } from "@/components/feature/messages/MessageThreadFooter";
import { messageThreadStyles } from "@/components/feature/messages/MessageThreadStyles";

export default function MessageThreadScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ userID: string; conversationID?: string }>();
  const userID = params.userID;
  const conversationID = params.conversationID;
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const { formatMessageDate, formatTimeRemaining } = useFormatMessageDate();

  // Récupérer les messages selon le mode (conversation ou entre utilisateurs)
  const {
    data: conversationData,
    isLoading: isLoadingConversation,
    error: errorConversation
  } = conversationID ? useConversationMessagesQuery(conversationID) : { data: null, isLoading: false, error: null };

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    error: errorMessages
  } = (!conversationID && userID !== "unknown") ? useMessagesBetweenQuery(userID as string) : { data: null, isLoading: false, error: null };

  // Mutations pour envoyer et marquer comme lus
  const sendMessageMutation = useSendMessageMutation();
  const markAsReadMutation = useMarkAsReadMutation();
  const markConversationAsReadMutation = useMarkConversationAsReadMutation();
  const queryClient = useQueryClient();

  // État local pour les messages
  const [messages, setMessages] = useState<MessageType[]>([]);

  // Informations de contact pour l'autre utilisateur
  const [contactInfo, setContactInfo] = useState({
    display_name: userID === "unknown" ? "Conversation" : "",
    username: userID === "unknown" ? "conversation" : "",
    avatar_url: `${process.env.EXPO_PUBLIC_API_URL}/uploads/default_user.png`,
    isOnline: false,
    score: 86400, // Valeur par défaut (24 heures)
  });

  // Mettre à jour les informations de contact si nous avons des données de conversation
  useEffect(() => {
    if (conversationData && conversationData.length > 0) {
      // Trouver un message de l'autre utilisateur pour obtenir son ID
      const otherUserMessage = conversationData.find(msg => msg.senderID !== "me");
      if (otherUserMessage && otherUserMessage.senderInfo) {
        // Mettre à jour les informations de contact avec les données réelles
        setContactInfo({
          display_name: otherUserMessage.senderInfo.display_name || "Utilisateur",
          username: otherUserMessage.senderInfo.username || "",
          avatar_url: otherUserMessage.senderInfo.avatar_url || `${process.env.EXPO_PUBLIC_API_URL}/uploads/default_user.png`,
          isOnline: false, // L'API ne fournit pas cette information pour l'instant
          score: otherUserMessage.senderInfo.score || 86400, // Utiliser le score de l'utilisateur ou la valeur par défaut
        });
      }
    }
  }, [conversationData]);

  // Traiter les données de messages de l'API
  useEffect(() => {
    if (conversationData) {
      // Utiliser les données réelles de l'API pour les conversations
      setMessages(conversationData);

      // Marquer les messages de la conversation comme lus
      if (conversationID) {
        markConversationAsReadMutation.mutate(conversationID);
      }
    } else if (messagesData) {
      // Utiliser les données réelles de l'API pour les messages entre utilisateurs
      setMessages(messagesData);

      // Marquer les messages comme lus (ancienne méthode)
      if (userID && userID !== "unknown") {
        markAsReadMutation.mutate(userID);
      }
    }
  }, [userID, conversationID, conversationData, messagesData]);

  // Défiler vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    // Préparer les données selon le mode (conversation ou entre utilisateurs)
    let messageData;
    if (conversationID) {
      // Si nous avons un ID de conversation, l'utiliser
      messageData = { conversationID, content: newMessage.trim() };
    } else if (userID !== "unknown") {
      // Si nous avons un ID utilisateur valide, l'utiliser
      messageData = { receiverID: userID as string, content: newMessage.trim() };
    } else {
      // Cas d'erreur - ne devrait pas arriver
      console.error("Cannot send message: no valid conversationID or userID");
      return;
    }

    // Envoyer le message via la mutation
    sendMessageMutation.mutate(
      messageData,
      {
        onSuccess: (data) => {
          // Si l'API renvoie le message créé, l'utiliser
          if (data && data.message) {
            setMessages([...messages, data.message]);
          } else {
            // Sinon, invalider les requêtes pour récupérer les messages mis à jour
            if (conversationID) {
              // Rafraîchir les messages de la conversation
              queryClient.invalidateQueries({ queryKey: ["messages", "conversation", conversationID] });
            } else if (userID !== "unknown") {
              // Rafraîchir les messages entre utilisateurs
              queryClient.invalidateQueries({ queryKey: ["messages", userID] });
            }
          }

          setNewMessage("");

          // Défiler vers le bas
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        },
        onError: (error) => {
          console.error("Failed to send message:", error);
        },
      }
    );
  };

  // Déterminer l'état de chargement et d'erreur global
  const isLoading = isLoadingConversation || isLoadingMessages;
  const error = errorConversation || errorMessages;
  const gradientColors = colors.gradient;

  if (isLoading) {
    return <MessageThreadLoadingState />;
  }

  if (error) {
    return <MessageThreadErrorState />;
  }

  return (
    <>
      <Stack.Screen />
      <SafeAreaView style={messageThreadStyles.container}>
        <LinearGradient colors={gradientColors} style={messageThreadStyles.background}>
          <InnerContainer>
            <NavBar />

            <ContactHeader contactInfo={contactInfo} />

            <MessageList
              ref={flatListRef}
              messages={messages}
              formatMessageDate={formatMessageDate}
              formatTimeRemaining={formatTimeRemaining}
            />

            <MessageInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleSend={handleSend}
              isPending={sendMessageMutation.isPending}
            />

            <MessageThreadFooter />
          </InnerContainer>
        </LinearGradient>
        <TabBar />
      </SafeAreaView>
    </>
  );
}


