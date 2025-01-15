import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { useRegisterMutation } from "@/hooks/useRegisterMutation";
import { useThemeColors } from "@/hooks/useThemeColors";

export function RegisterForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("user");

    const { mutate, isPending, isError, error, isSuccess, data } = useRegisterMutation();

    const handleRegister = () => {
        mutate({ email, password, name, role });
    };

    return (
        <View style={RegisterFormStyle.form}>
            <ThemedText variant={"Title"} color={"text"}> Enregistrement </ThemedText>
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
            <ThemedTextInput
                value={name}
                onChange={(text) => setName(text)}
                placeholder="Name"
            />
            <ThemedTextInput
                value={role}
                onChange={(text) => setRole(text)}
                placeholder="Role (optional)"
            />
            <ThemedButton title="Register" onPress={handleRegister} />
            {isPending && <ActivityIndicator color="text" />}
            {isError && <ThemedText>{`Error: ${error.message}`}</ThemedText>}
            {isSuccess && <ThemedText color="valide">{data?.message}</ThemedText>}
        </View>
    );
}

const RegisterFormStyle = StyleSheet.create({
    form: {
        width: "80%",
        justifyContent: "center",
        alignItems: "center",
    },
});
