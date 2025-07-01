import React, { useState, useRef, useEffect, useCallback } from "react";
import { FlatList, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { useMessageContext } from "@/context/MessageContext";
import { useWebSocket } from "@/context/WebSocketContext";
import NavBar from "@/components/feature/NavBar";
import TabBar from "@/components/feature/TabBar";
import { InnerContainer } from "@/components/base/InnerContainer";
import { LinearGradient } from "expo-linear-gradient";
import {
  useMessagesBetweenQuery,
  useMarkAsReadMutation
} from "@/hooks/interfaces/useMessageInterface";
import { useUserProfileQuery } from "@/hooks/interfaces/useProfileInterface";
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
  const router = useRouter();
  const { width } = useWindowDimensions();
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

  // Récupérer les messages entre utilisateurs (uniquement si pas de conversationID)
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

  // Mutation pour marquer les messages comme lus (uniquement pour la compatibilité avec l'ancien système)
  const markAsReadMutation = useMarkAsReadMutation();

  // État pour suivre le chargement des messages via WebSocket
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [errorConversation, setErrorConversation] = useState<Error | null>(null);

  // État local pour les messages
  const [messages, setMessages] = useState<MessageType[]>([]);

  // Utiliser une référence pour suivre si les messages ont déjà été marqués comme lus
  // Une référence ne déclenche pas de rendu lorsqu'elle est mise à jour
  const messagesMarkedAsReadRef = useRef<{[key: string]: boolean}>({});

  // WebSocket integration
  const {
    isConnected,
    onMessageNotification,
    onMessageSent,
    onMarkAsReadConfirmation,
    onMessagesRead,
    onMessagesExpired,
    onError,
    markAsRead: wsMarkAsRead,
    getConversationMessages
  } = useWebSocket();

  // Fonction pour marquer les messages comme lus
  const markMessagesAsRead = useCallback((): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const key = conversationID || userID;

      // Ne rien faire si les messages ont déjà été marqués comme lus
      if (key && messagesMarkedAsReadRef.current[key]) {
        resolve();
        return;
      }

      // Marquer les messages comme lus selon le mode (conversation ou entre utilisateurs)
      if (conversationID) {
        // Utiliser WebSocket pour marquer les messages comme lus
        if (isConnected) {
          wsMarkAsRead(conversationID)
            .then(() => {
              // Marquer comme déjà lu pour éviter les appels répétés
              messagesMarkedAsReadRef.current[conversationID] = true;
              resolve();
            })
            .catch(error => {
              console.error('Failed to mark messages as read via WebSocket:', error);
              reject(error);
            });
        } else {
          resolve(); // Résoudre si pas connecté au WebSocket
        }
      } else if (userID && userID !== "unknown") {
        // Utiliser l'API REST pour la compatibilité avec l'ancien système
        markAsReadMutation.mutate(userID, {
          onSuccess: () => {
            // Marquer comme déjà lu pour éviter les appels répétés
            messagesMarkedAsReadRef.current[userID] = true;
            resolve();
          },
          onError: (error) => {
            reject(error);
          }
        });
      } else {
        resolve(); // Résoudre si aucune action n'est nécessaire
      }
    });
  }, [conversationID, userID, markAsReadMutation, wsMarkAsRead, isConnected]);

  // Informations de contact pour l'autre utilisateur
  const [contactInfo, setContactInfo] = useState({
    display_name: userID === "unknown" ? "Conversation" : "",
    username: userID === "unknown" ? "conversation" : "",
    avatar_url: `${process.env.EXPO_PUBLIC_API_URL}/uploads/default_user.png`,
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
        score: profile.score || 86400, // Utiliser le score de l'utilisateur ou la valeur par défaut
      });
    } else if (messages.length > 0 && conversationID) {
      // Sinon, essayer de trouver les informations dans les messages
      console.log('Looking for contact info in messages');

      // Trouver un message d'un autre utilisateur
      const currentUserID = user?.userID;
      const otherUserMessage = messages.find((msg) => msg.senderID !== currentUserID);

      if (otherUserMessage && otherUserMessage.sender) {
        console.log('Found sender info in message:', otherUserMessage.sender);
        setContactInfo({
          display_name: otherUserMessage.sender.display_name || "Utilisateur",
          username: otherUserMessage.sender.username || "",
          avatar_url: otherUserMessage.sender.avatar_url || `${process.env.EXPO_PUBLIC_API_URL}/uploads/default_user.png`,
          score: otherUserMessage.sender.score || 86400, // Utiliser le score de l'utilisateur ou la valeur par défaut
        });
      }
    }
  }, [profileData, messages, conversationID, user?.userID]);

  // Traiter les données de messages de l'API (uniquement pour les messages entre utilisateurs)
  useEffect(() => {
    if (messagesData && !conversationID) {
      // Utiliser les données réelles de l'API pour les messages entre utilisateurs
      setMessages(messagesData);
    }
  }, [messagesData, conversationID]);

  // Appeler markMessagesAsRead lorsque les données sont chargées
  // mais seulement pour les messages reçus, pas pour les messages envoyés
  useEffect(() => {
    // Vérifier s'il y a des messages non lus de l'autre utilisateur
    const hasUnreadMessagesFromOthers = messages.some(msg =>
      !msg.isRead && msg.senderID !== user?.userID
    );

    // Ne marquer comme lus que s'il y a des messages non lus de l'autre utilisateur
    if (hasUnreadMessagesFromOthers) {
      // Attendre un court instant pour éviter les appels trop fréquents
      const timer = setTimeout(() => {
        markMessagesAsRead();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [conversationID, userID, markMessagesAsRead, messages, user?.userID]);



  // Listen for new messages via WebSocket
  useEffect(() => {
    if (!isConnected) return;

    // Handler for message notifications
    const handleMessageNotification = (data: any) => {
      console.log('WebSocket: Message notification received', data);
      // Only add the message if it's for the current conversation
      if (conversationID && data.conversationID === conversationID && data.message) {
        // Check if the message already exists in our state to avoid duplicates
        setMessages(prevMessages => {
          // Check if we already have this message
          const messageExists = prevMessages.some(msg => msg.messageID === data.message.messageID);
          if (messageExists) {
            // If the message already exists, don't add it again
            return prevMessages;
          }
          // Otherwise add the new message
          return [...prevMessages, data.message];
        });

        // Mark the message as read, but only if it's from another user
        // This prevents marking our own messages as read automatically
        setTimeout(() => {
          if (conversationID) {
            const currentUserID = user?.userID;
            const isFromOtherUser = data.message.senderID !== currentUserID;

            // Only mark as read if the message is from another user
            if (isFromOtherUser) {
              try {
                wsMarkAsRead(conversationID).then(response => {
                  console.log('Messages marked as read via WebSocket:', response);
                  // We don't need to update UI here as the server will send a messagesRead event
                  // which will be handled by handleMessagesRead
                }).catch(error => {
                  console.error('Failed to mark message as read via WebSocket:', error);
                  // Fall back to REST API but don't throw if that fails too
                  markMessagesAsRead().catch((err: Error) => {
                    console.error('Failed to mark message as read via REST API:', err);
                  });
                });
              } catch (error) {
                console.error('Error in markAsRead:', error);
              }
            }
          }
        }, 1000);

        // Scroll to bottom
        requestAnimationFrame(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        });
      }
    };

    // Handler for message sent confirmations
    const handleMessageSent = (data: any) => {
      console.log('WebSocket: Message sent confirmation received', data);
      // This is handled by the MessageInput component
    };

    // Handler for mark as read confirmations
    const handleMarkAsReadConfirmation = (data: any) => {
      console.log('WebSocket: Mark as read confirmation received', data);
      // Update the UI to reflect that messages have been read
      if (conversationID && data.conversationID === conversationID) {
        // Only mark messages as read if they were sent by the current user
        // This ensures only messages that the other user has actually read are marked as read
        const currentUserID = user?.userID;
        setMessages(prevMessages =>
          prevMessages.map(msg => ({
            ...msg,
            // Only update isRead for messages sent by the current user
            isRead: msg.senderID === currentUserID ? true : msg.isRead
          }))
        );
      }
    };

    // Handler for messages read status updates
    const handleMessagesRead = (data: any) => {
      console.log('WebSocket: Messages read notification received', data);
      // Update the UI to reflect that messages have been read
      if (conversationID && data.conversationID === conversationID) {
        // Only mark messages as read if they were sent by the current user
        // and the read notification is from the other user
        const currentUserID = user?.userID;
        if (data.userID && data.userID !== currentUserID) {
          setMessages(prevMessages =>
            prevMessages.map(msg => ({
              ...msg,
              // Only update isRead for messages sent by the current user
              isRead: msg.senderID === currentUserID ? true : msg.isRead
            }))
          );
        }
      }
    };

    // Handler for message expiration
    const handleMessagesExpired = (data: any) => {
      console.log('WebSocket: Messages expired notification received', data);
      if (conversationID && data.conversationID === conversationID && data.messageIDs?.length > 0) {
        // Remove expired messages from the UI
        setMessages(prevMessages =>
          prevMessages.filter(msg => !data.messageIDs.includes(msg.messageID))
        );
      }
    };

    // Handler for errors
    const handleError = (data: any) => {
      console.error(`WebSocket error: ${data.code} - ${data.message}`, data.details || '');
    };

    // Register event handlers
    const unsubscribeMessageNotification = onMessageNotification(handleMessageNotification);
    const unsubscribeMessageSent = onMessageSent(handleMessageSent);
    const unsubscribeMarkAsReadConfirmation = onMarkAsReadConfirmation(handleMarkAsReadConfirmation);
    const unsubscribeMessagesRead = onMessagesRead(handleMessagesRead);
    const unsubscribeMessagesExpired = onMessagesExpired(handleMessagesExpired);
    const unsubscribeError = onError(handleError);

    // If we have a conversationID, get messages via WebSocket
    if (conversationID) {
      try {
        // Set loading state
        setIsLoadingConversation(true);
        setErrorConversation(null);

        // This will trigger the conversationMessages event
        getConversationMessages(conversationID)
          .then(response => {
            console.log('Conversation messages received via WebSocket:', response);
            // Update messages with the response
            if (response.messages && response.messages.length > 0) {
              setMessages(response.messages);
            }
            setIsLoadingConversation(false);
          })
          .catch(error => {
            console.error('Failed to get conversation messages via WebSocket:', error);
            setErrorConversation(error as Error);
            setIsLoadingConversation(false);
          });
      } catch (error) {
        console.error('Error in getConversationMessages:', error);
        setErrorConversation(error as Error);
        setIsLoadingConversation(false);
      }
    }

    // Cleanup function
    return () => {
      unsubscribeMessageNotification();
      unsubscribeMessageSent();
      unsubscribeMarkAsReadConfirmation();
      unsubscribeMessagesRead();
      unsubscribeMessagesExpired();
      unsubscribeError();
    };
  }, [isConnected, conversationID]);

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

  // Cette fonction n'est plus nécessaire car nous utilisons uniquement WebSocket pour envoyer des messages

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
      <SafeAreaView style={[messageThreadStyles.container, { paddingBottom: width > 768 ? 0 : 40 }]}>
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
              conversationID={conversationID}
              receiverID={userID !== "unknown" ? userID : undefined}
              onMessageSent={(message) => {
                // Add the sent message to the local state
                const sentMessage = {
                  messageID: `temp-${Date.now()}`,
                  conversationID: conversationID || '',
                  content: message.content,
                  expiresAt: new Date(Date.now() + 86400000).toISOString(), // Default 24h expiration
                  isRead: false,
                  senderID: user?.userID || '',
                  createdAt: new Date().toISOString(),
                };
                setMessages([...messages, sentMessage]);

                // If we received a conversationID and didn't have one before, update the URL
                if (message.conversationID && !conversationID) {
                  router.setParams({
                    conversationID: message.conversationID
                  });
                }

                // Scroll to bottom
                requestAnimationFrame(() => {
                  if (flatListRef.current) {
                    flatListRef.current.scrollToEnd({ animated: true });
                  }
                });
              }}
            />

            <MessageThreadFooter />
          </InnerContainer>
        </LinearGradient>
        <TabBar />
      </SafeAreaView>
    </>
  );
}