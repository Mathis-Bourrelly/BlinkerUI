import {StyleSheet, Text, type TextProps} from "react-native";
import {useTheme} from "@/context/ThemeContext";
import { Fonts } from "@/constants/Fonts";

const styles = StyleSheet.create({
    Display: Fonts.Display,
    Title: Fonts.Title,
    SubTitle: Fonts.SubTitle,
    Body: Fonts.Body,
    BodyBold: Fonts.BodyBold,
    Caption: Fonts.Caption,
    ButtonText: Fonts.ButtonText,
    Overline: Fonts.Overline,
    Underline: Fonts.Underline,
});

type Props = TextProps & {
    variant?: keyof typeof styles;
    color?: string;
}

export function ThemedText({variant, color, ...rest}: Props) {
    const {colors} = useTheme();
    return <Text style={[styles[variant ?? "Body"], {color: color ?? colors.text}]} {...rest} />;
}

