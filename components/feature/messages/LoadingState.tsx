import React from "react";
import { View, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/base/ThemedText";
import { InnerContainer } from "@/components/base/InnerContainer";
import { Row } from "@/components/base/Row";
import { LanguageDropdown } from "@/components/base/LanguageDropdown";
import { ThemeToggleButton } from "@/components/base/ThemeToggleButton";
import NavBar from "@/components/feature/NavBar";
import TabBar from "@/components/feature/TabBar";
import { messagesStyles } from "./MessagesStyles";

export function LoadingState() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen />
      <SafeAreaView style={messagesStyles.container}>
        <LinearGradient colors={colors.gradient} style={messagesStyles.background}>
          <InnerContainer>
            <NavBar />
            <ThemedText variant="Title" style={messagesStyles.title}>
              {t("messages.title")}
            </ThemedText>
            <View style={messagesStyles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
            <Row gap={12}>
              <LanguageDropdown />
              <ThemeToggleButton />
            </Row>
          </InnerContainer>
        </LinearGradient>
        <TabBar />
      </SafeAreaView>
    </>
  );
}
