import React from "react";
import { View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/base/ThemedText";
import { LinearGradient } from "expo-linear-gradient";
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
};

export function MessageItem({ message, formatMessageDate, formatTimeRemaining }: MessageItemProps) {
  const { colors } = useTheme();
  const isSentByMe = message.senderID === "me";

  return (
    <View style={messageThreadStyles.messageWrapper}>
      {isSentByMe ? (
        <View style={messageThreadStyles.sentMessageContainer}>
          <View style={messageThreadStyles.spacer} />
          <LinearGradient
            colors={colors.accentGradient}
            style={messageThreadStyles.messageBubble}
          >
            <ThemedText style={{ color: colors.textInvert }}>{message.content}</ThemedText>
            <View style={messageThreadStyles.messageFooter}>
              <ThemedText style={[messageThreadStyles.expiryTime, { color: colors.textInvert }]}>
                {formatTimeRemaining(message.expiresAt).replace("Expire dans ", "")}
              </ThemedText>
            </View>
          </LinearGradient>
        </View>
      ) : (
        <View style={messageThreadStyles.receivedMessageContainer}>
          <View
            style={[messageThreadStyles.messageBubble, { backgroundColor: colors.card }]}
          >
            <ThemedText style={{ color: colors.text }}>{message.content}</ThemedText>
            <View style={messageThreadStyles.messageFooter}>
              <ThemedText style={[messageThreadStyles.expiryTime, { color: colors.text }]}>
                {formatTimeRemaining(message.expiresAt).replace("Expire dans ", "")}
              </ThemedText>
            </View>
          </View>
          <View style={messageThreadStyles.spacer} />
        </View>
      )}
    </View>
  );
}
