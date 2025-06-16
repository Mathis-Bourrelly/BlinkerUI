import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView, StyleSheet, Modal, Image, ActivityIndicator } from "react-native";
import { ThemedText } from "../base/ThemedText";
import { Icon } from "@/components/images/Icon";
import { useTheme } from "@/context/ThemeContext";
import { ThemedTextInput } from "@/components/base/ThemedTextInput";
import { TagInput } from "@/components/feature/TagInput";
import * as ImagePicker from 'expo-image-picker';
import { useCreateBlinkMutation } from "@/hooks/interfaces/useBlinkInterface";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// Définition du type pour un bloc de contenu
type ContentBlock = {
    contentID: string;
    contentType: "text" | "image" | "video";
    content: string;
    position: number;
    file?: ImagePicker.ImagePickerAsset; // Pour stocker le fichier sélectionné
};

interface CreateBlinkFormProps {
    onSuccess?: () => void;
}

const CreateBlinkForm: React.FC<CreateBlinkFormProps> = ({ onSuccess }) => {
    const { colors } = useTheme();
    const queryClient = useQueryClient();
    const createBlinkMutation = useCreateBlinkMutation();
    const { t } = useTranslation();

    const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fonction pour sélectionner une image depuis la galerie
    const pickImage = async (contentID: string) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert(t('blink.needPhotoPermission'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            quality: 1.0, // Qualité maximale car nous n'envoyons pas le fichier
            base64: false, // Pas besoin de base64
            exif: false, // Pas besoin des données EXIF
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];

            // Mettre à jour le bloc avec le fichier sélectionné
            setContentBlocks(prevBlocks =>
                prevBlocks.map(block =>
                    block.contentID === contentID
                        ? {
                            ...block,
                            content: asset.uri,
                            file: asset
                        }
                        : block
                )
            );
        }
    };

    // Fonction pour sélectionner une vidéo depuis la galerie
    const pickVideo = async (contentID: string) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert('Nous avons besoin de votre permission pour accéder à vos vidéos');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'videos',
            allowsEditing: true,
            quality: 1.0, // Qualité maximale car nous n'envoyons pas le fichier
            base64: false, // Pas besoin de base64
            exif: false, // Pas besoin des données EXIF
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];

            // Mettre à jour le bloc avec le fichier sélectionné
            setContentBlocks(prevBlocks =>
                prevBlocks.map(block =>
                    block.contentID === contentID
                        ? {
                            ...block,
                            content: asset.uri,
                            file: asset
                        }
                        : block
                )
            );
        }
    };

    // Fonction pour ajouter un nouveau bloc en fin de liste
    const addBlock = (type: "text" | "image" | "video") => {
        const newBlock: ContentBlock = {
            contentID: Date.now().toString(),
            contentType: type,
            content: "",
            position: contentBlocks.length + 1,
        };
        setContentBlocks([...contentBlocks, newBlock]);

        // Si c'est une image ou une vidéo, ouvrir directement le sélecteur
        if (type === "image" || type === "video") {
            setTimeout(() => {
                if (type === "image") {
                    pickImage(newBlock.contentID);
                } else if (type === "video") {
                    pickVideo(newBlock.contentID);
                }
            }, 100);
        }
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
    const handleSubmit = async () => {
        if (contentBlocks.length === 0) {
            alert(t('blink.addContent'));
            return;
        }

        try {
            setIsSubmitting(true);
            console.log('Début de la soumission du formulaire avec', contentBlocks.length, 'blocs');

            // Filtrer les blocs pour ne garder que ceux qui ont du contenu
            const validBlocks = contentBlocks.filter(block => {
                if (block.contentType === 'text') {
                    return block.content.trim() !== '';
                } else {
                    return block.file !== undefined;
                }
            });

            if (validBlocks.length === 0) {
                alert(t('blink.addValidContent'));
                setIsSubmitting(false);
                return;
            }

            // Préparer les blocs de contenu pour l'API
            const processedBlocks = validBlocks.map((block, index) => {
                let content = block.content;
                console.log(`Traitement du bloc ${index + 1}/${validBlocks.length} (${block.contentType})`);

                // Pour les blocs de texte, utiliser le contenu tel quel
                if (block.contentType === 'text') {
                    // Rien à faire, le contenu est déjà du texte
                }
                // Pour les images et vidéos, utiliser une URL externe
                else if ((block.contentType === 'image' || block.contentType === 'video') && block.file) {
                    // Comme nous ne pouvons pas télécharger les fichiers pour le moment,
                    // nous utilisons une URL externe pour les tests
                    if (block.contentType === 'image') {
                        // Utiliser une URL d'image de placeholder
                        content = 'https://via.placeholder.com/800x600?text=Image';
                    } else {
                        // Utiliser une URL de vidéo de placeholder
                        content = 'https://example.com/video.mp4';
                    }
                    console.log(`Utilisation d'un placeholder pour le bloc ${index + 1}: ${content}`);

                    // Ajouter un avertissement pour l'utilisateur
                    alert(t('blink.mediaNotSupported', { mediaType: t(`blink.${block.contentType === 'image' ? 'images' : 'videos'}`) }));
                }

                return {
                    contentType: block.contentType,
                    content: content,
                    position: index + 1,
                };
            });

            console.log('Tous les blocs ont été traités, envoi au backend');

            // Envoyer les données au backend
            createBlinkMutation.mutate(
                { body: { contents: processedBlocks, tags: tags.length > 0 ? tags : undefined } },
                {
                    onSuccess: (data) => {
                        console.log("Blink créé avec succès:", data);

                        // Invalider les requêtes pour forcer un rafraîchissement des données
                        queryClient.invalidateQueries({ queryKey: ['blinks'] });
                        // Invalider les requêtes pour les blinks d'utilisateurs
                        queryClient.invalidateQueries({ queryKey: ['blinks-byuser'] });

                        // Appeler le callback onSuccess si fourni
                        if (onSuccess) {
                            onSuccess();
                        }
                    },
                    onError: (error) => {
                        console.error("Erreur lors de la création du Blink:", error);
                        alert(`${t('blink.createError')}: ${error.message}`);
                    },
                    onSettled: () => {
                        setIsSubmitting(false);
                    }
                }
            );
        } catch (error) {
            console.error("Erreur lors de la préparation des données:", error);
            alert(`${t('blink.dataError')}: ${error instanceof Error ? error.message : t('blink.unknownError')}`);
            setIsSubmitting(false);
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
                    {t('blink.addContent')}
                </ThemedText>
            </View>

            {/* Section Tags */}
            <View style={styles.tagsSection}>
                <ThemedText variant="Body" style={styles.sectionTitle}>
                    {t('blink.tags', 'Tags')} ({t('blink.optional', 'optionnel')})
                </ThemedText>
                <TagInput
                    tags={tags}
                    onTagsChange={setTags}
                    placeholder={t('blink.tagsPlaceholder', 'Ajouter des tags...')}
                    maxTags={3}
                />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => addBlock("text")}
                >
                    <Icon name={"text"} size={24} color={colors.text} />
                    <ThemedText style={styles.addButtonText}>{t('blink.addText')}</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => addBlock("image")}
                >
                    <Icon name={"image"} size={24} color={colors.text} />
                    <ThemedText style={styles.addButtonText}>{t('blink.addImage')}</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => addBlock("video")}
                >
                    <Icon name={"video"} size={24} color={colors.text} />
                    <ThemedText style={styles.addButtonText}>{t('blink.addVideo')}</ThemedText>
                </TouchableOpacity>
            </View>

            {contentBlocks.length === 0 ? (
                <View style={styles.emptyState}>
                    <ThemedText style={styles.emptyStateText}>
                        {t('blink.addContent')}
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
                                    {block.contentType === "text" ? t('blink.addText') :
                                     block.contentType === "image" ? t('blink.addImage') : t('blink.addVideo')}
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

                        {block.contentType === "text" ? (
                            <ThemedTextInput
                                placeholder="Écrivez votre texte ici..."
                                value={block.content}
                                onChangeText={(text) => updateBlockContent(block.contentID, text)}
                                multiline={true}
                                style={[
                                    styles.input,
                                    {
                                        borderColor: colors.border,
                                        color: colors.text
                                    },
                                    styles.textArea,
                                ]}
                            />
                        ) : block.contentType === "image" && block.file ? (
                            <View style={styles.mediaPreviewContainer}>
                                <Image
                                    source={{ uri: block.content }}
                                    style={styles.imagePreview}
                                    resizeMode="contain"
                                />
                                <TouchableOpacity
                                    style={[styles.changeMediaButton, { backgroundColor: colors.accent }]}
                                    onPress={() => pickImage(block.contentID)}
                                >
                                    <ThemedText style={{ color: 'white', fontSize: 12 }}>
                                        Changer l'image
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        ) : block.contentType === "video" && block.file ? (
                            <View style={styles.mediaPreviewContainer}>
                                <View style={styles.videoPreview}>
                                    <ThemedText>Vidéo sélectionnée</ThemedText>
                                    <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                                        {block.content.split('/').pop()}
                                    </ThemedText>
                                </View>
                                <TouchableOpacity
                                    style={[styles.changeMediaButton, { backgroundColor: colors.accent }]}
                                    onPress={() => pickVideo(block.contentID)}
                                >
                                    <ThemedText style={{ color: 'white', fontSize: 12 }}>
                                        Changer la vidéo
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[styles.mediaSelector, { borderColor: colors.border }]}
                                onPress={() => block.contentType === "image" ? pickImage(block.contentID) : pickVideo(block.contentID)}
                            >
                                <Icon
                                    name={block.contentType === "image" ? "image" : "video"}
                                    size={32}
                                    color={colors.text}
                                />
                                <ThemedText style={{ marginTop: 8 }}>
                                    {block.contentType === "image" ? "Sélectionner une image" : "Sélectionner une vidéo"}
                                </ThemedText>
                            </TouchableOpacity>
                        )}
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
                            opacity: contentBlocks.length > 0 && !isSubmitting ? 1 : 0.7
                        }
                    ]}
                    onPress={handleSubmit}
                    disabled={contentBlocks.length === 0 || isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <ThemedText style={styles.submitButtonText}>
                            {t('blink.create')}
                        </ThemedText>
                    )}
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
                            {t('blink.cancel')}?
                        </ThemedText>

                        <ThemedText style={styles.confirmationText}>
                            {t('blink.confirmCancel')}
                        </ThemedText>

                        <View style={styles.confirmationButtons}>
                            <TouchableOpacity
                                style={[styles.confirmationButton, styles.cancelConfirmButton, { borderColor: colors.border }]}
                                onPress={cancelConfirmation}
                            >
                                <ThemedText>
                                    {t('blink.no')}
                                </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.confirmationButton, styles.confirmButton, { backgroundColor: colors.danger }]}
                                onPress={confirmCancel}
                            >
                                <ThemedText style={{ color: 'white' }}>
                                    {t('blink.yes')}
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
    // Styles pour les médias
    mediaPreviewContainer: {
        marginVertical: 8,
        alignItems: 'center',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 8,
    },
    videoPreview: {
        width: '100%',
        height: 100,
        borderRadius: 8,
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        padding: 16,
    },
    changeMediaButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    mediaSelector: {
        width: '100%',
        height: 150,
        borderWidth: 1,
        borderRadius: 8,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
    },
    tagsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 8,
        fontWeight: '600',
    },
});

export default CreateBlinkForm;
