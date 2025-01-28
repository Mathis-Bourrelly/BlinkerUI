import { useState } from "react";
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
    const [password, setPassword] = useState("");
    const router = useRouter();  // Hook pour gérer la navigation
    const { mutate, isPending } = useLoginMutation();
    const { colors } = useTheme();
    const { t } = useTranslation();

    const handleLogin = () => {
        mutate({ email, password }, {
            onSuccess: (data) => {
                onMessage(`Success: ${data.message}`);
                router.replace("/");  // Redirection après succès
            },
            onError: (err: Error) => onMessage(`Error: ${err.message}`),
        });
    };

    return (
        <View style={LoginFormStyle.form}>
            <ThemedText variant="Title">{t('screens.login.login')}</ThemedText>
            <ThemedTextInput value={email} onChangeText={setEmail} placeholder={t('screens.login.email')} />
            <ThemedTextInput value={password} onChangeText={setPassword} placeholder={t('screens.login.password')} isPassword={true} />
            <GradientButton text={t('screens.login.login')} onPress={handleLogin} />
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
