import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { BlinkType } from "@/types/BlinksType";
import { Icon } from "@/components/images/Icon";
import { ThemedSeparator } from "@/components/base/ThemedSeparator";
import VideoPlayer from "@/components/base/VideoPlayer";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/base/ThemedText";
import { router } from "expo-router";

export function BlinkCard({ blink, onExpire }: { blink: BlinkType, onExpire: (blinkID: string) => void }) {
    const { colors } = useTheme();

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
                <Text style={{ color: colors.text }}><Icon name={"filled-like"} size={24} color={colors.text} /> {blink.likeCount}</Text>
                <Text style={{ color: colors.text }}><Icon name={"dislike"} size={24} color={colors.text} /> {blink.dislikeCount}</Text>
                <Text style={{ color: colors.text }}><Icon name={"comments--v1"} size={24} color={colors.text} /> {blink.commentCount}</Text>
                <Text style={{ color: colors.text }}><Icon name={"share"} size={24} color={colors.text} /> {blink.shareCount}</Text>
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
});
