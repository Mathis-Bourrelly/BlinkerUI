import {StyleSheet, Text, TouchableOpacity} from "react-native";
import {useThemeColors} from "@/hooks/useThemeColors";

type Props = {
    title: string;
    onPress: () => void;
    disabled?: boolean;
};

export function ThemedButton({title, onPress, disabled = false}: Props) {
    const colors = useThemeColors();
    const buttonStyles = [
        styles.button,
        {backgroundColor: colors.text}, // Ajustez la couleur selon votre thème
        disabled && styles.disabledButton
    ];

    return (
        <TouchableOpacity style={buttonStyles} onPress={onPress} disabled={disabled}>
            <Text style={[styles.text, {color: colors.background}]}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 20,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 6,
        paddingHorizontal: 16,
    },
    text: {
        fontSize: 16,
        fontWeight: "bold",
    },
    disabledButton: {
        opacity: 0.6,
    }
});
