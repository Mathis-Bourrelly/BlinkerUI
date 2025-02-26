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
// Pour le username : lettres, chiffres, underscore, tiret ; pas d'espaces, 1 à 50 caractères
const USERNAME_REGEX = /^[A-Za-z0-9_-]{1,50}$/;
// Longueur max du display_name : 255 caractères
const DISPLAY_NAME_MAX_LENGTH = 255;

type RegisterFormProps = {
    onMessage: (msg: string) => void;
};

export function RegisterForm({ onMessage }: RegisterFormProps) {
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState("");

    const [displayName, setDisplayName] = useState("");
    const [displayNameError, setDisplayNameError] = useState("");

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

        // Validation du username
        if (!username) {
            setUsernameError('login.fieldUsernameRequired');
            isValid = false;
        } else if (!USERNAME_REGEX.test(username)) {
            setUsernameError('login.invalidUsername');
            isValid = false;
        } else {
            setUsernameError('');
        }

        // Validation du display_name
        if (!displayName) {
            setDisplayNameError('login.fieldDisplayNameRequired');
            isValid = false;
        } else if (displayName.length > DISPLAY_NAME_MAX_LENGTH) {
            setDisplayNameError('login.displayNameTooLong');
            isValid = false;
        } else {
            setDisplayNameError('');
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
            mutate({ username, display_name: displayName, email, password }, {
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
            <ThemedTextInput
                value={username}
                onChangeText={setUsername}
                placeholder={t("login.username")}
                errorText={usernameError}
            />
            <ThemedTextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder={t("login.displayName")}
                errorText={displayNameError}
            />
            <ThemedTextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t("login.email")}
                errorText={emailError}
            />
            <ThemedTextInput
                value={password}
                onChangeText={setPassword}
                placeholder={t("login.password")}
                isPassword={true}
                errorText={passwordError}
            />
            <ThemedTextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t("login.confirmPassword")}
                isPassword={true}
                errorText={confirmPasswordError}
            />
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
        flex: 1,
    },
    registerButton: {
        marginTop: 40,
        marginBottom: 20,
        width: "100%",
    },
});
