import { useTheme } from "@/context/ThemeContext";
import { View, ViewProps, ViewStyle } from "react-native";
import { ThemedText } from "@/components/base/ThemedText";

type Props = ViewProps & {
    barColor?: string;
    text?: string;
    maxWidth?: number;
};

export function ThemedSeparator({ barColor, text, maxWidth, ...rest }: Props) {
    const { colors } = useTheme();

    if (text) {
        return (
            <View style={[containerStyle, { maxWidth: maxWidth }]}>
                <ThemedSeparator barColor={colors.border} />
                <ThemedText color={colors.border}> {text} </ThemedText>
                <ThemedSeparator barColor={colors.border} />
            </View>
        );
    } else {
        return (
            <View style={[rowStyle, { backgroundColor: barColor ?? colors.text }]} {...rest}></View>
        );
    }
}

const containerStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
};

const rowStyle: ViewStyle = {
    height: 1,
    flex: 1,
};
