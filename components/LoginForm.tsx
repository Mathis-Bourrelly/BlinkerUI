import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import {useThemeColors} from "@/hooks/useThemeColors";
import { useTranslation } from 'react-i18next';


type LoginFormProps = {
    onMessage: (msg: string) => void;
};

export function LoginForm({onMessage}: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { mutate, isPending, isError, error, isSuccess, data } = useLoginMutation();
    const colors = useThemeColors();
    const { t, i18n } = useTranslation();

    const handleLogin = () => {
        mutate({ email, password }, {
            onSuccess: (data) => onMessage(`Success: ${data.message}`),
            onError: (err: Error) => onMessage(`Error: ${err.message}`),
        });
    };

    return (
        <View style={LoginFormStyle.form}>
            <ThemedText>Connexion</ThemedText>
            <ThemedTextInput value={email} onChangeText={setEmail} placeholder={t('screens.login.email')} />
            <ThemedTextInput value={password} onChangeText={setPassword} placeholder={t('screens.login.password')}/>
            <ThemedButton title="Submit" onPress={handleLogin} />
            {isPending && <ActivityIndicator color="text" />}
        </View>
    );
}

const LoginFormStyle = StyleSheet.create({
    form: {
        marginHorizontal:6,
        alignItems: "center",
    },
});
