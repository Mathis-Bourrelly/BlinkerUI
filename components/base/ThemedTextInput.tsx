import React, { useState } from "react";
import { StyleSheet, TextInput, TextInputProps, View, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Fonts } from "@/constants/Fonts";
import { ThemedText } from "@/components/base/ThemedText";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/images/Icon";

type Props = TextInputProps & {
    value: string;
    onChangeText: (value: string) => void;
    placeholder?: string;
    isPassword?: boolean;
    errorText?: string;
    titleText?: string;
    showPasswordRules?: boolean;
};

export function ThemedTextInput({
                                    value,
                                    onChangeText,
                                    placeholder,
                                    isPassword,
                                    errorText,
                                    titleText,
                                    showPasswordRules = false,
                                    ...rest
                                }: Props) {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [passwordVisible, setPasswordVisible] = useState(false);

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
            <View style={styles.inputContainer}>
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
                    secureTextEntry={isPassword && !passwordVisible}
                    {...rest}
                />
                {isPassword && (
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setPasswordVisible(!passwordVisible)}
                    >
                        <Icon
                            name={passwordVisible ? "invisible" : "visible"}
                            size={24}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {errorText && (
                <View>
                    <ThemedText variant="Body" color={colors.danger}>
                        <ThemedText variant="BodyBold" color={colors.danger}>
                            {t("base.error")}
                        </ThemedText>
                        : {t(errorText)}
                    </ThemedText>
                    {showPasswordRules && errorText === 'login.passwordInvalid' && (
                        <PasswordRules password={value} />
                    )}
                </View>
            )}
        </>
    );
}

// Composant pour afficher les règles de mot de passe avec des indicateurs visuels
function PasswordRules({ password }: { password: string }) {
    const { colors } = useTheme();
    const { t } = useTranslation();

    // Vérification des règles de mot de passe
    const hasMinLength = password.length >= 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);

    // Style pour les indicateurs de règles
    const getIndicatorStyle = (isValid: boolean) => ({
        color: isValid ? colors.valide : colors.danger,
    });

    return (
        <View style={styles.rulesContainer}>
            <ThemedText variant="Caption" style={styles.rulesTitle}>{t('login.passwordRules')}</ThemedText>
            <View style={styles.ruleItem}>
                <ThemedText variant="Caption" style={getIndicatorStyle(hasMinLength)}>
                    {hasMinLength ? '✓' : '✗'}
                </ThemedText>
                <ThemedText variant="Caption" style={[styles.ruleText, getIndicatorStyle(hasMinLength)]}>
                    {t('login.passwordRuleLength')}
                </ThemedText>
            </View>
            <View style={styles.ruleItem}>
                <ThemedText variant="Caption" style={getIndicatorStyle(hasUpperCase)}>
                    {hasUpperCase ? '✓' : '✗'}
                </ThemedText>
                <ThemedText variant="Caption" style={[styles.ruleText, getIndicatorStyle(hasUpperCase)]}>
                    {t('login.passwordRuleUppercase')}
                </ThemedText>
            </View>
            <View style={styles.ruleItem}>
                <ThemedText variant="Caption" style={getIndicatorStyle(hasLowerCase)}>
                    {hasLowerCase ? '✓' : '✗'}
                </ThemedText>
                <ThemedText variant="Caption" style={[styles.ruleText, getIndicatorStyle(hasLowerCase)]}>
                    {t('login.passwordRuleLowercase')}
                </ThemedText>
            </View>
            <View style={styles.ruleItem}>
                <ThemedText variant="Caption" style={getIndicatorStyle(hasNumber)}>
                    {hasNumber ? '✓' : '✗'}
                </ThemedText>
                <ThemedText variant="Caption" style={[styles.ruleText, getIndicatorStyle(hasNumber)]}>
                    {t('login.passwordRuleNumber')}
                </ThemedText>
            </View>
            <View style={styles.ruleItem}>
                <ThemedText variant="Caption" style={getIndicatorStyle(hasSpecialChar)}>
                    {hasSpecialChar ? '✓' : '✗'}
                </ThemedText>
                <ThemedText variant="Caption" style={[styles.ruleText, getIndicatorStyle(hasSpecialChar)]}>
                    {t('login.passwordRuleSpecial')}
                </ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        position: 'relative',
        width: '100%',
        marginBottom: 8,
        marginTop: 4,
    },
    input: {
        ...Fonts.Body,
        borderRadius: 30,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        width: "100%",
        paddingRight: 40, // Espace pour l'icône
    },
    eyeIcon: {
        position: 'absolute',
        right: 10,
        top: '50%',
        transform: [{ translateY: -12 }], // Moitié de la hauteur de l'icône
    },
    inputTitle: {
        alignSelf: "flex-start",
        marginStart: 14,
    },
    multiline: {
        textAlignVertical: "top",
    },
    rulesContainer: {
        marginTop: 8,
        marginLeft: 8,
    },
    rulesTitle: {
        marginBottom: 4,
        fontWeight: 'bold',
    },
    ruleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
    },
    ruleText: {
        marginLeft: 4,
    },
});
