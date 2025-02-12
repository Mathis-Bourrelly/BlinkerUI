import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import {Icon} from "@/components/images/Icon";
import {Colors} from "@/constants/Colors";
import {useTheme} from "@/context/ThemeContext";

type ThemedButtonIconProps = {
    text: string;
    onPress: () => void;
    iconName?: string;
    disabled?: boolean;
};

export function ThemedButtonIcon({ text, onPress, iconName, disabled = false }: ThemedButtonIconProps) {
    const {colors} = useTheme();
    return (
        <TouchableOpacity onPress={onPress} disabled={disabled}>
                <View style={styles.content}>
                    {iconName && (
                        <Icon name={iconName} color={colors.text} size={24} />
                    )}
                    <Text style={styles.text}>{text}</Text>
                </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
    },
    text: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 8, // Espacement entre l'icône et le texte
    },
    disabledButton: {
        opacity: 0.6,
    },
});
