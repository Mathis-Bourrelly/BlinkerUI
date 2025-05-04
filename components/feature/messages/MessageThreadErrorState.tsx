import React from "react";
import { View } from "react-native";
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
import { messageThreadStyles } from "./MessageThreadStyles";

export function MessageThreadErrorState() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen />
      <SafeAreaView style={messageThreadStyles.container}>
        <LinearGradient colors={colors.gradient} style={messageThreadStyles.background}>
          <InnerContainer>
            <NavBar />
            <View style={messageThreadStyles.errorContainer}>
              <ThemedText style={{ color: colors.danger }}>{t("messages.errorLoading")}</ThemedText>
            </View>
            <Row gap={12} style={messageThreadStyles.settingsRow}>
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
