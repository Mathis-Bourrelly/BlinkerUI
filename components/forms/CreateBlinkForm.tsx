import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView, StyleSheet, Modal, Alert } from "react-native";
import { ThemedText } from "../base/ThemedText";
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

interface CreateBlinkFormProps {
    onSuccess?: () => void;
}

const CreateBlinkForm: React.FC<CreateBlinkFormProps> = ({ onSuccess }) => {
    const { colors } = useTheme();

    const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
    const [showConfirmation, setShowConfirmation] = useState(false);

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

        // Appeler le callback onSuccess si fourni
        if (onSuccess) {
            onSuccess();
        }
    };

    // Gérer l'annulation de la création
    const handleCancel = () => {
        // Si des blocs ont été ajoutés, afficher la confirmation
        if (contentBlocks.length > 0) {
            setShowConfirmation(true);
        } else {
            // Sinon, fermer directement la modal
            if (onSuccess) {
                onSuccess();
            }
        }
    };

    // Confirmer l'annulation
    const confirmCancel = () => {
        setShowConfirmation(false);
        if (onSuccess) {
            onSuccess();
        }
    };

    // Annuler l'annulation (continuer l'édition)
    const cancelConfirmation = () => {
        setShowConfirmation(false);
    };

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={true}>
            <View style={styles.instructionContainer}>
                <ThemedText variant="SubTitle" style={styles.instructionText}>
                    Ajoutez du contenu à votre Blink
                </ThemedText>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => addBlock("text")}
                >
                    <Icon name={"text"} size={24} color={colors.text} />
                    <ThemedText style={styles.addButtonText}>Texte</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => addBlock("image")}
                >
                    <Icon name={"image"} size={24} color={colors.text} />
                    <ThemedText style={styles.addButtonText}>Image</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => addBlock("video")}
                >
                    <Icon name={"video"} size={24} color={colors.text} />
                    <ThemedText style={styles.addButtonText}>Vidéo</ThemedText>
                </TouchableOpacity>
            </View>

            {contentBlocks.length === 0 ? (
                <View style={styles.emptyState}>
                    <ThemedText style={styles.emptyStateText}>
                        Commencez par ajouter du contenu à votre Blink en utilisant les boutons ci-dessus
                    </ThemedText>
                </View>
            ) : (
                contentBlocks.map((block, index) => (
                    <View
                        key={block.contentID}
                        style={[
                            styles.blockContainer,
                            { backgroundColor: colors.card, borderColor: colors.border }
                        ]}
                    >
                        <View style={styles.blockHeader}>
                            <View style={styles.blockTypeContainer}>
                                <Icon
                                    name={block.contentType}
                                    size={18}
                                    color={colors.text}
                                />
                                <ThemedText style={styles.blockTypeText}>
                                    {block.contentType === "text" ? "Texte" :
                                     block.contentType === "image" ? "Image" : "Vidéo"}
                                </ThemedText>
                            </View>

                            <View style={styles.reorderButtons}>
                                <TouchableOpacity
                                    style={styles.reorderButton}
                                    onPress={() => moveBlockUp(index)}
                                    disabled={index === 0}
                                >
                                    <Icon
                                        name={"chevron-up"}
                                        size={20}
                                        color={index === 0 ? colors.textSecondary : colors.text}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.reorderButton}
                                    onPress={() => moveBlockDown(index)}
                                    disabled={index === contentBlocks.length - 1}
                                >
                                    <Icon
                                        name={"chevron-down"}
                                        size={20}
                                        color={index === contentBlocks.length - 1 ? colors.textSecondary : colors.text}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <ThemedTextInput
                            placeholder={
                                block.contentType === "text" ? "Écrivez votre texte ici..." :
                                block.contentType === "image" ? "URL de l'image" : "URL de la vidéo"
                            }
                            value={block.content}
                            onChangeText={(text) => updateBlockContent(block.contentID, text)}
                            multiline={block.contentType === "text"}
                            style={[
                                styles.input,
                                { borderColor: colors.border },
                                block.contentType === "text" && styles.textArea,
                            ]}
                        />
                    </View>
                ))
            )}

            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={[
                        styles.cancelButton,
                        { borderColor: colors.border }
                    ]}
                    onPress={handleCancel}
                >
                    <ThemedText style={styles.cancelButtonText}>
                        Annuler
                    </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        {
                            backgroundColor: contentBlocks.length > 0 ? colors.accent : colors.textSecondary,
                            opacity: contentBlocks.length > 0 ? 1 : 0.7
                        }
                    ]}
                    onPress={handleSubmit}
                    disabled={contentBlocks.length === 0}
                >
                    <ThemedText style={styles.submitButtonText}>
                        Publier
                    </ThemedText>
                </TouchableOpacity>
            </View>

            {/* Modal de confirmation pour l'annulation */}
            <Modal
                visible={showConfirmation}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.confirmationOverlay}>
                    <View style={[styles.confirmationContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <ThemedText variant="SubTitle" style={styles.confirmationTitle}>
                            Abandonner la création ?
                        </ThemedText>

                        <ThemedText style={styles.confirmationText}>
                            Êtes-vous sûr de vouloir quitter la création du Blink ? Tous vos changements seront perdus.
                        </ThemedText>

                        <View style={styles.confirmationButtons}>
                            <TouchableOpacity
                                style={[styles.confirmationButton, styles.cancelConfirmButton, { borderColor: colors.border }]}
                                onPress={cancelConfirmation}
                            >
                                <ThemedText>
                                    Continuer l'édition
                                </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.confirmationButton, styles.confirmButton, { backgroundColor: colors.danger }]}
                                onPress={confirmCancel}
                            >
                                <ThemedText style={{ color: 'white' }}>
                                    Abandonner
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    instructionContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    instructionText: {
        textAlign: 'center',
        marginBottom: 8,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 24,
    },
    addButton: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        width: 100,
        height: 100,
    },
    addButtonText: {
        marginTop: 8,
        textAlign: 'center',
    },
    emptyState: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    emptyStateText: {
        textAlign: 'center',
        opacity: 0.7,
    },
    blockContainer: {
        marginBottom: 16,
        padding: 16,
        borderWidth: 1,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    blockHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    blockTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    blockTypeText: {
        marginLeft: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    textArea: {
        minHeight: 120,
        textAlignVertical: "top",
    },
    reorderButtons: {
        flexDirection: "row",
        alignItems: 'center',
    },
    reorderButton: {
        padding: 6,
        marginLeft: 4,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 24,
    },
    cancelButton: {
        padding: 16,
        borderRadius: 30,
        alignItems: "center",
        borderWidth: 1,
        flex: 1,
        marginRight: 8,
    },
    cancelButtonText: {
        fontWeight: '500',
    },
    submitButton: {
        padding: 16,
        borderRadius: 30,
        alignItems: "center",
        flex: 1,
        marginLeft: 8,
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Styles pour la modal de confirmation
    confirmationOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    confirmationContainer: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
    },
    confirmationTitle: {
        textAlign: 'center',
        marginBottom: 16,
    },
    confirmationText: {
        textAlign: 'center',
        marginBottom: 24,
    },
    confirmationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    confirmationButton: {
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1,
    },
    cancelConfirmButton: {
        borderWidth: 1,
        marginRight: 8,
    },
    confirmButton: {
        marginLeft: 8,
    },
});

export default CreateBlinkForm;
