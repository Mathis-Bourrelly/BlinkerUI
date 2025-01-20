import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedTextInput } from "@/components/base/ThemedTextInput";
import { ThemedText } from "@/components/base/ThemedText";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import { useTranslation } from 'react-i18next';
import {useTheme} from "@/context/ThemeContext";
import {ThemedButton} from "@/components/base/ThemedButton";


type LoginFormProps = {
    onMessage: (msg: string) => void;
};

export function LoginForm({onMessage}: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { mutate, isPending, isError, error, isSuccess, data } = useLoginMutation();
    const {colors} = useTheme();
    const { t } = useTranslation();

    const handleLogin = () => {
        mutate({ email, password }, {
            onSuccess: (data) => onMessage(`Success: ${data.message}`),
            onError: (err: Error) => onMessage(`Error: ${err.message}`),
        });
    };

    return (
        <View style={LoginFormStyle.form}>
            <ThemedText>{t('screens.login.login')} </ThemedText>
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
