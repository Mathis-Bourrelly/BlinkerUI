import React, { useState, useRef, useEffect, useCallback } from "react";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter, usePathname } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useUser } from "@/context/UserContext";
import { useMessageContext } from "@/context/MessageContext";
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
import { useUserProfileQuery } from "@/hooks/interfaces/useProfileInterface";
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
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const { setEnableConversationsQuery, setEnableUnreadMessagesQuery } = useMessageContext();
  const params = useLocalSearchParams<{ userID: string; conversationID?: string }>();
  const userID = params.userID;
  const conversationID = params.conversationID;
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const { formatMessageDate, formatTimeRemaining } = useFormatMessageDate();

  // Désactiver les requêtes inutiles sur cette page
  useEffect(() => {
    // S'assurer que les requêtes sont désactivées lorsque ce composant est monté
    setEnableConversationsQuery(false);
    setEnableUnreadMessagesQuery(false);

    // Pas besoin de cleanup car nous voulons que les requêtes restent désactivées
    // jusqu'à ce qu'un autre composant les active explicitement
  }, [setEnableConversationsQuery, setEnableUnreadMessagesQuery]);

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

  // Récupérer les informations de profil de l'utilisateur si nous avons un userID valide
  const {
    data: profileData,
    isLoading: isLoadingProfile
  } = (userID !== "unknown") ? useUserProfileQuery(userID as string) : { data: null, isLoading: false };

  // Mutations pour envoyer et marquer comme lus
  const sendMessageMutation = useSendMessageMutation();
  const markAsReadMutation = useMarkAsReadMutation();
  const markConversationAsReadMutation = useMarkConversationAsReadMutation();
  const queryClient = useQueryClient();

  // État local pour les messages
  const [messages, setMessages] = useState<MessageType[]>([]);

  // Utiliser une référence pour suivre si les messages ont déjà été marqués comme lus
  // Une référence ne déclenche pas de rendu lorsqu'elle est mise à jour
  const messagesMarkedAsReadRef = useRef<{[key: string]: boolean}>({});

  // Fonction pour marquer les messages comme lus
  const markMessagesAsRead = useCallback(() => {
    const key = conversationID || userID;

    // Ne rien faire si les messages ont déjà été marqués comme lus
    if (key && messagesMarkedAsReadRef.current[key]) {
      return;
    }

    // Marquer les messages comme lus selon le mode (conversation ou entre utilisateurs)
    if (conversationID) {
      markConversationAsReadMutation.mutate(conversationID, {
        onSuccess: () => {
          // Marquer comme déjà lu pour éviter les appels répétés
          messagesMarkedAsReadRef.current[conversationID] = true;
        }
      });
    } else if (userID && userID !== "unknown") {
      markAsReadMutation.mutate(userID, {
        onSuccess: () => {
          // Marquer comme déjà lu pour éviter les appels répétés
          messagesMarkedAsReadRef.current[userID] = true;
        }
      });
    }
  }, [conversationID, userID, markConversationAsReadMutation, markAsReadMutation]);

  // Informations de contact pour l'autre utilisateur
  const [contactInfo, setContactInfo] = useState({
    display_name: userID === "unknown" ? "Conversation" : "",
    username: userID === "unknown" ? "conversation" : "",
    avatar_url: `${process.env.EXPO_PUBLIC_API_URL}/uploads/default_user.png`,
    isOnline: false,
    score: 86400, // Valeur par défaut (24 heures)
  });

  // Mettre à jour les informations de contact avec les données de profil
  useEffect(() => {
    console.log('Profile data:', profileData);

    if (profileData && profileData.data) {
      // Si nous avons des données de profil, les utiliser
      const profile = profileData.data;
      setContactInfo({
        display_name: profile.display_name || profile.username || "Utilisateur",
        username: profile.username || "",
        avatar_url: profile.avatar_url || `${process.env.EXPO_PUBLIC_API_URL}/uploads/default_user.png`,
        isOnline: false, // L'API ne fournit pas cette information pour l'instant
        score: profile.score || 86400, // Utiliser le score de l'utilisateur ou la valeur par défaut
      });
    } else if (conversationData && conversationData.length > 0) {
      // Sinon, essayer de trouver les informations dans les données de conversation
      console.log('Conversation data:', conversationData);

      // Trouver un message d'un autre utilisateur
      const currentUserID = user?.userID;
      const otherUserMessage = conversationData.find((msg) => msg.senderID !== currentUserID);

      if (otherUserMessage && otherUserMessage.sender) {
        console.log('Found sender info in message:', otherUserMessage.sender);
        setContactInfo({
          display_name: otherUserMessage.sender.display_name || "Utilisateur",
          username: otherUserMessage.sender.username || "",
          avatar_url: otherUserMessage.sender.avatar_url || `${process.env.EXPO_PUBLIC_API_URL}/uploads/default_user.png`,
          isOnline: false, // L'API ne fournit pas cette information pour l'instant
          score: otherUserMessage.sender.score || 86400, // Utiliser le score de l'utilisateur ou la valeur par défaut
        });
      }
    }
  }, [profileData, conversationData, user?.userID]);

  // Traiter les données de messages de l'API
  useEffect(() => {
    if (conversationData) {
      // Utiliser les données réelles de l'API pour les conversations
      setMessages(conversationData);
    } else if (messagesData) {
      // Utiliser les données réelles de l'API pour les messages entre utilisateurs
      setMessages(messagesData);
    }
  }, [conversationData, messagesData]);

  // Appeler markMessagesAsRead lorsque les données sont chargées
  useEffect(() => {
    // Attendre un court instant pour éviter les appels trop fréquents
    const timer = setTimeout(() => {
      markMessagesAsRead();
    }, 500);

    return () => clearTimeout(timer);
  }, [conversationID, userID, markMessagesAsRead]);

  // Défiler vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    // Utiliser requestAnimationFrame au lieu de setTimeout pour éviter les problèmes de rendu
    if (flatListRef.current && messages.length > 0) {
      const scrollToEnd = () => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: false });
        }
      };

      // Utiliser requestAnimationFrame pour s'assurer que le scroll se produit après le rendu
      requestAnimationFrame(scrollToEnd);
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
    sendMessageMutation.mutate(messageData, {
      onSuccess: (data) => {
        // Si l'API renvoie le message créé, l'utiliser
        if (data && data.data) {
          setMessages([...messages, data.data]);

          // Si nous avons reçu un conversationID et que nous n'en avions pas avant, mettre à jour l'URL
          if (data.data.conversationID && !conversationID) {
            router.setParams({
              conversationID: data.data.conversationID
            });
          }

          // Réinitialiser le marquage pour permettre de marquer les nouveaux messages comme lus
          const key = data.data.conversationID || userID;
          if (key) {
            messagesMarkedAsReadRef.current[key] = false;

            // Attendre un court instant puis marquer les messages comme lus
            setTimeout(() => {
              markMessagesAsRead();
            }, 1000);
          }
        }

        setNewMessage("");

        // Défiler vers le bas en utilisant requestAnimationFrame au lieu de setTimeout
        requestAnimationFrame(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        });
      },
      onError: (error) => {
        console.error("Failed to send message:", error);
      },
    });
  };

  // Déterminer l'état de chargement et d'erreur global
  const isLoading = isLoadingConversation || isLoadingMessages || isLoadingProfile;
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

            <ContactHeader contactInfo={contactInfo} userID={userID} />

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