import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import {Icon} from "@/components/images/Icon";

type ThemedButtonIconProps = {
    text: string;
    onPress: () => void;
    iconSource?: any; // Source de l'image
    disabled?: boolean;
};

export function ThemedButtonIcon({ text, onPress, iconSource, disabled = false }: ThemedButtonIconProps) {
    return (
        <TouchableOpacity onPress={onPress} disabled={disabled}>
                <View style={styles.content}>
                    {iconSource && (
                        <Icon name="language" size={32} />
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
