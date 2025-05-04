import React, { forwardRef } from "react";
import { FlatList, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/base/ThemedText";
import { Icon } from "@/components/images/Icon";
import { MessageItem } from "./MessageItem";
import { MessageType } from "@/types/MessagesType";
import { messageThreadStyles } from "./MessageThreadStyles";
import { EmptyState } from "./EmptyState";

type MessageListProps = {
  messages: MessageType[];
  formatMessageDate: (date: string) => string;
  formatTimeRemaining: (date: string) => string;
};

export const MessageList = forwardRef<FlatList, MessageListProps>(
  ({ messages, formatMessageDate, formatTimeRemaining }, ref) => {
    const { colors } = useTheme();

    if (messages.length === 0) {
      return <EmptyState />;
    }

    return (
      <FlatList
        ref={ref}
        data={messages}
        keyExtractor={(item) => item.messageID}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={messageThreadStyles.messagesContainer}
        renderItem={({ item }) => (
          <MessageItem
            message={item}
            formatMessageDate={formatMessageDate}
            formatTimeRemaining={formatTimeRemaining}
          />
        )}
      />
    );
  }
);
