import React from "react";
import { View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/base/ThemedText";
import { Icon } from "@/components/images/Icon";
import { messageThreadStyles } from "./MessageThreadStyles";
import { MessageType } from "@/types/MessagesType";
import { useTranslation } from "react-i18next";

type MessageItemProps = {
  message: MessageType;
  formatMessageDate: (date: string) => string;
  formatTimeRemaining: (date: string) => string;
  currentUserID: string | null;
};

export function MessageItem({ message, formatMessageDate, formatTimeRemaining, currentUserID }: MessageItemProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Déterminer si le message est envoyé par l'utilisateur actuel en comparant les IDs
  const isSentByMe = currentUserID !== null && message.senderID === currentUserID;

  return (
    <View style={messageThreadStyles.messageWrapper}>
      {!isSentByMe ? (
        <View style={messageThreadStyles.receivedMessageContainer}>
          <View
            style={[messageThreadStyles.messageBubble, { backgroundColor: colors.card }]}
          >
            {message.sender && message.sender.display_name && (
              <ThemedText style={[messageThreadStyles.senderName, { color: colors.accent }]}>
                {message.sender.display_name}
              </ThemedText>
            )}
            <ThemedText style={{ color: "white" }}>{message.content}</ThemedText>
            <View style={messageThreadStyles.messageFooter}>
              <View style={messageThreadStyles.messageFooterContent}>
                <Icon name="hourglass-sand-top" size={10} color={colors.text} style={messageThreadStyles.readIndicator} />
                <ThemedText style={[messageThreadStyles.expiryTime, { color: "white" }]}>
                  {formatTimeRemaining(message.expiresAt)}
                </ThemedText>
              </View>
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
              <View style={messageThreadStyles.messageFooterContent}>
                <Icon name="hourglass-sand-top" size={12} color={colors.text} style={messageThreadStyles.readIndicator} />
                <ThemedText style={[messageThreadStyles.expiryTime, { color: "white" }]}>
                  {formatTimeRemaining(message.expiresAt)}
                </ThemedText>
              </View>
              {message.isRead && (
                <View style={messageThreadStyles.readIndicatorContainer}>
                  <Icon name="visible" size={12} color={colors.text} style={messageThreadStyles.readIndicator} />
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
