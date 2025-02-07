import {StyleSheet, TextInput} from "react-native";
import {useTheme} from "@/context/ThemeContext";
import {Fonts} from "@/constants/Fonts";
import {ThemedText} from "@/components/base/ThemedText";
import {useTranslation} from "react-i18next";
const { t } = useTranslation();

type Props = {
    value: string;
    onChangeText: (value: string) => void;
    placeholder?: string;
    isPassword?: boolean;
    errorText?: string;
};

export function ThemedTextInput({value, onChangeText, placeholder, isPassword, errorText}: Props) {
    const {colors} = useTheme(); // Appel dynamique dans le composant
    const dynamicStyles = {
        backgroundColor: colors.card,
        color: colors.text,
        borderColor: colors.border,
        isPassword: isPassword,
        errorText: errorText
    };

    return (
        <>
            <TextInput
                style={[styles.input, dynamicStyles]}  // Combine styles statiques et dynamiques
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
        marginVertical: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 3,
    },
});
