import React from "react";
import { StyleSheet, TextInput, View, TextInputProps } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Fonts } from "@/constants/Fonts";
import { ThemedText } from "@/components/base/ThemedText";
import { useTranslation } from "react-i18next";

type Props = TextInputProps & {
    value: string;
    onChangeText: (value: string) => void;
    placeholder?: string;
    errorText?: string;
    titleText?: string;
};

export function UsernameInput({
    value,
    onChangeText,
    placeholder,
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
            <View
                style={[
                    styles.inputContainer,
                    {
                        borderColor: errorText ? colors.danger : colors.border,
                        backgroundColor: colors.background,
                    },
                ]}
            >
                <ThemedText style={styles.prefix}>@</ThemedText>
                <TextInput
                    style={[
                        styles.input,
                        {
                            color: colors.text,
                        },
                        rest.multiline ? styles.multiline : {},
                        rest.style,
                    ]}
                    onChangeText={onChangeText}
                    value={value}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textSecondary}
                    {...rest}
                />
            </View>
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
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 30,
        marginBottom: 8,
        marginTop: 4,
        paddingHorizontal: 12,
        borderWidth: 1,
        width: "100%",
    },
    input: {
        ...Fonts.Body,
        flex: 1,
        paddingVertical: 6,
    },
    prefix: {
        ...Fonts.Body,
        marginRight: 4,
        fontWeight: "bold",
    },
    inputTitle: {
        alignSelf: "flex-start",
        marginStart: 14,
    },
    multiline: {
        textAlignVertical: "top",
    },
});
