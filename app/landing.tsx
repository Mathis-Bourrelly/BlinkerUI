import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Animated, useWindowDimensions, Platform, Image, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Stack, router } from "expo-router";
import Reanimated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { AnimatedBackground } from '@/components/animations/AnimatedBackground';
import { ThemedText } from "@/components/base/ThemedText";
import { ThemedFullLogo } from "@/components/images/ThemedFullLogo";
import { Row } from "@/components/base/Row";
import { LanguageDropdown } from "@/components/base/LanguageDropdown";
import { ThemeToggleButton } from "@/components/base/ThemeToggleButton";
import { GradientButton } from "@/components/base/GradientButton";
import { Icon } from "@/components/images/Icon";
import { InnerContainer } from "@/components/base/InnerContainer";
import { ThemedSeparator } from "@/components/base/ThemedSeparator";
import { OptionsButton } from "@/components/base/OptionsButton";
import {Space_Separator} from "json5/lib/unicode";

export default function LandingPage() {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const gradientColors = colors.gradient;

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scrollViewRef = useRef<ScrollView>(null);

    // Animated scroll value for background effect
    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    // Animation values for slogan scroll effects
    const sloganLine1X = useRef(new Animated.Value(-100)).current; // Déplacement horizontal de la 1ère ligne (commence hors écran à gauche)
    const sloganLine2X = useRef(new Animated.Value(140)).current; // Décalage initial de la 2e ligne (commence hors écran à droite)

    // Animation for floating hourglass
    const hourglassFloatY = useRef(new Animated.Value(0)).current; // Pour l'effet de flottement vertical
    const hourglassRotate = useRef(new Animated.Value(0)).current; // Pour l'effet de rotation

    // Feature cards animation - initialiser à 0 (invisible)
    const [activeFeature, setActiveFeature] = useState(0);
    const featureAnims = [
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
    ];

    // Seuils de défilement pour déclencher les animations
    const featureAnimationThresholds = [500, 550, 600, 650]; // Valeurs de défilement auxquelles chaque carte devient visible
    const [featuresAnimated, setFeaturesAnimated] = useState([false, false, false, false]); // Suivi des animations déjà déclenchées

    // Animate entrance
    useEffect(() => {
        // Animation d'entrée principale
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]).start();

        // Animation de flottement pour le sablier
        const floatAnimation = () => {
            Animated.sequence([
                Animated.timing(hourglassFloatY, {
                    toValue: 10,
                    duration: 2000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.sin)
                }),
                Animated.timing(hourglassFloatY, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.sin)
                })
            ]).start(() => floatAnimation());
        };

        // Animation de rotation douce pour le sablier
        const rotateAnimation = () => {
            Animated.sequence([
                Animated.timing(hourglassRotate, {
                    toValue: 1,
                    duration: 6000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.sin)
                }),
                Animated.timing(hourglassRotate, {
                    toValue: 0,
                    duration: 6000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.sin)
                })
            ]).start(() => rotateAnimation());
        };

        floatAnimation();
        rotateAnimation();

        // Animation d'entrée pour la première ligne du slogan - depuis la gauche
        Animated.timing(sloganLine1X, {
            toValue: 0, // Position finale centrée
            duration: 800,
            delay: 200,
            useNativeDriver: true,
            easing: Easing.out(Easing.back(1.5)), // Effet de rebond léger
        }).start();

        // Animation d'entrée pour la deuxième ligne du slogan avec délai - depuis la droite
        Animated.sequence([
            Animated.delay(400), // Délai avant l'apparition de la deuxième ligne
            Animated.timing(sloganLine2X, {
                toValue: 40, // Position finale avec décalage
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.back(1.5)), // Effet de rebond léger
            })
        ]).start();

        // Ne pas animer les features au chargement - elles seront animées au scroll
    }, []);

    // Effet de scroll pour le slogan et les animations à l'apparition
    useEffect(() => {
        // Créer une fonction pour mettre à jour les animations en fonction du scroll
        const updateScrollAnimations = () => {
            // Convertir la valeur SharedValue en Animated.Value standard
            const scrollValue = scrollY.value;

            // Appliquer un effet de déplacement horizontal au slogan sur une plus grande distance
            if (scrollValue < 800) { // Étendre l'effet à 800 pixels de défilement
                const scrollFactor = scrollValue * 0.5;
                sloganLine1X.setValue(-scrollFactor * 0.8); // La première ligne se déplace vers la gauche
                sloganLine2X.setValue(40 + scrollFactor * 0.8); // La deuxième ligne se déplace vers la droite
            }

            // Animation des cartes de fonctionnalités lors du défilement
            featureAnimationThresholds.forEach((threshold, index) => {
                // Si l'utilisateur a défilé jusqu'au seuil et que l'animation n'a pas encore été déclenchée
                if (scrollValue >= threshold && !featuresAnimated[index]) {
                    // Marquer cette animation comme déclenchée
                    const newAnimatedState = [...featuresAnimated];
                    newAnimatedState[index] = true;
                    setFeaturesAnimated(newAnimatedState);

                    // Déclencher l'animation avec un délai progressif
                    Animated.timing(featureAnims[index], {
                        toValue: 1,
                        duration: 500,
                        delay: index * 150, // Délai progressif entre les cartes
                        useNativeDriver: true,
                    }).start();
                }
            });

            // Animation des autres sections (avantages, témoignages, etc.) pourrait être ajoutée ici
        };

        // Créer un intervalle pour mettre à jour les animations
        const animationInterval = setInterval(updateScrollAnimations, 16); // ~60fps

        return () => {
            // Nettoyer l'intervalle lors du démontage
            clearInterval(animationInterval);
        };
    }, [featuresAnimated]); // Dépendance à featuresAnimated pour éviter les boucles infinies

    // Scroll to features section
    const scrollToFeatures = () => {
        scrollViewRef.current?.scrollTo({ y: isDesktop ? 800 : 700, animated: true });
    };

    // Navigate to login/register
    const navigateToLogin = () => {
        router.push('/login');
    };

    // Features data
    const features = [
        {
            icon: 'visible',
            title: t('landing.features.blinks.title', 'Blinks – Publications Éphémères'),
            description: t('landing.features.blinks.description', 'Contenu texte, image, vidéo avec durée de vie limitée mais prolongeable par la communauté')
        },
        {
            icon: 'chat',
            title: t('landing.features.messaging.title', 'Messagerie Dynamique'),
            description: t('landing.features.messaging.description', 'Messages privés par conversation avec expiration selon le score utilisateur')
        },
        {
            icon: 'user',
            title: t('landing.features.profiles.title', 'Profils Riches'),
            description: t('landing.features.profiles.description', 'Score utilisateur, suivi, avatar et bio personnalisable')
        },
        {
            icon: 'star',
            title: t('landing.features.score.title', 'Score Communautaire'),
            description: t('landing.features.score.description', 'Durée de vie des blinks = indice de réputation, influence sur la visibilité')
        }
    ];

    // Advantages data
    const advantages = [
        {
            icon: 'approval',
            title: t('landing.advantages.quality.title', 'Contenu de qualité'),
            description: t('landing.advantages.quality.description', 'Le contenu pertinent est mis en avant')
        },
        {
            icon: 'hourglass',
            title: t('landing.advantages.dynamic.title', 'Expérience dynamique'),
            description: t('landing.advantages.dynamic.description', 'Une expérience personnalisée qui évolue avec vous')
        },
        {
            icon: 'quick-mode-on',
            title: t('landing.advantages.realtime.title', 'Fluidité et temps réel'),
            description: t('landing.advantages.realtime.description', 'Interactions instantanées et notifications en direct')
        },
        {
            icon: 'rocket',
            title: t('landing.advantages.evolving.title', 'Évolutivité'),
            description: t('landing.advantages.evolving.description', 'Groupes, nouveaux formats et fonctionnalités à venir')
        }
    ];

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container}>
                <AnimatedBackground scrollY={scrollY}>
                    <Reanimated.ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        onScroll={scrollHandler}
                        scrollEventThrottle={16}>
                        {/* Header Section */}
                        <View style={styles.header}>
                            <Row style={styles.headerTop}>
                                <View style={styles.logoContainer}>
                                    <ThemedFullLogo />
                                </View>

                                <Row gap={12} style={styles.headerRightSection}>
                                    <View style={styles.actionButton}>
                                        <GradientButton
                                            text={t('landing.createAccount', "Créer un compte")}
                                            onPress={navigateToLogin}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.loginButton, { borderColor: colors.border }]}
                                        onPress={navigateToLogin}
                                    >
                                        <ThemedText variant="ButtonText">
                                            {t('landing.login', "Se connecter")}
                                        </ThemedText>
                                    </TouchableOpacity>
                                    <OptionsButton />
                                </Row>
                            </Row>

                            <Animated.View
                                style={[
                                    styles.headerContent,
                                    {
                                        opacity: fadeAnim
                                    }
                                ]}
                            >
                                <View style={styles.sloganContainer}>
                                    {/* Image sablier flottante derrière le slogan */}
                                    <Animated.Image
                                        source={require('@/assets/images/sablier.png')}
                                        style={[styles.hourglassImage, {
                                            opacity: fadeAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, 0.8]
                                            }),
                                            transform: [
                                                {
                                                    rotate: hourglassRotate.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: ['-5deg', '5deg']
                                                    })
                                                },
                                                {
                                                    translateY: hourglassFloatY // Effet de flottement vertical
                                                }
                                            ]
                                        }]}
                                        resizeMode="contain"
                                    />
                                    {/* Première ligne du slogan avec animation */}
                                    <Animated.View
                                        style={{
                                            opacity: fadeAnim,
                                            transform: [{
                                                translateY: slideAnim.interpolate({
                                                    inputRange: [0, 50],
                                                    outputRange: [0, 30]
                                                })
                                            },
                                            {
                                                translateX: sloganLine1X // Déplacement horizontal vers la gauche
                                            }]
                                        }}
                                    >
                                        <ThemedText variant="LandingTitle" style={styles.slogan}>
                                            {"More Like,"}
                                        </ThemedText>
                                    </Animated.View>

                                    {/* Deuxième ligne du slogan avec animation décalée */}
                                    <Animated.View
                                        style={{
                                            opacity: fadeAnim.interpolate({
                                                inputRange: [0, 0.5, 1],
                                                outputRange: [0, 0, 1]
                                            }),
                                            transform: [{
                                                translateY: slideAnim.interpolate({
                                                    inputRange: [0, 50],
                                                    outputRange: [0, 50]
                                                })
                                            },
                                            {
                                                translateX: sloganLine2X // Déplacement horizontal vers la droite
                                            }]
                                        }}
                                    >
                                        <ThemedText variant="LandingTitle" style={[styles.slogan, styles.sloganSecondLine]}>
                                            {"More Time."}
                                        </ThemedText>
                                    </Animated.View>
                                </View>

                                <Row style={styles.actionButtons}>

                                </Row>
                            </Animated.View>
                        </View>

                        {/* Hero Section */}
                        <View style={styles.heroSection}>
                            <Animated.View
                                style={[
                                    styles.heroContent,
                                    {
                                        opacity: fadeAnim,
                                        transform: [{ translateY: slideAnim }]
                                    }
                                ]}
                            >


                                <TouchableOpacity
                                    style={[styles.discoverButton, { backgroundColor: colors.card }]}
                                    onPress={scrollToFeatures}
                                >
                                    <Row gap={8} style={styles.discoverButtonContent}>
                                        <ThemedText variant="ButtonText">
                                            {t('landing.discover', "Découvrir les fonctionnalités")}
                                        </ThemedText>
                                        <Icon name="chevron-down" size={24} color={colors.text} />
                                    </Row>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>

                        {/* Features Section */}
                        <View style={styles.featuresSection}>
                            <ThemedText variant="Title" style={styles.sectionTitle}>
                                {t('landing.featuresTitle', "Fonctionnalités")}
                            </ThemedText>

                            <View style={styles.featuresContainer}>
                                {features.map((feature, index) => (
                                    <Animated.View
                                        key={index}
                                        style={[
                                            styles.featureCard,
                                            {
                                                backgroundColor: colors.card,
                                                opacity: featureAnims[index],
                                                transform: [{
                                                    translateY: featureAnims[index].interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: [50, 0]
                                                    })
                                                }]
                                            }
                                        ]}
                                    >
                                        <View style={styles.featureIconContainer}>
                                            <LinearGradient
                                                colors={colors.accentGradient}
                                                style={styles.featureIconGradient}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                            >
                                                <Icon name={feature.icon} size={32} color="#FFFFFF" />
                                            </LinearGradient>
                                        </View>
                                        <ThemedText variant="SubTitle" style={styles.featureTitle}>
                                            {feature.title}
                                        </ThemedText>
                                        <ThemedText style={styles.featureDescription}>
                                            {feature.description}
                                        </ThemedText>
                                    </Animated.View>
                                ))}
                            </View>
                        </View>

                        {/* Advantages Section */}
                        <View style={styles.advantagesSection}>
                            <ThemedText variant="Title" style={styles.sectionTitle}>
                                {t('landing.advantagesTitle', "Pourquoi Blinker ?")}
                            </ThemedText>

                            <View style={styles.advantagesContainer}>
                                {advantages.map((advantage, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.advantageItem,
                                            { backgroundColor: colors.card }
                                        ]}
                                    >
                                        <Icon name={advantage.icon} size={24} color={colors.accent} />
                                        <View style={styles.advantageContent}>
                                            <ThemedText variant="SubTitle" style={styles.advantageTitle}>
                                                {advantage.title}
                                            </ThemedText>
                                            <ThemedText style={styles.advantageDescription}>
                                                {advantage.description}
                                            </ThemedText>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Testimonials Section (Optional) */}
                        <View style={styles.testimonialsSection}>
                            <ThemedText variant="Title" style={styles.sectionTitle}>
                                {t('landing.testimonialsTitle', "Ce que disent nos utilisateurs")}
                            </ThemedText>

                            <View style={styles.testimonialsContainer}>
                                <View style={[styles.testimonialCard, { backgroundColor: colors.card }]}>
                                    <ThemedText style={styles.testimonialQuote}>
                                        "Depuis que j'utilise Blinker, je publie moins, mais mieux."
                                    </ThemedText>
                                    <ThemedText style={styles.testimonialAuthor}>
                                        Marie, 23 ans
                                    </ThemedText>
                                </View>

                                <View style={[styles.testimonialCard, { backgroundColor: colors.card }]}>
                                    <ThemedText style={styles.testimonialQuote}>
                                        "Une messagerie qui ne t'encombre pas. Juste ce qui compte."
                                    </ThemedText>
                                    <ThemedText style={styles.testimonialAuthor}>
                                        Alex, 29 ans
                                    </ThemedText>
                                </View>
                            </View>
                        </View>

                        {/* Final CTA Section */}
                        <View style={styles.ctaSection}>
                            <LinearGradient
                                colors={colors.accentGradient}
                                style={styles.ctaGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <ThemedText variant="Title" style={styles.ctaTitle}>
                                    {t('landing.ctaTitle', "Prêt à rejoindre un réseau social différent ?")}
                                </ThemedText>

                                <View style={styles.ctaButtons}>
                                    <TouchableOpacity
                                        style={[styles.ctaMainButton, { backgroundColor: colors.background }]}
                                        onPress={navigateToLogin}
                                    >
                                        <ThemedText variant="ButtonText">
                                            {t('landing.startNow', "Commencer maintenant")}
                                        </ThemedText>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={scrollToFeatures}>
                                        <ThemedText variant="Underline" style={styles.ctaSecondaryButton}>
                                            {t('landing.learnMore', "En savoir plus")}
                                        </ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        </View>
                    </Reanimated.ScrollView>
                </AnimatedBackground>
            </SafeAreaView>
        </>
    );
}

// Animated Blink component that fades out
const BlinkAnimation = () => {
    const { colors } = useTheme();
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Animation loop that fades out and back in
        const startAnimation = () => {
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 0.2,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ]).start(() => startAnimation());
        };

        startAnimation();

        return () => {
            // Cleanup animation
            fadeAnim.stopAnimation();
        };
    }, []);

    return (
        <Animated.View
            style={[
                styles.blinkAnimationContainer,
                {
                    opacity: fadeAnim,
                    backgroundColor: colors.card,
                    borderColor: colors.border
                }
            ]}
        >
            <Icon name="eye" size={64} color={colors.accent} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        alignItems: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    header: {
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    headerTop: {
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 200,
    },
    headerContent: {
        alignItems: 'center',
    },
    sloganContainer: {
        alignItems: 'flex-start',
        marginTop: 60,
        marginBottom: 100, // Plus d'espace sous le slogan
        position: 'relative', // Pour le positionnement absolu de l'image
    },
    hourglassImage: {
        position: 'absolute',
        width: 350,
        height: 350,
        top: -120,
        right: -120,
        zIndex: 10, // Au-dessus du filtre bleu
    },
    headerRightSection: {
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    slogan: {
        textAlign: 'left',
        marginBottom: 5,
    },
    sloganSecondLine: {
        marginLeft: 80, // Décalage à droite pour la deuxième ligne
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    actionButton: {
        minWidth: 180,
    },
    loginButton: {
        height: 40,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroSection: {
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 40,
        alignItems: 'center',
    },
    heroContent: {
        alignItems: 'center',
        maxWidth: 800,
    },
    heroAnimation: {
        marginBottom: 30,
    },
    heroTitle: {
        textAlign: 'center',
        marginBottom: 20,
    },
    heroSubtitle: {
        textAlign: 'center',
        marginBottom: 30,
        maxWidth: 600,
    },
    discoverButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
    },
    discoverButtonContent: {
        alignItems: 'center',
    },
    featuresSection: {
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    sectionTitle: {
        textAlign: 'center',
        marginBottom: 30,
    },
    featuresContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 20,
    },
    featureCard: {
        width: 280,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    featureIconContainer: {
        marginBottom: 15,
    },
    featureIconGradient: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureTitle: {
        textAlign: 'center',
        marginBottom: 10,
    },
    featureDescription: {
        textAlign: 'center',
    },
    advantagesSection: {
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    advantagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 15,
    },
    advantageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        width: '100%',
        maxWidth: 580,
        gap: 15,
    },
    advantageContent: {
        flex: 1,
    },
    advantageTitle: {
        marginBottom: 5,
    },
    advantageDescription: {
        fontSize: 14,
    },
    testimonialsSection: {
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    testimonialsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 20,
    },
    testimonialCard: {
        width: 280,
        padding: 20,
        borderRadius: 12,
    },
    testimonialQuote: {
        fontStyle: 'italic',
        marginBottom: 10,
        textAlign: 'center',
    },
    testimonialAuthor: {
        textAlign: 'right',
        fontWeight: 'bold',
    },
    ctaSection: {
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    ctaGradient: {
        padding: 30,
        borderRadius: 12,
        alignItems: 'center',
    },
    ctaTitle: {
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 30,
    },
    ctaButtons: {
        alignItems: 'center',
        gap: 15,
    },
    ctaMainButton: {
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    ctaSecondaryButton: {
        color: '#FFFFFF',
    },
    blinkAnimationContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
});
