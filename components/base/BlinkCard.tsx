import React from "react";
import { View, Text, Image, StyleSheet, Linking } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { BlinkType } from "@/types/BlinksType";
import { Icon } from "@/components/images/Icon";
import {ThemedSeparator} from "@/components/base/ThemedSeparator";
import VideoPlayer from "@/components/base/VideoPlayer";

export function BlinkCard({ blink }: { blink: BlinkType }) {
    const { colors } = useTheme();

    // Extraire le premier contenu texte s'il existe
    const textContent = blink.contents.filter(c => c.contentType === "text");
    const imageContent = blink.contents.filter(c => c.contentType === "image");
    const videoContent = blink.contents.filter(c => c.contentType === "video");

    return (
        <View style={[styles.blinkContainer, { backgroundColor: colors.card }]}>
            {/* En-tête */}
            <View style={styles.header}>
                <Image source={{ uri: blink.profile.avatar_url }} style={styles.avatar} />
                <View>
                    <Text style={[styles.username, { color: colors.text }]}>{blink.profile.display_name}</Text>
                    <Text style={[styles.handle, { color: colors.textSecondary }]}>@{blink.profile.username}</Text>
                </View>
                <Text style={[styles.time, { color: colors.textSecondary }]}>{new Date(blink.createdAt).toLocaleTimeString()}</Text>
            </View>
            <ThemedSeparator barColor={colors.border} />

            {/* Contenu du Blink */}
            {textContent.map((content, index) => (
                <Text key={content.contentID} style={[styles.text, { color: colors.text }]}>
                    {content.content}
                </Text>
            ))}

            {/* Affichage des images */}
            {imageContent.map((content, index) => (
                <Image key={content.contentID} source={{ uri: content.content }} resizeMode={"contain"} style={styles.image} />
            ))}

            {/* Affichage des vidéos */}
            {videoContent.map((content, index) => (
                <VideoPlayer key={content.contentID} videoID={content.content} />
            ))}

            <ThemedSeparator barColor={colors.border} />
            {/* Pied de carte avec likes, commentaires, partages */}
            <View style={styles.footer}>
                <Text style={{ color: colors.text }}><Icon name={"filled-like"} size={24} color={colors.text}/> {blink.likeCount}</Text>
                <Text style={{ color: colors.text }}><Icon name={"dislike"} size={24} color={colors.text}/> {blink.dislikeCount}</Text>
                <Text style={{ color: colors.text }}><Icon name={"comments--v1"} size={24} color={colors.text}/> {blink.commentCount}</Text>
                <Text style={{ color: colors.text }}><Icon name={"share"} size={24} color={colors.text}/> {blink.shareCount}</Text>
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
    time: {
        marginLeft: "auto",
        fontSize: 12,
    },
    text: {
        fontSize: 15,
        marginVertical: 5,
    },
    image: {
        width: '100%',
        height: 200,
        marginVertical: 5,
        borderRadius: 8,
    },
    videoLink: {
        fontSize: 15,
        marginVertical: 5,
        textDecorationLine: 'underline',
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
});
