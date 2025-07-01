import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/base/ThemedText";
import { ScoreDot } from "@/components/feature/ScoreDot";
import { messageThreadStyles } from "./MessageThreadStyles";
import { router } from "expo-router";
import { Icon } from "@/components/images/Icon";

type ContactInfo = {
  display_name: string;
  username: string;
  avatar_url: string;
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

  // Fonction pour retourner à la liste des messages
  const navigateToMessagesList = () => {
    router.push('/messages');
  };

  return (
    <View style={[messageThreadStyles.contactHeader, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
      {/* Bouton de retour */}
      <TouchableOpacity
        onPress={navigateToMessagesList}
        activeOpacity={0.7}
        style={messageThreadStyles.backButtonContainer}
      >
        <Icon name="left" size={24} color={colors.text} />
      </TouchableOpacity>

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
        {/* Statut de connexion supprimé car il n'y a pas de système de connexion actuellement */}
      </View>
    </View>
  );
}
