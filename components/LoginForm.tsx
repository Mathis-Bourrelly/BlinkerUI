import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import { Colors } from "@/constants/Colors";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Utilisation du hook de mutation
    const { mutate,isPending, isError, error , isSuccess, data} = useLoginMutation();

    const handleLogin = () => {
        mutate({ email, password });
    };

    return (
        <View style={LoginFormStyle.form}>
            <ThemedTextInput
                value={email}
                onChange={(text) => setEmail(text)}
                placeholder="Email"
            />
            <ThemedTextInput
                value={password}
                onChange={(text) => setPassword(text)}
                placeholder="Password"
            />
            <ThemedButton title="Submit" onPress={handleLogin} />
            {isPending && <ActivityIndicator color={Colors.light.text} />}
            {isError && <ThemedText>{`Error: ${error.message}`}</ThemedText>}
            {isSuccess && <ThemedText>{data?.token}</ThemedText>}
        </View>
    );
}

const LoginFormStyle = StyleSheet.create({
    form: {
        width: "80%",
        justifyContent: "center",
        alignItems: "center",
    },
});
