import {StyleSheet, TextInput} from "react-native";
import {useTheme} from "@/context/ThemeContext";
import {Fonts} from "@/constants/Fonts";
import {ThemedText} from "@/components/base/ThemedText";
import {useTranslation} from "react-i18next";


type Props = {
    value: string;
    onChangeText: (value: string) => void;
    placeholder?: string;
    isPassword?: boolean;
    errorText?: string;
    titleText?: string;
};

export function ThemedTextInput({value, onChangeText, placeholder, isPassword, errorText, titleText}: Props) {
    const {colors} = useTheme();
    const { t } = useTranslation();
    const dynamicText = {
        color: colors.text,
        borderColor: colors.border,
        isPassword: isPassword,
        errorText: errorText,
        titleText: errorText
    };
    const dynamicBackground = {
        backgroundColor: colors.background,
    };

    return (
        <>
            {titleText && (
                <ThemedText style={[styles.inputTitle, dynamicText]} variant={"Body"} color={colors.text}>{titleText}</ThemedText>
            )}
            <TextInput
                style={[styles.input, dynamicText, dynamicBackground]}  // Combine styles statiques et dynamiques
                onChangeText={onChangeText}
                value={value}
                placeholder={placeholder}
                placeholderTextColor={colors.textSecondary}  // Utiliser une couleur thématique pour le placeholder
                secureTextEntry={isPassword ?? false}
            />
            {errorText && (
                <ThemedText variant={"Body"} color={colors.danger}><ThemedText variant={"BodyBold"} color={colors.danger}>{t('base.error')}</ThemedText> : {t(errorText)}</ThemedText>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    input: {
        ...Fonts.Body,  // Utilise le style défini dans Fonts
        borderRadius: 30,
        marginBottom: 8,
        marginTop: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        width: "100%",
    },
    inputTitle: {
        alignSelf: "flex-start",
        marginStart: 14
    }
});
