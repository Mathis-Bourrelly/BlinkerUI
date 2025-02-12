import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedTextInput } from "@/components/base/ThemedTextInput";
import { ThemedText } from "@/components/base/ThemedText";
import { useTranslation } from 'react-i18next';
import { useTheme } from "@/context/ThemeContext";
import { GradientButton } from "@/components/base/GradientButton";
import { useRouter } from "expo-router";
import { usePostMutation } from "@/hooks/usePostMutation";

type ForgotPasswordFormProps = {
    onMessage: (msg: string) => void;
};

export function ForgotPasswordForm({ onMessage }: ForgotPasswordFormProps) {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const router = useRouter();
    const { mutate, isPending } = usePostMutation();
    const { colors } = useTheme();
    const { t } = useTranslation();

    function validateForm(): boolean {
        let isValid = true;

        if (!email) {
            setEmailError('login.fieldEmailRequired');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('login.invalidEmail');
            isValid = false;
        } else {
            setEmailError('');
        }

        return isValid;
    }

    const handleForm = () => {
        const valid = validateForm();
        if (valid) {
            mutate(
                {
                    path: '/forgot-password',
                    body: { email },
                },
                {
                    onSuccess: (data) => {
                        onMessage(`Success: ${data.message}`);
                        //router.push("/");  // Redirige vers la page d'accueil après le succès
                    },
                    onError: (err: Error) => {
                        onMessage(`ERROR: ${t(err.message)}`);
                    },
                }
            );
        }
    };

    return (
        <View style={LoginFormStyle.form}>
            <ThemedText variant="Title">{t('login.passwordForgotten')}</ThemedText>
            <ThemedTextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t('login.email')}
                errorText={emailError}
            />
            <ThemedText
                variant={"UnderlineCaption"}
                color={colors.textSecondary}
                onPress={() => router.push("/login")}
            >
                {t('base.return')}
            </ThemedText>
            <View style={LoginFormStyle.loginButton}>
                <GradientButton text={t('login.continue')} onPress={handleForm} />
            </View>
            {isPending && <ActivityIndicator color={colors.text} />}
        </View>
    );
}

const LoginFormStyle = StyleSheet.create({
    form: {
        marginHorizontal: 6,
        alignItems: "center",
        width: "100%",
        maxWidth: 300,
        flex: 1
    },
    loginButton: {
        marginTop: 40,
        marginBottom: 20,
        width: "100%",
    }
});
