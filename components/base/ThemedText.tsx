import {StyleSheet, Text, type TextProps} from "react-native";
import {useTheme} from "@/context/ThemeContext";


const styles = StyleSheet.create({
    Title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    SubTitle: {
        fontSize: 12,
        fontWeight: "bold",
    }
})

type Props = TextProps & {
    variant?: keyof typeof styles;
    color?: string;
}

export function ThemedText({variant, color, ...rest}: Props) {
    const {colors} = useTheme();
    return <Text style={[styles[variant ?? "Title"], {color: color ?? colors.text}]} {...rest} />;
}

