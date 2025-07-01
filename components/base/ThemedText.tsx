import {StyleSheet, Text, type TextProps} from "react-native";
import {useTheme} from "@/context/ThemeContext";
import { Fonts } from "@/constants/Fonts";

const styles = StyleSheet.create({
    Display: Fonts.Display,
    LandingTitle: Fonts.LandingTitle,
    Title: Fonts.Title,
    SubTitle: Fonts.SubTitle,
    Body: Fonts.Body,
    BodyBold: Fonts.BodyBold,
    Caption: Fonts.Caption,
    ButtonText: Fonts.ButtonText,
    Overline: Fonts.Overline,
    Underline: Fonts.Underline,
    UnderlineCaption: Fonts.UnderlineCaption,
});

type Props = TextProps & {
    variant?: keyof typeof styles;
    color?: string;
}

export function ThemedText({variant, color, style, ...rest}: Props) {
    const {colors} = useTheme();
    // Fusionner les styles pour s'assurer que la couleur du texte est toujours appliquée
    const textStyle = [
        styles[variant ?? "Body"],
        {color: color ?? colors.text},
        style // Permettre aux styles personnalisés de remplacer la couleur si nécessaire
    ];
    return <Text style={textStyle} {...rest} />;
}

