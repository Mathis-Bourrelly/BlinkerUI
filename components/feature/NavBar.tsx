import React, { useState, useEffect, useRef } from "react";
import {View, TouchableOpacity, Image, StyleSheet, useWindowDimensions, Platform} from "react-native";
import {Icon} from "@/components/images/Icon";
import {useTheme} from "@/context/ThemeContext";
import {router} from "expo-router";
import {ThemedText} from "@/components/base/ThemedText";
import {ThemedVerticalSeparator} from "@/components/base/ThemedVerticalSeparator";
import {ThemedLogo} from "@/components/images/ThemedLogo";
import {Row} from "@/components/base/Row";
import {useUser} from "@/context/UserContext";
import {ThemeToggleButton} from "@/components/base/ThemeToggleButton";
import {LanguageDropdown} from "@/components/base/LanguageDropdown";

export default function NavBar() {
    const {width} = useWindowDimensions();
    const {colors} = useTheme();
    const { user } = useUser();
    const [showOptions, setShowOptions] = useState(false);

    // Suppression du log de débogage qui cause des rendus excessifs

    const optionsRef = useRef<any>(null);
    const buttonRef = useRef<any>(null);

    const toggleOptions = () => {
        setShowOptions(!showOptions);
    };

    // Fermer le menu d'options lorsque l'utilisateur clique en dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showOptions && optionsRef.current && buttonRef.current) {
                // @ts-ignore - L'API React Native Web expose _nativeTag et contains
                const isClickInside = event.target && (
                    // @ts-ignore
                    optionsRef.current._nativeTag === (event.target as any)._nativeTag ||
                    // @ts-ignore
                    optionsRef.current.contains?.(event.target as Node) ||
                    // @ts-ignore
                    buttonRef.current._nativeTag === (event.target as any)._nativeTag ||
                    // @ts-ignore
                    buttonRef.current.contains?.(event.target as Node)
                );

                if (!isClickInside) {
                    setShowOptions(false);
                }
            }
        };

        // Ajouter l'écouteur d'événement uniquement côté web
        if (typeof document !== 'undefined') {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            if (typeof document !== 'undefined') {
                document.removeEventListener('mousedown', handleClickOutside);
            }
        };
    }, [showOptions]);

    if (width < 768) return null;

    return (
        <>
            <View style={styles.navBar}>
                <View style={styles.navLinkContainer}>
                    <ThemedLogo height={40}/>
                    <TouchableOpacity onPress={() => router.push("/")}>
                        <ThemedText>Accueil</ThemedText>
                    </TouchableOpacity>
                    <ThemedVerticalSeparator barColor={colors.border} height={20}/>
                    <TouchableOpacity onPress={() => router.push("/")}>
                        <ThemedText>Tendances</ThemedText>
                    </TouchableOpacity>
                    <ThemedVerticalSeparator barColor={colors.border} height={20}/>
                    <TouchableOpacity onPress={() => router.push("/")}>
                        <ThemedText>Leaderboard</ThemedText>
                    </TouchableOpacity>
                    <ThemedVerticalSeparator barColor={colors.border} height={20}/>


                    <TouchableOpacity onPress={() => router.push("/search")}>
                    <ThemedText>Rechercher</ThemedText>
                    </TouchableOpacity>
                </View>
                <Row gap={12}>
                    {/* Bouton de messagerie */}
                    <TouchableOpacity
                        onPress={() => router.push("/messages")}
                        style={[styles.optionsButton, { backgroundColor: colors.card }]}
                    >
                        <Icon name={"chat"} size={24} color={colors.text} />
                    </TouchableOpacity>

                    {/* Bouton des paramètres */}
                    <View>
                        <TouchableOpacity
                            ref={buttonRef}
                            onPress={toggleOptions}
                            style={[styles.optionsButton, { backgroundColor: colors.card }]}
                        >
                            <Icon name={"settings"} size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Avatar de l'utilisateur */}
                    <TouchableOpacity onPress={() => router.push(`/profile/${user?.userID}`)}>
                        <Image
                            source={{uri: user?.avatar_url || `${process.env.EXPO_PUBLIC_API_URL}/uploads/default_user.png` }}
                            style={[styles.avatar, {borderColor: colors.text}]}
                        />
                    </TouchableOpacity>
                </Row>
            </View>

            {/* Menu d'options rendu au niveau supérieur pour éviter les problèmes de z-index */}
            {showOptions && (
                <View
                    ref={optionsRef}
                    style={[
                        styles.optionsMenu,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                        },
                        // @ts-ignore - Utiliser des styles spécifiques à la plateforme web
                        Platform.OS === 'web' ? {
                            position: "fixed",
                            top: "60px",
                            right: "20px"
                        } : {}
                    ]}
                >
                    <View style={styles.optionItem}>
                        <ThemedText style={styles.optionLabel}>Thème</ThemedText>
                        <ThemeToggleButton />
                    </View>
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                    <View style={styles.optionItem}>
                        <ThemedText style={styles.optionLabel}>Langue</ThemedText>
                        <LanguageDropdown />
                    </View>
                </View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    navBar: {
        height: 60,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },
    navLinkContainer: {
        gap: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 20,
        borderWidth: 2,
    },
    optionsContainer: {
        position: "relative",
    },
    optionsButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    optionsMenu: {
        width: 220,
        borderRadius: 8,
        borderWidth: 1,
        padding: 12,
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.25)",
        elevation: 20,
        zIndex: 9999,
    },
    optionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
    },
    optionLabel: {
        fontSize: 14,
        marginRight: 10,
    },
    separator: {
        height: 1,
        width: "100%",
        marginVertical: 8,
    },
});
