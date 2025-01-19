import {StyleSheet, TextInput} from "react-native";
import {useThemeColors} from "@/hooks/useThemeColors";

type Props = {
    value: string;
    onChangeText: (value: string) => void;
    placeholder?: string;
};

export function ThemedTextInput({value, onChangeText, placeholder}: Props) {
    const colors = useThemeColors(); // Appel dynamique dans le composant
    const dynamicStyles = {
        backgroundColor: colors.background,
        color: colors.text,
    };

    return (
        <TextInput
            style={[styles.input, dynamicStyles]}  // Combine styles statiques et dynamiques
            onChangeText={onChangeText}
            value={value}
            placeholder={placeholder}
        />
    );
}

const styles = StyleSheet.create({
    input: {
        borderRadius: 16,
        marginVertical: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
});
