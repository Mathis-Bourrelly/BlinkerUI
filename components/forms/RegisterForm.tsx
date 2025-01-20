import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedTextInput } from "@/components/base/ThemedTextInput";
import { ThemedButton } from "@/components/base/ThemedButton";
import { useRegisterMutation } from "@/hooks/useRegisterMutation";
import { ThemedText } from "@/components/base/ThemedText";
import {useTranslation} from "react-i18next";

type RegisterFormProps = {
    onMessage: (msg: string) => void;
};

export function RegisterForm({ onMessage }: RegisterFormProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { t } = useTranslation();
    const { mutate, isPending } = useRegisterMutation();

    const handleRegister = () => {
        mutate({ name, email, password }, {
            onSuccess: (data) => onMessage(`Success: ${data.message}`),
            onError: (err: Error) => onMessage(`Error: ${err.message}`),
        });
    };

    return (
        <View style={RegisterFormStyle.form}>
            <ThemedText>{t('screens.login.createAccount')}</ThemedText>
            <ThemedTextInput
                value={name}
                onChangeText={setName}
                placeholder="Name"
            />
            <ThemedTextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
            />
            <ThemedTextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
            />
            <ThemedButton title={t("screens.login.continue")} onPress={handleRegister} />
            {isPending && <ActivityIndicator color={"text"} />}
        </View>
    );
}

const RegisterFormStyle = StyleSheet.create({
    form: {
        marginHorizontal:6,
        alignItems: "center",
    },
});
