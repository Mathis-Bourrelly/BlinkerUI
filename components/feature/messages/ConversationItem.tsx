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
    // If we have a participant, navigate with both userID and conversationID
    // Otherwise, just navigate with conversationID
    if (conversation.participant) {
      router.push({
        pathname: "/messages/[userID]",
        params: {
          userID: conversation.participant.userID,
          conversationID: conversation.conversationID
        },
      });
    } else {
      router.push({
        pathname: "/messages/[userID]",
        params: {
          userID: "unknown",
          conversationID: conversation.conversationID
        },
      });
    }
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
            uri: conversation.participant && conversation.participant.avatar_url
              ? conversation.participant.avatar_url
              : `${process.env.EXPO_PUBLIC_API_URL}/uploads/default_user.png`
          }}
          style={messagesStyles.avatar}
        />

        <View style={messagesStyles.messageContent}>
          <View style={messagesStyles.row}>
            <View style={messagesStyles.nameContainer}>
              <ThemedText style={[messagesStyles.name, { color: colors.text }]}>
                {conversation.participant?.display_name || "User"}
              </ThemedText>
              {conversation.participant?.userID && (
                <View style={messagesStyles.usernameRow}>
                  <ThemedText style={[messagesStyles.username, { color: colors.textSecondary }]}>
                    @{conversation.participant.username}
                  </ThemedText>
                  {conversation.participant.score && (
                    <View style={messagesStyles.scoreDotContainer}>
                      <ScoreDot score={conversation.participant.score} size={8} />
                    </View>
                  )}
                </View>
              )}
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
                conversation.lastMessage && !conversation.lastMessage.read && [messagesStyles.unreadText, { color: colors.text }]
              ]}
              numberOfLines={1}
            >
              {conversation.lastMessage?.content || t("messages.noMessages")}
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
