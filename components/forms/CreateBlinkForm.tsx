import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { ThemedText } from "../base/ThemedText";
import { ThemedButtonIcon } from "@/components/base/ThemedButtonIcon";
import { Icon } from "@/components/images/Icon";
import { useTheme } from "@/context/ThemeContext";
import { ThemedTextInput } from "@/components/base/ThemedTextInput";

// Définition du type pour un bloc de contenu
type ContentBlock = {
    contentID: string;
    contentType: "text" | "image" | "video";
    content: string;
    position: number;
};

const CreateBlinkForm = () => {
    const { colors } = useTheme();

    const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);

    // Fonction pour ajouter un nouveau bloc en fin de liste
    const addBlock = (type: "text" | "image" | "video") => {
        const newBlock: ContentBlock = {
            contentID: Date.now().toString(),
            contentType: type,
            content: "",
            position: contentBlocks.length + 1,
        };
        setContentBlocks([...contentBlocks, newBlock]);
    };

    // Mettre à jour le contenu d'un bloc
    const updateBlockContent = (id: string, newContent: string) => {
        setContentBlocks((prevBlocks) =>
            prevBlocks.map((block) =>
                block.contentID === id ? { ...block, content: newContent } : block
            )
        );
    };

    // Déplacer un bloc vers le haut
    const moveBlockUp = (index: number) => {
        if (index === 0) return;
        const newBlocks = [...contentBlocks];
        [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
        newBlocks.forEach((block, idx) => (block.position = idx + 1));
        setContentBlocks(newBlocks);
    };

    // Déplacer un bloc vers le bas
    const moveBlockDown = (index: number) => {
        if (index === contentBlocks.length - 1) return;
        const newBlocks = [...contentBlocks];
        [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
        newBlocks.forEach((block, idx) => (block.position = idx + 1));
        setContentBlocks(newBlocks);
    };

    // Soumettre le formulaire en créant un objet Blink
    const handleSubmit = () => {
        const blink = {
            blinkID: Date.now().toString(),
            userID: "userID-placeholder",
            likeCount: 0,
            dislikeCount: 0,
            commentCount: 0,
            shareCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            contents: contentBlocks,
            profile: {
                display_name: "Nom de l'utilisateur",
                username: "username",
                avatar_url: `${process.env.EXPO_PUBLIC_API_URL}/uploads/default_user.png`,
            },
        };

        console.log("Blink créé :", blink);
        // Ici, vous pouvez envoyer "blink" à votre API
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <ThemedText>Créer un Blink</ThemedText>
            <View style={styles.buttonContainer}>
                <ThemedButtonIcon text={"Texte"} iconName={"text"} onPress={() => addBlock("text")} />
                <ThemedButtonIcon text={"Image"} iconName={"image"} onPress={() => addBlock("image")} />
                <ThemedButtonIcon text={"Vidéo"} iconName={"video"} onPress={() => addBlock("video")} />
            </View>

            {contentBlocks.map((block, index) => (
                <View key={block.contentID} style={styles.blockContainer}>
                    <ThemedText>
                        {block.contentType.toUpperCase()} - Position {block.position}
                    </ThemedText>
                    <ThemedTextInput
                        placeholder={`Entrez le contenu pour ce bloc ${block.contentType}`}
                        value={block.content}
                        onChangeText={(text) => updateBlockContent(block.contentID, text)}
                        // Utilisation d'un champ de saisie multiligne pour le texte
                        multiline={block.contentType === "text"}
                        style={[
                            styles.input,
                            block.contentType === "text" && styles.textArea,
                        ]}
                    />
                    <View style={styles.reorderButtons}>
                        <TouchableOpacity onPress={() => moveBlockUp(index)}>
                            <Icon name={"chevron-up"} size={24} color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => moveBlockDown(index)}>
                            <Icon name={"chevron-down"} size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            ))}

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <ThemedText>Créer le Blink</ThemedText>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 20,
    },
    blockContainer: {
        marginBottom: 15,
        padding: 10,
        borderWidth: 1,
        borderColor: "#d8d8d8",
        borderRadius: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 8,
        borderRadius: 5,
        marginBottom: 10,
    },
    // Style spécifique pour le champ multiligne
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    reorderButtons: {
        flexDirection: "row",
        justifyContent: "center",
    },
    submitButton: {
        backgroundColor: "#28a745",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
    },
});

export default CreateBlinkForm;
