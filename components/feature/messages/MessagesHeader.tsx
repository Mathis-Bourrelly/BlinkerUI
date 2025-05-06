import React from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { ThemedText } from "@/components/base/ThemedText";
import NavBar from "@/components/feature/NavBar";
import { messagesStyles } from "./MessagesStyles";
import { useWebSocket } from "@/context/WebSocketContext";
import { useTheme } from "@/context/ThemeContext";

export function MessagesHeader() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isConnected } = useWebSocket();

  return (
    <>
      <NavBar />
      <View style={styles.titleContainer}>
        <ThemedText variant="Title" style={messagesStyles.title}>
          {t("messages.title")}
        </ThemedText>
        <View
          style={[
            styles.connectionIndicator,
            { backgroundColor: isConnected ? colors.valid : colors.danger }
          ]}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  }
});
