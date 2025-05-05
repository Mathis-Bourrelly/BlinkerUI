import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/base/ThemedText";
import { ScoreDot } from "@/components/feature/ScoreDot";
import { messageThreadStyles } from "./MessageThreadStyles";
import { router } from "expo-router";

type ContactInfo = {
  display_name: string;
  username: string;
  avatar_url: string;
  isOnline: boolean;
  score: number;
};

type ContactHeaderProps = {
  contactInfo: ContactInfo;
  userID?: string; // ID de l'utilisateur pour la redirection vers son profil
};

export function ContactHeader({ contactInfo, userID }: ContactHeaderProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Fonction pour naviguer vers le profil de l'utilisateur
  const navigateToProfile = () => {
    if (userID && userID !== "unknown") {
      router.push(`/profile/${userID}`);
    }
  };

  return (
    <View style={[messageThreadStyles.contactHeader, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
      <TouchableOpacity
        onPress={navigateToProfile}
        disabled={!userID || userID === "unknown"}
        activeOpacity={0.7}
        style={messageThreadStyles.contactAvatarContainer}
      >
        <Image
          source={{ uri: contactInfo.avatar_url }}
          style={messageThreadStyles.contactAvatar}
        />
      </TouchableOpacity>
      <View style={messageThreadStyles.contactInfo}>
        <TouchableOpacity
          onPress={navigateToProfile}
          disabled={!userID || userID === "unknown"}
          activeOpacity={0.7}
        >
          <ThemedText style={[messageThreadStyles.contactName, { color: colors.text }]}>{contactInfo.display_name}</ThemedText>
        </TouchableOpacity>
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
