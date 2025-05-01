import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { BlinkType } from "@/types/BlinksType";
import { Icon } from "@/components/images/Icon";
import { ThemedSeparator } from "@/components/base/ThemedSeparator";
import VideoPlayer from "@/components/base/VideoPlayer";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/base/ThemedText";
import { router } from "expo-router";
import { useLikeMutation, useDislikeMutation, useCheckInteractionStatus } from "@/hooks/interfaces/useInteractionInterface";

export function BlinkCard({ blink, onExpire }: { blink: BlinkType, onExpire: (blinkID: string) => void }) {
    const { colors } = useTheme();
    const likeMutation = useLikeMutation();
    const dislikeMutation = useDislikeMutation();
    const { data: interactionStatus } = useCheckInteractionStatus(blink.blinkID);

    // États locaux pour mettre à jour l'UI immédiatement sans attendre la réponse du serveur
    const [localLikeCount, setLocalLikeCount] = useState(blink.likeCount);
    const [localDislikeCount, setLocalDislikeCount] = useState(blink.dislikeCount);
    const [isLiking, setIsLiking] = useState(false);
    const [isDisliking, setIsDisliking] = useState(false);
    const [hasLiked, setHasLiked] = useState(interactionStatus?.hasLiked || false); // L'utilisateur a-t-il liké ce post
    const [hasDisliked, setHasDisliked] = useState(interactionStatus?.hasDisliked || false); // L'utilisateur a-t-il disliké ce post

    // Mettre à jour les états locaux quand les props changent
    useEffect(() => {
        setLocalLikeCount(blink.likeCount);
        setLocalDislikeCount(blink.dislikeCount);
    }, [blink.likeCount, blink.dislikeCount]);

    // Mettre à jour les états d'interaction quand les données d'interaction changent
    useEffect(() => {
        if (interactionStatus) {
            setHasLiked(interactionStatus.hasLiked);
            setHasDisliked(interactionStatus.hasDisliked);
        }
    }, [interactionStatus]);

    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [mins, setMins] = useState(0);
    const [secs, setSecs] = useState(0);
    const [isCritical, setIsCritical] = useState(false);

    useEffect(() => {
        const expirationTime = new Date(blink.createdAt).getTime() + 24 * 60 * 60 * 1000; // Création + 24h
        const intervalId = setInterval(() => {
            const now = Date.now();
            const timeLeft = Math.max(0, expirationTime - now);

            // Met à jour les états pour les jours, heures, minutes, secondes
            setSecs(Math.floor((timeLeft / 1000) % 60));
            setMins(Math.floor((timeLeft / 1000 / 60) % 60));
            setHours(Math.floor((timeLeft / 1000 / 60 / 60) % 24));
            setDays(Math.floor(timeLeft / 1000 / 60 / 60 / 24));

            // Si le temps restant est inférieur à 10 minutes, définir l'état critique
            setIsCritical(timeLeft < 10 * 60 * 1000);

            // Lorsque le temps est écoulé, appeler onExpire
            if (timeLeft <= 0) {
                clearInterval(intervalId);
                onExpire(blink.blinkID);
            }
        }, 1000);

        return () => clearInterval(intervalId); // Nettoyage à la fin
    }, [blink.createdAt, onExpire]); // Re-exécute l'effet lorsque `createdAt` change

    // Fonctions pour gérer les likes et dislikes
    const handleLike = async () => {
        if (isLiking) return; // Éviter les clics multiples

        setIsLiking(true);
        try {
            // Si déjà liké, on retire le like
            if (hasLiked) {
                // Optimistic update
                setLocalLikeCount(prev => prev - 1);
                setHasLiked(false);
            }
            // Sinon, on ajoute un like
            else {
                // Optimistic update
                setLocalLikeCount(prev => prev + 1);
                setHasLiked(true);

                // Si le post était disliké, on retire le dislike
                if (hasDisliked) {
                    setLocalDislikeCount(prev => prev - 1);
                    setHasDisliked(false);
                }
            }

            // Appel API
            await likeMutation.mutateAsync(blink.blinkID);
        } catch (error) {
            // Rollback en cas d'erreur
            setLocalLikeCount(blink.likeCount);
            setLocalDislikeCount(blink.dislikeCount);
            setHasLiked(false);
            setHasDisliked(false);
            console.error('Error liking blink:', error);
        } finally {
            setIsLiking(false);
        }
    };

    const handleDislike = async () => {
        if (isDisliking) return; // Éviter les clics multiples

        setIsDisliking(true);
        try {
            // Si déjà disliké, on retire le dislike
            if (hasDisliked) {
                // Optimistic update
                setLocalDislikeCount(prev => prev - 1);
                setHasDisliked(false);
            }
            // Sinon, on ajoute un dislike
            else {
                // Optimistic update
                setLocalDislikeCount(prev => prev + 1);
                setHasDisliked(true);

                // Si le post était liké, on retire le like
                if (hasLiked) {
                    setLocalLikeCount(prev => prev - 1);
                    setHasLiked(false);
                }
            }

            // Appel API
            await dislikeMutation.mutateAsync(blink.blinkID);
        } catch (error) {
            // Rollback en cas d'erreur
            setLocalLikeCount(blink.likeCount);
            setLocalDislikeCount(blink.dislikeCount);
            setHasLiked(false);
            setHasDisliked(false);
            console.error('Error disliking blink:', error);
        } finally {
            setIsDisliking(false);
        }
    };

    // Extraire les contenus
    const textContent = blink.contents.filter(c => c.contentType === "text");
    const imageContent = blink.contents.filter(c => c.contentType === "image");
    const videoContent = blink.contents.filter(c => c.contentType === "video");

    return (
        <View style={[styles.blinkContainer, { backgroundColor: colors.card }]}>
            {/* En-tête */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.push(`/profile/${blink.userID}`)}
                    activeOpacity={0.7}
                    style={{ flexDirection: "row", alignItems: "center" }}
                >
                    <Image source={{ uri: blink.profile.avatar_url }} style={styles.avatar} />
                    <View>
                        <Text style={[styles.username, { color: colors.text }]}>{blink.profile.display_name}</Text>
                        <Text style={[styles.handle, { color: colors.textSecondary }]}>@{blink.profile.username}</Text>
                    </View>
                </TouchableOpacity>
                <LinearGradient
                    colors={isCritical ? colors.dangerGradient : colors.accentGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[styles.timeContainer, { borderColor: isCritical ? colors.dangerTimer : colors.accent, borderWidth: 2 }]}
                >
                    <ThemedText variant={"Body"}>
                        {days > 0 ? `${days} jour${days > 1 ? "s" : ""}`
                            : hours > 0 || mins > 0 ? `${hours}h ${mins}m`
                                : `${secs}s`}
                    </ThemedText>
                </LinearGradient>
            </View>
            <ThemedSeparator barColor={colors.border} />

            {/* Contenu du Blink */}
            {textContent.map((content) => (
                <Text key={content.contentID} style={[styles.text, { color: colors.text }]}>
                    {content.content}
                </Text>
            ))}

            {/* Affichage des images */}
            {imageContent.map((content) => (
                <Image key={content.contentID} source={{ uri: content.content }} resizeMode={"contain"} style={styles.image} />
            ))}

            {/* Affichage des vidéos */}
            {videoContent.map((content) => (
                <VideoPlayer key={content.contentID} videoID={content.content} />
            ))}

            <ThemedSeparator barColor={colors.border} />
            {/* Pied de carte avec likes, commentaires, partages */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.interactionButton}
                    onPress={handleLike}
                    disabled={isLiking}
                >
                    {isLiking ? (
                        <ActivityIndicator size="small" color={colors.accent} />
                    ) : (
                        <View style={styles.interactionContent}>
                            <Icon
                                name={hasLiked ? "filled-like" : "like"}
                                size={24}
                                color={hasLiked ? colors.accent : colors.text}
                            />
                            <Text style={[styles.interactionText, { color: colors.text }]}>{localLikeCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.interactionButton}
                    onPress={handleDislike}
                    disabled={isDisliking}
                >
                    {isDisliking ? (
                        <ActivityIndicator size="small" color={colors.danger} />
                    ) : (
                        <View style={styles.interactionContent}>
                            <Icon
                                name={"dislike"}
                                size={24}
                                color={hasDisliked ? colors.danger : colors.text}
                            />
                            <Text style={[styles.interactionText, { color: colors.text }]}>{localDislikeCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.interactionContent}>
                    <Icon name={"comments--v1"} size={24} color={colors.text} />
                    <Text style={[styles.interactionText, { color: colors.text }]}>{blink.commentCount}</Text>
                </View>

                <View style={styles.interactionContent}>
                    <Icon name={"share"} size={24} color={colors.text} />
                    <Text style={[styles.interactionText, { color: colors.text }]}>{blink.shareCount}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    blinkContainer: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    username: {
        fontWeight: "bold",
        fontSize: 16,
    },
    handle: {
        fontSize: 14,
    },
    profileTouchable: {
        flexDirection: "row",
        alignItems: "center",
    },
    timeContainer: {
        paddingHorizontal: 4,
        paddingVertical: 2,
        marginLeft: "auto",
        borderRadius: 20,
        borderWidth: 2,
    },
    text: {
        fontSize: 15,
        marginVertical: 5,
    },
    image: {
        width: "100%",
        height: 200,
        marginVertical: 5,
        borderRadius: 8,
    },
    videoLink: {
        fontSize: 15,
        marginVertical: 5,
        textDecorationLine: "underline",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    interactionButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 5,
        borderRadius: 5,
    },
    interactionContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    interactionText: {
        marginLeft: 5,
        fontSize: 14,
    },
});
