import React from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Fonts } from "@/constants/Fonts";
import { ThemedText } from "@/components/base/ThemedText";
import { useTranslation } from "react-i18next";

type Props = TextInputProps & {
    value: string;
    onChangeText: (value: string) => void;
    placeholder?: string;
    isPassword?: boolean;
    errorText?: string;
    titleText?: string;
};

export function ThemedTextInput({
                                    value,
                                    onChangeText,
                                    placeholder,
                                    isPassword,
                                    errorText,
                                    titleText,
                                    ...rest
                                }: Props) {
    const { colors } = useTheme();
    const { t } = useTranslation();

    return (
        <>
            {titleText && (
                <ThemedText
                    style={styles.inputTitle}
                    variant="Body"
                    color={colors.text}
                >
                    {titleText}
                </ThemedText>
            )}
            <TextInput
                style={[
                    styles.input,
                    {
                        // On force ici la couleur du texte via le thème
                        color: colors.text,
                        borderColor: errorText ? colors.danger : colors.border,
                        backgroundColor: colors.background,
                    },
                    rest.multiline ? styles.multiline : {},
                    rest.style,
                ]}
                onChangeText={onChangeText}
                value={value}
                placeholder={placeholder}
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={isPassword ?? false}
                {...rest}
            />
            {errorText && (
                <ThemedText variant="Body" color={colors.danger}>
                    <ThemedText variant="BodyBold" color={colors.danger}>
                        {t("base.error")}
                    </ThemedText>
                    : {t(errorText)}
                </ThemedText>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    input: {
        ...Fonts.Body,
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
        marginStart: 14,
    },
    multiline: {
        textAlignVertical: "top",
    },
});
