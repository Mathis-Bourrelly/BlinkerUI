import React from "react";
import { View, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { InnerContainer } from "@/components/base/InnerContainer";
import { Row } from "@/components/base/Row";
import { LanguageDropdown } from "@/components/base/LanguageDropdown";
import { ThemeToggleButton } from "@/components/base/ThemeToggleButton";
import NavBar from "@/components/feature/NavBar";
import TabBar from "@/components/feature/TabBar";
import { messageThreadStyles } from "./MessageThreadStyles";

export function MessageThreadLoadingState() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen />
      <SafeAreaView style={messageThreadStyles.container}>
        <LinearGradient colors={colors.gradient} style={messageThreadStyles.background}>
          <InnerContainer>
            <NavBar />
            <View style={messageThreadStyles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
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
