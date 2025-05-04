import React, { useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/feature/NavBar";
import TabBar from "@/components/feature/TabBar";
import { InnerContainer } from "@/components/base/InnerContainer";
import { ThemedText } from "@/components/base/ThemedText";

const mockMessages = [
  { id: "1", sender: "me", content: "Salut !" },
  { id: "2", sender: "other", content: "Hey, tu vas bien ?" },
  { id: "3", sender: "me", content: "Yes nickel et toi ?" },
];

export default function MessageThreadScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { userID } = useLocalSearchParams<{ userID: string }>();
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, {
      id: Date.now().toString(),
      sender: "me",
      content: newMessage.trim(),
    }]);
    setNewMessage("");
  };

  return (
    <>
      <Stack.Screen />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <InnerContainer>
          <NavBar />
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.messagesContainer}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageBubble,
                  item.sender === "me" ? styles.sent : styles.received,
                ]}
              >
                <ThemedText>{item.content}</ThemedText>
              </View>
            )}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={64}
            style={[styles.inputContainer, { borderTopColor: colors.border }]}
          >
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder={t("messages.placeholder") || "Écris un message..."}
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity onPress={handleSend}>
              <ThemedText style={{ color: colors.accent }}>Envoyer</ThemedText>
            </TouchableOpacity>
          </KeyboardAvoidingView>
          <TabBar />
        </InnerContainer>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  messagesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: "75%",
  },
  sent: {
    alignSelf: "flex-end",
    backgroundColor: "#3058e7",
  },
  received: {
    alignSelf: "flex-start",
    backgroundColor: "#42454e",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingRight: 12,
  },
});
