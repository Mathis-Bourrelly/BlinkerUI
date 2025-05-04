import React from "react";
import { Row } from "@/components/base/Row";
import { LanguageDropdown } from "@/components/base/LanguageDropdown";
import { ThemeToggleButton } from "@/components/base/ThemeToggleButton";
import { messageThreadStyles } from "./MessageThreadStyles";

export function MessageThreadFooter() {
  return (
    <Row gap={12} style={messageThreadStyles.settingsRow}>
      <LanguageDropdown />
      <ThemeToggleButton />
    </Row>
  );
}
