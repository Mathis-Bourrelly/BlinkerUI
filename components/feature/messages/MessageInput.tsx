import React from "react";
import { View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { useWebSocket } from "@/context/WebSocketContext";
import { Icon } from "@/components/images/Icon";
import { messageThreadStyles } from "./MessageThreadStyles";

type MessageInputProps = {
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSend: () => void;
  isPending: boolean | undefined;
  conversationID?: string;
  receiverID?: string;
  onMessageSent?: (message: any) => void;
};

export function MessageInput({
  newMessage,
  setNewMessage,
  handleSend,
  isPending,
  conversationID,
  receiverID,
  onMessageSent
}: MessageInputProps) {
  const { isConnected, sendMessage } = useWebSocket();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

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
        <Icon name="attachment" size={24} color={colors.accent} />
      </TouchableOpacity>

      <TextInput
        style={[messageThreadStyles.input, { color: colors.text, backgroundColor: colors.card }]}
        value={newMessage}
        onChangeText={setNewMessage}
        placeholder={t("messages.placeholder")}
        placeholderTextColor={colors.textSecondary}
        onSubmitEditing={handleSend}
        returnKeyType="send"
        blurOnSubmit={false}
        multiline={false}
      />

      <TouchableOpacity
        onPress={async () => {
          // If WebSocket is connected, try to send via WebSocket first
          if (isConnected && newMessage.trim()) {
            try {
              await sendMessage(newMessage.trim(), conversationID, receiverID);
              setNewMessage("");
              // If there's a callback for message sent, call it
              if (onMessageSent) {
                onMessageSent({
                  content: newMessage.trim(),
                  conversationID,
                  receiverID
                });
              }
            } catch (error) {
              console.error('WebSocket send failed, falling back to REST API:', error);
              // Fall back to REST API
              handleSend();
            }
          } else {
            // Use REST API if WebSocket is not connected
            handleSend();
          }
        }}
        disabled={!newMessage.trim() || isPending}
        style={[messageThreadStyles.sendButton, { opacity: !newMessage.trim() || isPending ? 0.5 : 1 }]}
      >
        {isPending ? (
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
