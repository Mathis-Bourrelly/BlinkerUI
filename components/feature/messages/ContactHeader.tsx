import React from "react";
import { View, Image } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/base/ThemedText";
import { ScoreDot } from "@/components/feature/ScoreDot";
import { messageThreadStyles } from "./MessageThreadStyles";

type ContactInfo = {
  display_name: string;
  username: string;
  avatar_url: string;
  isOnline: boolean;
  score: number;
};

type ContactHeaderProps = {
  contactInfo: ContactInfo;
};

export function ContactHeader({ contactInfo }: ContactHeaderProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[messageThreadStyles.contactHeader, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
      <Image
        source={{ uri: contactInfo.avatar_url }}
        style={messageThreadStyles.contactAvatar}
      />
      <View style={messageThreadStyles.contactInfo}>
        <ThemedText style={[messageThreadStyles.contactName, { color: colors.text }]}>{contactInfo.display_name}</ThemedText>
        <View style={messageThreadStyles.usernameRow}>
          <ThemedText style={[messageThreadStyles.statusText, { color: colors.textSecondary }]}>@{contactInfo.username}</ThemedText>
          <View style={messageThreadStyles.scoreDotContainer}>
            <ScoreDot score={contactInfo.score} size={8} />
          </View>
        </View>
        <View style={messageThreadStyles.statusContainer}>
          {contactInfo.isOnline ? (
            <>
              <View style={[messageThreadStyles.statusDot, { backgroundColor: colors.valide }]} />
              <ThemedText style={[messageThreadStyles.statusText, { color: colors.textSecondary }]}>
                {t("messages.online")}
              </ThemedText>
            </>
          ) : (
            <ThemedText style={[messageThreadStyles.statusText, { color: colors.textSecondary }]}>
              {t("messages.offline")}
            </ThemedText>
          )}
        </View>
      </View>
    </View>
  );
}
