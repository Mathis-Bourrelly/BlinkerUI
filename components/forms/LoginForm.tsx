import {useEffect, useState} from "react";
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedTextInput } from "@/components/base/ThemedTextInput";
import { ThemedText } from "@/components/base/ThemedText";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import { useTranslation } from 'react-i18next';
import { useTheme } from "@/context/ThemeContext";
import { GradientButton } from "@/components/base/GradientButton";
import { useRouter } from "expo-router";

type LoginFormProps = {
    onMessage: (msg: string) => void;
};

export function LoginForm({ onMessage }: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("")

    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("")

    const [isFormValid, setIsFormValid] = useState(false);

    const router = useRouter();  // Hook pour gérer la navigation
    const { mutate, isPending } = useLoginMutation();
    const { colors } = useTheme();
    const { t } = useTranslation();


    function validateForm() {
        let errors = {};

        if (!email) {
            setEmailError('login.fieldEmailRequired')
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('login.invalidEmail')
        }

        if (!password) {
            setPasswordError('login.fieldPasswordRequired')
        }
        setIsFormValid(Object.keys(errors).length === 0);
    }

    const handleLogin = () => {
        validateForm()
        if (isFormValid) {
            setEmailError("")
            setPasswordError("")
            mutate({email, password}, {
                onSuccess: (data) => {
                    onMessage(`Success: ${data.message}`);
                    router.replace("/");  // Redirection après succès
                },
                onError: (err) => onMessage("ERROR" + t(err.message))
            });
        }
    };

    return (
        <View style={LoginFormStyle.form}>
            <ThemedText variant="Title">{t('login.login')}</ThemedText>
            <ThemedTextInput value={email} onChangeText={setEmail} placeholder={t('login.email')} errorText={emailError}/>
            <ThemedTextInput value={password} onChangeText={setPassword} placeholder={t('login.password')} isPassword={true} errorText={passwordError}/>
            <GradientButton text={t('login.login')} onPress={handleLogin} />
            {isPending && <ActivityIndicator color={colors.text} />}
        </View>
    );
}

const LoginFormStyle = StyleSheet.create({
    form: {
        marginHorizontal: 6,
        alignItems: "center",
    },
});
