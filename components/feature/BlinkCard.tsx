import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { BlinkType } from "@/types/BlinksType";
import { Icon } from "@/components/images/Icon";
import { ThemedSeparator } from "@/components/base/ThemedSeparator";
import VideoPlayer from "@/components/base/VideoPlayer";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/base/ThemedText";
import { TagChip } from "@/components/feature/TagChip";
import { router } from "expo-router";
import { useLikeMutation, useDislikeMutation } from "@/hooks/interfaces/useInteractionInterface";
import { useRemainingTimeQuery } from "@/hooks/interfaces/useBlinkInterface";
import { ReportBlinkModal } from "@/components/feature/ReportBlinkModal";
import { useUser } from "@/context/UserContext";

export function BlinkCard({ blink, onExpire }: { blink: BlinkType, onExpire: (blinkID: string) => void }) {
    const { colors } = useTheme();
    const { user } = useUser();
    const likeMutation = useLikeMutation();
    const dislikeMutation = useDislikeMutation();
    // États locaux pour mettre à jour l'UI immédiatement sans attendre la réponse du serveur
    const [localLikeCount, setLocalLikeCount] = useState(blink.likeCount);
    const [localDislikeCount, setLocalDislikeCount] = useState(blink.dislikeCount);
    const [isLiking, setIsLiking] = useState(false);
    const [isDisliking, setIsDisliking] = useState(false);
    const [hasLiked, setHasLiked] = useState(blink.isLiked || false); // L'utilisateur a-t-il liké ce post
    const [hasDisliked, setHasDisliked] = useState(blink.isDisliked || false); // L'utilisateur a-t-il disliké ce post
    const [showReportModal, setShowReportModal] = useState(false);
    // Mettre à jour les états locaux quand les props changent
    useEffect(() => {
        setLocalLikeCount(blink.likeCount);
        setLocalDislikeCount(blink.dislikeCount);
    }, [blink.likeCount, blink.dislikeCount]);

    // Mettre à jour les états d'interaction quand les propriétés du blink changent
    useEffect(() => {
        setHasLiked(blink.isLiked || false);
        // Dans le nouveau système, like et dislike sont mutuellement exclusifs
        // Si le blink n'est pas liké, on ne peut pas savoir s'il est disliké sans appel API supplémentaire
        // On laisse donc l'état dislike tel quel et il sera mis à jour lors des interactions
    }, [blink.isLiked]);

    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [mins, setMins] = useState(0);
    const [secs, setSecs] = useState(0);
    const [isCritical, setIsCritical] = useState(false);

    // Utiliser le hook pour calculer le temps restant
    const { data: remainingTimeData } = useRemainingTimeQuery(blink.blinkID);

    useEffect(() => {
        // Utiliser le temps restant de l'API si disponible, sinon calculer à partir de createdAt
        let timeLeft = 0;

        if (remainingTimeData?.remainingTime) {
            // Si nous avons des données de l'API, utiliser le temps restant en secondes
            timeLeft = remainingTimeData.remainingTime * 1000; // Convertir en millisecondes
        } else {
            // Sinon, calculer à partir de la date de création (fallback)
            const expirationTime = new Date(blink.createdAt).getTime() + 24 * 60 * 60 * 1000; // Création + 24h
            timeLeft = Math.max(0, expirationTime - Date.now());
        }

        // Mettre à jour les états pour l'affichage
        setSecs(Math.floor((timeLeft / 1000) % 60));
        setMins(Math.floor((timeLeft / 1000 / 60) % 60));
        setHours(Math.floor((timeLeft / 1000 / 60 / 60) % 24));
        setDays(Math.floor(timeLeft / 1000 / 60 / 60 / 24));

        // Si le temps restant est inférieur à 10 minutes, définir l'état critique
        setIsCritical(timeLeft < 10 * 60 * 1000);

        // Lorsque le temps est écoulé, appeler onExpire
        if (timeLeft <= 0) {
            onExpire(blink.blinkID);
        }

        // Configurer un intervalle pour mettre à jour le compte à rebours chaque seconde
        const intervalId = setInterval(() => {
            // Décrémenter les secondes
            setSecs(prev => {
                if (prev > 0) return prev - 1;

                // Si les secondes atteignent 0, décrémenter les minutes
                setMins(prevMins => {
                    if (prevMins > 0) return prevMins - 1;

                    // Si les minutes atteignent 0, décrémenter les heures
                    setHours(prevHours => {
                        if (prevHours > 0) return prevHours - 1;

                        // Si les heures atteignent 0, décrémenter les jours
                        setDays(prevDays => {
                            if (prevDays > 0) return prevDays - 1;
                            return 0;
                        });
                        return 23; // Réinitialiser les heures à 23
                    });
                    return 59; // Réinitialiser les minutes à 59
                });
                return 59; // Réinitialiser les secondes à 59
            });

            // Vérifier si le temps est écoulé
            if (days === 0 && hours === 0 && mins === 0 && secs === 0) {
                clearInterval(intervalId);
                onExpire(blink.blinkID);
            }

            // Mettre à jour l'état critique
            const totalSeconds = days * 86400 + hours * 3600 + mins * 60 + secs;
            setIsCritical(totalSeconds < 600); // Moins de 10 minutes
        }, 1000);

        return () => clearInterval(intervalId); // Nettoyage à la fin
    }, [blink.blinkID, blink.createdAt, remainingTimeData, onExpire]); // Re-exécute l'effet lorsque les données changent

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
            const response = await likeMutation.mutateAsync(blink.blinkID);

            // Vérifier si la réponse est au format standard
            if (response && 'success' in response) {
                // Si l'opération a réussi, mettre à jour l'état en fonction de la réponse
                if (response.success) {
                    // Mise à jour en fonction de l'action effectuée (ajout ou suppression)
                    if (response.data?.created) {
                        setHasLiked(true);
                        setHasDisliked(false);
                    } else if (response.data?.removed) {
                        setHasLiked(false);
                    }
                }
            }
        } catch (error) {
            // Rollback en cas d'erreur
            setLocalLikeCount(blink.likeCount);
            setLocalDislikeCount(blink.dislikeCount);
            setHasLiked(blink.isLiked || false);
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
            const response = await dislikeMutation.mutateAsync(blink.blinkID);

            // Vérifier si la réponse est au format standard
            if (response && 'success' in response) {
                // Si l'opération a réussi, mettre à jour l'état en fonction de la réponse
                if (response.success) {
                    // Mise à jour en fonction de l'action effectuée (ajout ou suppression)
                    if (response.data?.created) {
                        setHasDisliked(true);
                        setHasLiked(false);
                    } else if (response.data?.removed) {
                        setHasDisliked(false);
                    }
                }
            }
        } catch (error) {
            // Rollback en cas d'erreur
            setLocalLikeCount(blink.likeCount);
            setLocalDislikeCount(blink.dislikeCount);
            setHasLiked(blink.isLiked || false);
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
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.push(`/profile/${blink.userID}`)}
                        activeOpacity={0.7}
                        style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                    >
                        <Image source={{ uri: blink.profile.avatar_url }} style={styles.avatar} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.username, { color: colors.text }]}>{blink.profile.display_name}</Text>
                            <Text style={[styles.handle, { color: colors.textSecondary }]}>@{blink.profile.username}</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        {/* Bouton de report - seulement si ce n'est pas le blink de l'utilisateur actuel */}
                        {user?.userID !== blink.userID && (
                            <TouchableOpacity
                                onPress={() => setShowReportModal(true)}
                                style={styles.reportButton}
                                activeOpacity={0.7}
                            >
                                <Icon name="flag" size={20} color={colors.textSecondary.replace('#', '')} />
                            </TouchableOpacity>
                        )}

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
                </View>

                {/* Tags - maintenant en dessous */}
                {blink.tags && blink.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        {blink.tags.map((tag, index) => (
                            <TagChip
                                key={tag.tagID || index}
                                tag={tag}
                                variant="clickable"
                                size="small"
                                onPress={() => {
                                    router.push(`/tag/${encodeURIComponent(tag.name)}`);
                                }}
                            />
                        ))}
                    </View>
                )}
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
                        <ActivityIndicator size="small" color={colors.danger} />
                    ) : (
                        <View style={styles.interactionContent}>
                            <Icon
                                name={hasLiked ? "filled-like" : "like"}
                                size={24}
                                color={hasLiked ? colors.danger : colors.text}
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
                        <ActivityIndicator size="small" color={colors.accent} />
                    ) : (
                        <View style={styles.interactionContent}>
                            <Icon
                                name={"dislike"}
                                size={24}
                                color={hasDisliked ? colors.accent : colors.text}
                            />
                            <Text style={[styles.interactionText, { color: colors.text }]}>{localDislikeCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.interactionButton}
                    onPress={() => router.push(`/comments/${blink.blinkID}` as any)}
                >
                    <View style={styles.interactionContent}>
                        <Icon name={"comments--v1"} size={24} color={colors.text} />
                        <Text style={[styles.interactionText, { color: colors.text }]}>{blink.commentCount}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.interactionContent}>
                    <Icon name={"share"} size={24} color={colors.text} />
                    <Text style={[styles.interactionText, { color: colors.text }]}>{blink.shareCount}</Text>
                </View>
            </View>

            {/* Modal de report */}
            <ReportBlinkModal
                visible={showReportModal}
                onClose={() => setShowReportModal(false)}
                blinkID={blink.blinkID}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    blinkContainer: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    headerContainer: {
        marginBottom: 12,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
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
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    reportButton: {
        padding: 4,
        borderRadius: 4,
    },
    timeContainer: {
        paddingHorizontal: 4,
        paddingVertical: 2,
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
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
        marginBottom: 8,
        paddingLeft: 50, // Aligné avec le texte (avatar 40px + margin 10px)
    },
});
