import React from "react";
import { useTranslation } from "react-i18next";
import { ThemedText } from "@/components/base/ThemedText";
import NavBar from "@/components/feature/NavBar";
import { messagesStyles } from "./MessagesStyles";

export function MessagesHeader() {
  const { t } = useTranslation();

  return (
    <>
      <NavBar />
      <ThemedText variant="Title" style={messagesStyles.title}>
        {t("messages.title")}
      </ThemedText>
    </>
  );
}
