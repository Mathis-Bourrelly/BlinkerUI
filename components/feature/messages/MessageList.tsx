import React, { forwardRef, useMemo } from "react";
import { FlatList, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { ThemedText } from "@/components/base/ThemedText";
import { Icon } from "@/components/images/Icon";
import { MessageItem } from "./MessageItem";
import { DateSeparator } from "./DateSeparator";
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
    const { t } = useTranslation();
    const { user } = useUser();

    // Groupe les messages par date
    const groupedMessages = useMemo(() => {
      if (messages.length === 0) {
        return [];
      }

      const groups: { date: string; messages: MessageType[] }[] = [];
      let currentDate = "";
      let currentGroup: MessageType[] = [];

      // Trie les messages par date (du plus ancien au plus récent)
      const sortedMessages = [...messages].sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      sortedMessages.forEach(message => {
        // Obtenir la date formatée complète
        const formattedDate = formatMessageDate(message.createdAt);

        // Déterminer la date à utiliser pour le regroupement
        let messageDate;

        // Si c'est une heure (format HH:MM pour aujourd'hui), utiliser "Aujourd'hui"
        if (formattedDate.includes(':')) {
          messageDate = t('messages.today');
        } else {
          // Sinon, utiliser la date telle quelle ("hier" ou date au format court)
          messageDate = formattedDate;
        }

        if (messageDate !== currentDate) {
          // Si on a un nouveau groupe, on ajoute le précédent aux résultats
          if (currentGroup.length > 0) {
            groups.push({ date: currentDate, messages: currentGroup });
          }
          // On commence un nouveau groupe
          currentDate = messageDate;
          currentGroup = [message];
        } else {
          // On ajoute au groupe courant
          currentGroup.push(message);
        }
      });

      // On ajoute le dernier groupe
      if (currentGroup.length > 0) {
        groups.push({ date: currentDate, messages: currentGroup });
      }

      return groups;
    }, [messages, formatMessageDate, t]);

    // Prépare les données pour le FlatList
    const flatListData = useMemo(() => {
      if (groupedMessages.length === 0) {
        return [];
      }

      const data: (MessageType | { type: 'date'; date: string; id: string })[] = [];

      // Create a Set to track message IDs we've already added
      const addedMessageIds = new Set<string>();

      groupedMessages.forEach(group => {
        // Ajoute le séparateur de date
        data.push({ type: 'date', date: group.date, id: `date-${group.date}-${Date.now()}` });

        // Ajoute les messages en évitant les doublons
        group.messages.forEach(message => {
          // Skip messages we've already added
          if (addedMessageIds.has(message.messageID)) {
            return;
          }

          // Add the message and track its ID
          data.push(message);
          addedMessageIds.add(message.messageID);
        });
      });

      return data;
    }, [groupedMessages]);

    if (messages.length === 0) {
      return <EmptyState />;
    }



    return (
      <FlatList
        ref={ref}
        data={flatListData}
        keyExtractor={(item) => {
          // Ensure we have a unique key for each item
          if ('messageID' in item) {
            return `msg-${item.messageID}`;
          } else {
            return `date-${item.id}`;
          }
        }}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={messageThreadStyles.messagesContainer}
        renderItem={({ item }) => {
          if ('type' in item && item.type === 'date') {
            return <DateSeparator date={item.date} />;
          } else {
            return (
              <MessageItem
                message={item as MessageType}
                formatMessageDate={formatMessageDate}
                formatTimeRemaining={formatTimeRemaining}
                currentUserID={user?.userID || null}
              />
            );
          }
        }}
      />
    );
  }
);
