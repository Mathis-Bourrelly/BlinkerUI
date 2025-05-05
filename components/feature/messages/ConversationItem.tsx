import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/base/ThemedText";
import { ScoreDot } from "@/components/feature/ScoreDot";
import { ConversationPreviewType } from "@/types/MessagesType";
import { useFormatMessageDate } from "@/utils/dateUtils";
import { messagesStyles } from "./MessagesStyles";

type ConversationItemProps = {
  conversation: ConversationPreviewType;
};

export function ConversationItem({ conversation }: ConversationItemProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { formatMessageDate } = useFormatMessageDate();

  const handlePress = () => {
    // Navigate with both userID and conversationID
    router.push({
      pathname: "/messages/[userID]",
      params: {
        userID: conversation.userID,
        conversationID: conversation.conversationID
      },
    });

    // Debug log
    console.log('Conversation clicked:', conversation);
  };

  return (
    <TouchableOpacity
      style={[messagesStyles.card, { borderColor: colors.border, backgroundColor: colors.card }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={messagesStyles.conversationContainer}>
        <Image
          source={{
            uri: conversation.avatar_url
              ? conversation.avatar_url
              : `${process.env.EXPO_PUBLIC_API_URL}/uploads/default_user.png`
          }}
          style={messagesStyles.avatar}
        />

        <View style={messagesStyles.messageContent}>
          <View style={messagesStyles.row}>
            <View style={messagesStyles.nameContainer}>
              <ThemedText style={[messagesStyles.name, { color: colors.text }]}>
                {conversation.display_name || "User"}
              </ThemedText>
              <View style={messagesStyles.usernameRow}>
                <ThemedText style={[messagesStyles.username, { color: colors.textSecondary }]}>
                  @{conversation.username}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={[messagesStyles.date, { color: colors.textSecondary }]}>
              {formatMessageDate(conversation.lastMessage?.createdAt || new Date().toISOString())}
            </ThemedText>
          </View>

          <View style={messagesStyles.previewContainer}>
            <ThemedText
              style={[
                messagesStyles.preview,
                { color: colors.textSecondary },
                conversation.lastMessage && !(conversation.lastMessage.read ?? conversation.lastMessage.isRead) && [messagesStyles.unreadText, { color: colors.text }]
              ]}
              numberOfLines={1}
            >
              {conversation.lastMessage?.isFromUser ? `${t("messages.you")}: ` : ""}{conversation.lastMessage?.content || t("messages.noMessages")}
            </ThemedText>

            {conversation.unreadCount > 0 && (
              <View style={[messagesStyles.badge, { backgroundColor: colors.accent }]}>
                <ThemedText style={messagesStyles.badgeText}>{conversation.unreadCount}</ThemedText>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
