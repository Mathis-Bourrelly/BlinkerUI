import React, { useRef, useEffect } from "react";
import { View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { useWebSocket } from "@/context/WebSocketContext";
import { Icon } from "@/components/images/Icon";
import { messageThreadStyles } from "./MessageThreadStyles";

type MessageInputProps = {
  newMessage: string;
  setNewMessage: (message: string) => void;
  conversationID?: string;
  receiverID?: string;
  onMessageSent?: (message: any) => void;
};

export function MessageInput({
  newMessage,
  setNewMessage,
  conversationID,
  receiverID,
  onMessageSent
}: MessageInputProps) {
  const { isConnected, sendMessage } = useWebSocket();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const inputRef = useRef<TextInput>(null);

  // Mettre le focus sur l'input dès que le composant est monté
  useEffect(() => {
    // Petit délai pour s'assurer que le composant est bien rendu
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={64}
      style={[
        messageThreadStyles.inputContainer,
        {
          borderTopColor: colors.border,
          backgroundColor: colors.card,
          // Assurer que le champ de saisie reste au-dessus de la TabBar en mode mobile
          zIndex: 1,
          marginBottom: width > 768 ? 20 : 40 // Ajustement selon le mode desktop ou mobile
        }
      ]}
    >
      <TouchableOpacity style={messageThreadStyles.attachButton}>
        <Icon name="attach" size={24} color={colors.accent} />
      </TouchableOpacity>

      <TextInput
        ref={inputRef}
        style={[messageThreadStyles.input, { color: colors.text, backgroundColor: colors.card }]}
        value={newMessage}
        onChangeText={setNewMessage}
        placeholder={t("messages.placeholder")}
        placeholderTextColor={colors.textSecondary}
        onSubmitEditing={() => {
          const trimmedMessage = newMessage.trim();
          if (!trimmedMessage || !isConnected) return;

          // Clear the input field immediately for better UX
          setNewMessage("");

          // Send message via WebSocket
          sendMessage(trimmedMessage, conversationID, receiverID)
            .then(response => {
              console.log('Message sent via WebSocket:', response);
              if (onMessageSent) {
                onMessageSent({
                  content: trimmedMessage,
                  conversationID: response.conversationID,
                  messageID: response.messageID,
                  receiverID
                });
              }
            })
            .catch(error => {
              console.error('WebSocket send failed:', error);
              alert('Failed to send message. Please try again.');
            });
        }}
        returnKeyType="send"
        blurOnSubmit={false}
        multiline={false}
      />

      <TouchableOpacity
        onPress={async () => {
          const trimmedMessage = newMessage.trim();
          if (!trimmedMessage) return;

          // Clear the input field immediately for better UX
          setNewMessage("");

          // Send message via WebSocket
          if (isConnected) {
            try {
              // Send message via WebSocket and get the response
              const response = await sendMessage(trimmedMessage, conversationID, receiverID);
              console.log('Message sent via WebSocket:', response);

              // If there's a callback for message sent, call it
              if (onMessageSent) {
                onMessageSent({
                  content: trimmedMessage,
                  conversationID: response.conversationID,
                  messageID: response.messageID,
                  receiverID
                });
              }
            } catch (error) {
              console.error('WebSocket send failed:', error);
              // Show error to user
              alert('Failed to send message. Please try again.');
            }
          } else {
            console.error('WebSocket not connected');
            alert('Cannot send message: not connected to server. Please check your connection and try again.');
          }
        }}
        disabled={!newMessage.trim() || !isConnected}
        style={[messageThreadStyles.sendButton, { opacity: !newMessage.trim() || !isConnected ? 0.5 : 1 }]}
      >
        {!isConnected ? (
          <ActivityIndicator size="small" color={colors.textInvert} />
        ) : (
          <View
            style={[messageThreadStyles.sendButtonGradient, { backgroundColor: colors.accent }]}
          >
            <Icon name="send" size={24} color={colors.textInvert} />
          </View>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
