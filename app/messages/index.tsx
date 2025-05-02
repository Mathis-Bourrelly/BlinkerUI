import React from "react";
import { StyleSheet, FlatList, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/base/ThemedText";
import NavBar from "@/components/feature/NavBar";
import TabBar from "@/components/feature/TabBar";
import { InnerContainer } from "@/components/base/InnerContainer";

const mockConversations = [
  { id: "123", name: "Claire", lastMessage: "Tu viens ce soir ?", date: "12:30" },
  { id: "456", name: "Antoine", lastMessage: "Parfait, merci !", date: "Hier" },
];

export default function MessagesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <InnerContainer>
        <NavBar />
        {!isDesktop && <TabBar />}
        <ThemedText variant="Title" style={styles.title}>
          {t("messages.title") || "Messagerie"}
        </ThemedText>

        <FlatList
          data={mockConversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { borderBottomColor: colors.border }]}
              onPress={() =>
                router.push({
                  pathname: "/messages/[userID]",
                  params: { userID: item.id },
                })
              }
            >
              <View style={styles.row}>
                <ThemedText style={styles.name}>{item.name}</ThemedText>
                <ThemedText style={styles.date}>{item.date}</ThemedText>
              </View>
              <ThemedText style={styles.preview} numberOfLines={1}>
                {item.lastMessage}
              </ThemedText>
            </TouchableOpacity>
          )}
        />
      </InnerContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 16,
  },
  card: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    width: "100%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: {
    fontWeight: "600",
    fontSize: 16,
  },
  date: {
    fontSize: 12,
    color: "#aaa",
  },
  preview: {
    fontSize: 14,
    color: "#888",
  },
});
