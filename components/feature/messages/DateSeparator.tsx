import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/base/ThemedText";

type DateSeparatorProps = {
  date: string;
};

export function DateSeparator({ date }: DateSeparatorProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
      <View style={[styles.dateContainer, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.dateText, { color: colors.textSecondary }]}>
          {date}
        </ThemedText>
      </View>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    width: "100%",
  },
  line: {
    flex: 1,
    height: 1,
  },
  dateContainer: {
    paddingHorizontal: 10,
    marginHorizontal: 5,
    borderRadius: 10,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
