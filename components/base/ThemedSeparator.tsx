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
            <View style={[containerStyle, { maxWidth }]} {...rest}>
                {/* Barre à gauche */}
                <ThemedSeparator barColor={colors.border} />
                {/* Conteneur pour centrer verticalement le texte */}
                <View style={textContainerStyle}>
                    <ThemedText color={colors.border}>{text}</ThemedText>
                </View>
                {/* Barre à droite */}
                <ThemedSeparator barColor={colors.border} />
            </View>
        );
    } else {
        return (
            <View
                style={[
                    rowStyle,
                    { backgroundColor: barColor ?? colors.text, maxWidth },
                ]}
                {...rest}
            />
        );
    }
}

const containerStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: "50%",
};

const rowStyle: ViewStyle = {
    height: 1,
    width: "100%",
    alignSelf: "center",
};

const textContainerStyle: ViewStyle = {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
};
