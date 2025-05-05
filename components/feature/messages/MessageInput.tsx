import React from "react";
import { View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { Icon } from "@/components/images/Icon";
import { messageThreadStyles } from "./MessageThreadStyles";

type MessageInputProps = {
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSend: () => void;
  isPending: boolean | undefined;
};

export function MessageInput({ newMessage, setNewMessage, handleSend, isPending }: MessageInputProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={64}
      style={[messageThreadStyles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.card }]}
    >
      <TouchableOpacity style={messageThreadStyles.attachButton}>
        <Icon name="attachment" size={24} color={colors.accent} />
      </TouchableOpacity>

      <TextInput
        style={[messageThreadStyles.input, { color: colors.text, backgroundColor: colors.card }]}
        value={newMessage}
        onChangeText={setNewMessage}
        placeholder={t("messages.placeholder")}
        placeholderTextColor={colors.textSecondary}
        multiline
      />

      <TouchableOpacity
        onPress={handleSend}
        disabled={!newMessage.trim() || isPending}
        style={[messageThreadStyles.sendButton, { opacity: !newMessage.trim() || isPending ? 0.5 : 1 }]}
      >
        {isPending ? (
          <ActivityIndicator size="small" color={colors.textInvert} />
        ) : (
          <View
            style={[messageThreadStyles.sendButtonGradient, { backgroundColor: colors.accent }]}
          >
            <Icon name="send" size={24} color={colors.textInvert} />
          </View>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
