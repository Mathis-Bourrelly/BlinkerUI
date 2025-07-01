import React from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/base/ThemedText";
import { Icon } from "@/components/images/Icon";
import { messagesStyles } from "./MessagesStyles";

export function EmptyState() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={messagesStyles.emptyContainer}>
      <Icon name="chat" size={64} color={colors.textSecondary} />
      <ThemedText style={[messagesStyles.emptyText, { color: colors.textSecondary }]}>
        {t("messages.noMessages")}
      </ThemedText>
      <ThemedText style={[messagesStyles.emptySubText, { color: colors.textSecondary }]}>
        {t("messages.startConversation")}
      </ThemedText>
    </View>
  );
}
