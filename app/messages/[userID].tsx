import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/feature/NavBar";
import TabBar from "@/components/feature/TabBar";
import { InnerContainer } from "@/components/base/InnerContainer";
import { ThemedText } from "@/components/base/ThemedText";
import { Icon } from "@/components/images/Icon";
import { ScoreDot } from "@/components/feature/ScoreDot";
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

  if (isLoading) {
    return (
      <>
        <Stack.Screen />
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <InnerContainer>
            <NavBar />
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
            <TabBar />
          </InnerContainer>
        </SafeAreaView>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen />
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <InnerContainer>
            <NavBar />
            <View style={styles.errorContainer}>
              <ThemedText style={{ color: colors.danger }}>{t("messages.errorLoading")}</ThemedText>
            </View>
            <TabBar />
          </InnerContainer>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <InnerContainer>
          <NavBar />

          {/* En-tête de conversation avec info de contact */}
          <View style={[styles.contactHeader, { borderBottomColor: colors.border }]}>
            <Image
              source={{ uri: contactInfo.avatar_url }}
              style={styles.contactAvatar}
            />
            <View style={styles.contactInfo}>
              <ThemedText style={styles.contactName}>{contactInfo.display_name}</ThemedText>
              <View style={styles.usernameRow}>
                <ThemedText style={[styles.statusText, { color: colors.textSecondary }]}>@{contactInfo.username}</ThemedText>
                <View style={styles.scoreDotContainer}>
                  <ScoreDot score={contactInfo.score} size={8} />
                </View>
              </View>
              <View style={styles.statusContainer}>
                {contactInfo.isOnline ? (
                  <>
                    <View style={[styles.statusDot, { backgroundColor: colors.valide }]} />
                    <ThemedText style={[styles.statusText, { color: colors.textSecondary }]}>
                      {t("messages.online")}
                    </ThemedText>
                  </>
                ) : (
                  <ThemedText style={[styles.statusText, { color: colors.textSecondary }]}>
                    {t("messages.offline")}
                  </ThemedText>
                )}
              </View>
            </View>
          </View>

          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText>{t("messages.noMessages")}</ThemedText>
              <ThemedText>{t("messages.startConversation")}</ThemedText>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.messageID}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.messagesContainer}
              renderItem={({ item }) => (
                <View style={styles.messageWrapper}>
                  {item.senderID === "me" ? (
                    <View style={styles.sentMessageContainer}>
                      <View style={styles.spacer} />
                      <LinearGradient
                        colors={colors.accentGradient}
                        style={styles.messageBubble}
                      >
                        <ThemedText style={{ color: colors.textInvert }}>{item.content}</ThemedText>
                        <View style={styles.messageFooter}>
                          <ThemedText style={styles.messageTime}>
                            {formatMessageDate(item.createdAt)}
                          </ThemedText>
                          <ThemedText style={styles.expiryTime}>
                            {formatTimeRemaining(item.expiresAt)}
                          </ThemedText>
                        </View>
                      </LinearGradient>
                    </View>
                  ) : (
                    <View style={styles.receivedMessageContainer}>
                      <View
                        style={[styles.messageBubble, { backgroundColor: colors.card }]}
                      >
                        <ThemedText>{item.content}</ThemedText>
                        <View style={styles.messageFooter}>
                          <ThemedText style={styles.messageTime}>
                            {formatMessageDate(item.createdAt)}
                          </ThemedText>
                          <ThemedText style={styles.expiryTime}>
                            {formatTimeRemaining(item.expiresAt)}
                          </ThemedText>
                        </View>
                      </View>
                      <View style={styles.spacer} />
                    </View>
                  )}
                </View>
              )}
            />
          )}

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={64}
            style={[styles.inputContainer, { borderTopColor: colors.border }]}
          >
            <TouchableOpacity style={styles.attachButton}>
              <Icon name="attachment" size={24} color={colors.accent} />
            </TouchableOpacity>

            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.card }]}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder={t("messages.placeholder")}
              placeholderTextColor={colors.textSecondary}
              multiline
            />

            <TouchableOpacity
              onPress={handleSend}
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              style={[styles.sendButton, { opacity: !newMessage.trim() || sendMessageMutation.isPending ? 0.5 : 1 }]}
            >
              {sendMessageMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.textInvert} />
              ) : (
                <LinearGradient
                  colors={colors.accentGradient}
                  style={styles.sendButtonGradient}
                >
                  <Icon name="send" size={24} color={colors.textInvert} />
                </LinearGradient>
              )}
            </TouchableOpacity>
          </KeyboardAvoidingView>

          <TabBar />
        </InnerContainer>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  scoreDotContainer: {
    marginLeft: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
  },
  messagesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  messageWrapper: {
    marginBottom: 8,
    width: "100%",
  },
  sentMessageContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    maxWidth: "100%",
  },
  receivedMessageContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    maxWidth: "100%",
  },
  spacer: {
    flex: 1,
    maxWidth: "25%",
  },
  messageBubble: {
    padding: 10,
    borderRadius: 12,
    maxWidth: "75%",
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    opacity: 0.7,
  },
  messageTime: {
    fontSize: 10,
  },
  expiryTime: {
    fontSize: 10,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  attachButton: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
