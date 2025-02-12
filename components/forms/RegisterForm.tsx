import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedTextInput } from "@/components/base/ThemedTextInput";
import { GradientButton } from "@/components/base/GradientButton";
import { useRegisterMutation } from "@/hooks/useRegisterMutation";
import { ThemedText } from "@/components/base/ThemedText";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

type RegisterFormProps = {
    onMessage: (msg: string) => void;
};

export function RegisterForm({ onMessage }: RegisterFormProps) {
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState("");

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    const { t } = useTranslation();
    const { mutate, isPending } = useRegisterMutation();
    const { colors } = useTheme();
    const router = useRouter();

    function validateForm(): boolean {
        let isValid = true;

        if (!name) {
            setNameError('login.fieldNameRequired');
            isValid = false;
        } else {
            setNameError('');
        }

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
        } else if (!PASSWORD_REGEX.test(password)) {
            setPasswordError('login.passwordInvalid');
            isValid = false;
        } else {
            setPasswordError('');
        }

        if (!confirmPassword) {
            setConfirmPasswordError('login.fieldConfirmPasswordRequired');
            isValid = false;
        } else if (confirmPassword !== password) {
            setConfirmPasswordError('login.passwordsDoNotMatch');
            isValid = false;
        } else {
            setConfirmPasswordError('');
        }

        return isValid;
    }

    const handleRegister = () => {
        const valid = validateForm();
        if (valid) {
            mutate({ name, email, password }, {
                onSuccess: (data) => {
                    onMessage(`Success: ${data.message}`);
                    router.push("/");
                },
                onError: (err: Error) => onMessage(`Error: ${t(err.message)}`),
            });
        }
    };

    return (
        <View style={RegisterFormStyle.form}>
            <ThemedText variant="Title">{t('login.createAccount')}</ThemedText>
            <ThemedTextInput value={name} onChangeText={setName} placeholder={t("login.name")} errorText={nameError} />
            <ThemedTextInput value={email} onChangeText={setEmail} placeholder={t("login.email")} errorText={emailError} />
            <ThemedTextInput value={password} onChangeText={setPassword} placeholder={t("login.password")} isPassword={true} errorText={passwordError} />
            <ThemedTextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder={t("login.confirmPassword")} isPassword={true} errorText={confirmPasswordError} />
            <View style={RegisterFormStyle.registerButton}>
            <GradientButton text={t("login.continue")} onPress={handleRegister} />
            </View>
                {isPending && <ActivityIndicator color={colors.text} />}
        </View>
    );
}

const RegisterFormStyle = StyleSheet.create({
    form: {
        marginHorizontal: 6,
        alignItems: "center",
        width: "100%",
        maxWidth: 300,
        flex:1
    },
    registerButton: {
        marginTop: 40,
        marginBottom: 20,
        width: "100%",
    }
});
