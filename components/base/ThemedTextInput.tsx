import {StyleSheet, TextInput} from "react-native";
import {useTheme} from "@/context/ThemeContext";
import {Fonts} from "@/constants/Fonts";

type Props = {
    value: string;
    onChangeText: (value: string) => void;
    placeholder?: string;
};

export function ThemedTextInput({value, onChangeText, placeholder}: Props) {
    const {colors} = useTheme(); // Appel dynamique dans le composant
    const dynamicStyles = {
        backgroundColor: colors.card,
        color: colors.text,
        borderColor: colors.border,
    };

    return (
        <TextInput
            style={[styles.input, dynamicStyles]}  // Combine styles statiques et dynamiques
            onChangeText={onChangeText}
            value={value}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}  // Utiliser une couleur thématique pour le placeholder
        />
    );
}

const styles = StyleSheet.create({
    input: {
        ...Fonts.Body,  // Utilise le style défini dans Fonts
        borderRadius: 30,
        marginVertical: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 3,
    },
});
