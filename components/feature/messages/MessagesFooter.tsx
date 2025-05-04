import React from "react";
import { Row } from "@/components/base/Row";
import { LanguageDropdown } from "@/components/base/LanguageDropdown";
import { ThemeToggleButton } from "@/components/base/ThemeToggleButton";

export function MessagesFooter() {
  return (
    <Row gap={12}>
      <LanguageDropdown />
      <ThemeToggleButton />
    </Row>
  );
}
