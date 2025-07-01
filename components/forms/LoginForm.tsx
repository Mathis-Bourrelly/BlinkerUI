import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedTextInput } from "@/components/base/ThemedTextInput";
import { ThemedText } from "@/components/base/ThemedText";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import { useTranslation } from 'react-i18next';
import { useTheme } from "@/context/ThemeContext";
import { GradientButton } from "@/components/base/GradientButton";
import { useRouter } from "expo-router";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

type LoginFormProps = {
    onMessage: (msg: string) => void;
};

export function LoginForm({ onMessage }: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);

    const router = useRouter();  // Hook pour gérer la navigation
    const { mutate, isPending } = useLoginMutation();
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

        if (!password) {
            setPasswordError('login.fieldPasswordRequired');
            isValid = false;
        } else {
            setPasswordError('');
        }

        return isValid;
    }

    const handleLogin = () => {
        const valid = validateForm();
        if (valid) {
            mutate({ email, password }, {
                onSuccess: (data) => {
                    onMessage(`Success: ${data.message}`);
                    router.push("/")
                },
                onError: (err: Error) => onMessage("ERROR " + t(err.message))
            });
        }
    };

    return (
        <>
            {!isForgotPassword ? (
                <View style={LoginFormStyle.form}>
                    <ThemedText variant="Title">{t('login.login')}</ThemedText>
                    <ThemedTextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder={t('login.email')}
                        errorText={emailError}
                    />
                    <ThemedTextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder={t('login.password')}
                        isPassword={true}
                        errorText={passwordError}
                    />
                    <ThemedText
                        variant={"UnderlineCaption"}
                        color={colors.textSecondary}
                        onPress={() => setIsForgotPassword(true)}
                    >
                        {t('login.forgotPassword')}
                    </ThemedText>
                    <View style={LoginFormStyle.loginButton}>
                        <GradientButton text={t('login.login')} onPress={handleLogin} />
                    </View>
                    {isPending && <ActivityIndicator color={colors.text} />}
                </View>
            ) : (
                <ForgotPasswordForm onMessage={onMessage} />
            )}
        </>
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
