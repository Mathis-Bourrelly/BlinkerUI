import React from "react";
import { View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/base/ThemedText";
import { messageThreadStyles } from "./MessageThreadStyles";

type MessageItemProps = {
  message: {
    senderID: string;
    content: string;
    createdAt: string;
    expiresAt: string;
  };
  formatMessageDate: (date: string) => string;
  formatTimeRemaining: (date: string) => string;
  currentUserID: string | null;
};

export function MessageItem({ message, formatMessageDate, formatTimeRemaining, currentUserID }: MessageItemProps) {
  const { colors } = useTheme();

  // Déterminer si le message est envoyé par l'utilisateur actuel en comparant les IDs
  const isSentByMe = currentUserID !== null && message.senderID === currentUserID;

  return (
    <View style={messageThreadStyles.messageWrapper}>
      {!isSentByMe ? (
        <View style={messageThreadStyles.receivedMessageContainer}>
          <View
            style={[messageThreadStyles.messageBubble, { backgroundColor: colors.card }]}
          >
            <ThemedText style={{ color: "white" }}>{message.content}</ThemedText>
            <View style={messageThreadStyles.messageFooter}>
              <ThemedText style={[messageThreadStyles.expiryTime, { color: "white" }]}>
                {formatTimeRemaining(message.expiresAt).replace("Expire dans ", "")}
              </ThemedText>
            </View>
          </View>
          <View style={messageThreadStyles.spacer} />
        </View>
      ) : (
        <View style={messageThreadStyles.sentMessageContainer}>
          <View style={messageThreadStyles.spacer} />
          <View
            style={[messageThreadStyles.messageBubble, { backgroundColor: colors.accent }]}
          >
            <ThemedText style={{ color: "white" }}>{message.content}</ThemedText>
            <View style={messageThreadStyles.messageFooter}>
              <ThemedText style={[messageThreadStyles.expiryTime, { color: "white" }]}>
                {formatTimeRemaining(message.expiresAt).replace("Expire dans ", "")}
              </ThemedText>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
