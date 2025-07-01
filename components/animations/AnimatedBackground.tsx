import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolateColor,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  scrollY?: Animated.SharedValue<number>;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  children,
  scrollY = useSharedValue(0)
}) => {
  const { colors, theme } = useTheme();
  const { width, height } = useWindowDimensions();

  // Animation values
  const animationProgress = useSharedValue(0);
  const rotationValue = useSharedValue(0);
  const scaleValue = useSharedValue(1);

  // Derived values for parallax effect based on scroll
  const translateY = useDerivedValue(() => {
    return scrollY.value * 0.7; // Plus de déplacement avec le scroll
  });

  // Effet de translation horizontale basé sur le scroll
  const translateX = useDerivedValue(() => {
    // Mouvement horizontal léger qui alterne avec le scroll
    return Math.sin(scrollY.value * 0.005) * width * 0.05;
  });

  // Scale effect based on scroll - très subtil
  const scaleEffect = useDerivedValue(() => {
    return 1 + (scrollY.value * 0.0002); // Réduction de l'effet d'échelle
  });

  // Blob positions - mouvement plus fluide mais moins ample
  const blob1Position = useDerivedValue(() => {
    const baseX = width * 0.2;
    const baseY = height * 0.3;
    return {
      x: baseX + Math.sin(animationProgress.value * Math.PI) * 20, // Mouvement horizontal réduit
      y: baseY - translateY.value * 0.6, // Plus de déplacement vertical avec le scroll
    };
  });

  const blob2Position = useDerivedValue(() => {
    const baseX = width * 0.7;
    const baseY = height * 0.6;
    return {
      x: baseX + Math.cos(animationProgress.value * Math.PI) * 15, // Mouvement horizontal réduit
      y: baseY - translateY.value * 0.5, // Plus de déplacement vertical avec le scroll
    };
  });

  const blob3Position = useDerivedValue(() => {
    const baseX = width * 0.5;
    const baseY = height * 0.8;
    return {
      x: baseX + Math.sin(animationProgress.value * Math.PI * 1.5) * 18, // Mouvement horizontal réduit
      y: baseY - translateY.value * 0.7, // Plus de déplacement vertical avec le scroll
    };
  });

  // Nouveau blob avec une couleur différente
  const blob4Position = useDerivedValue(() => {
    const baseX = width * 0.3;
    const baseY = height * 0.5;
    return {
      x: baseX + Math.cos(animationProgress.value * Math.PI * 0.8) * 25,
      y: baseY - translateY.value * 0.55,
    };
  });

  // Start animations - plus fluides et moins amples
  useEffect(() => {
    // Animation continue plus lente et plus fluide
    animationProgress.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }), // Animation plus lente
      -1,
      true
    );

    // Rotation plus lente
    rotationValue.value = withRepeat(
      withTiming(360, { duration: 45000, easing: Easing.linear }), // Rotation plus lente
      -1,
      false
    );

    // Effet de respiration plus subtil
    scaleValue.value = withRepeat(
      withTiming(1.03, { duration: 7000, easing: Easing.inOut(Easing.ease) }), // Changement d'échelle réduit
      -1,
      true
    );
  }, []);

  // Background gradient style
  const backgroundStyle = useAnimatedStyle(() => {
    // Determine colors based on theme with more vibrant colors and an additional color
    const gradientColors = theme === 'dark'
      ? [
          '#0C101D', // Deep blue
          '#101F45', // Richer midnight blue
          '#3F51B5', // Nouvelle couleur - Indigo
          '#1A237E', // Deeper indigo
          '#03050C', // Almost black
        ]
      : [
          '#d5ddf8', // Light blue
          '#c7d0ff', // Slightly more saturated blue
          '#7986CB', // Nouvelle couleur - Indigo clair
          '#e2e5ff', // Lighter blue
          '#f4f6ff', // Almost white
        ];

    // Rotation plus subtile basée sur le scroll
    const rotateAngle = (scrollY.value * 0.01) % 360; // Réduction de l'effet de rotation

    return {
      transform: [
        { translateY: translateY.value * -1.0 }, // Déplacement vertical plus important
        { translateX: translateX.value }, // Ajout d'un léger mouvement horizontal
        { rotate: `${rotateAngle}deg` },
        { scale: scaleValue.value * scaleEffect.value }, // Effet d'échelle combiné mais réduit
      ],
      backgroundColor: colors.background,
    };
  });

  // Blob styles - plus subtils mais avec plus de déplacement
  const blob1Style = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      width: width * 0.9, // Taille réduite
      height: width * 0.9,
      borderRadius: width,
      left: blob1Position.value.x - width * 0.45,
      top: blob1Position.value.y - width * 0.45,
      backgroundColor: theme === 'dark' ? '#1A237E25' : '#3058e718', // Moins visible
      transform: [
        { scale: 0.8 + Math.sin(animationProgress.value * Math.PI) * 0.1 }, // Variation d'échelle réduite
        { rotate: `${animationProgress.value * 10}deg` }, // Rotation réduite
      ],
    };
  });

  const blob2Style = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      width: width * 0.8, // Taille réduite
      height: width * 0.8,
      borderRadius: width,
      left: blob2Position.value.x - width * 0.4,
      top: blob2Position.value.y - width * 0.4,
      backgroundColor: theme === 'dark' ? '#3058e725' : '#3058e715', // Moins visible
      transform: [
        { scale: 0.7 + Math.cos(animationProgress.value * Math.PI) * 0.1 }, // Variation d'échelle réduite
        { rotate: `${-animationProgress.value * 8}deg` }, // Rotation réduite
      ],
    };
  });

  const blob3Style = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      width: width * 1.0, // Taille réduite
      height: width * 1.0,
      borderRadius: width,
      left: blob3Position.value.x - width * 0.5,
      top: blob3Position.value.y - width * 0.5,
      backgroundColor: theme === 'dark' ? '#3F51B520' : '#3058e710', // Moins visible
      transform: [
        { scale: 0.9 + Math.sin(animationProgress.value * Math.PI * 1.5) * 0.1 }, // Variation d'échelle réduite
        { rotate: `${animationProgress.value * 5}deg` }, // Rotation réduite
      ],
    };
  });

  // Nouveau blob avec une couleur différente
  const blob4Style = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      width: width * 0.85,
      height: width * 0.85,
      borderRadius: width,
      left: blob4Position.value.x - width * 0.425,
      top: blob4Position.value.y - width * 0.425,
      backgroundColor: theme === 'dark' ? '#7E57C220' : '#7C4DFF15', // Nouvelle couleur - violet/pourpre
      transform: [
        { scale: 0.85 + Math.cos(animationProgress.value * Math.PI * 0.8) * 0.1 },
        { rotate: `${animationProgress.value * 12}deg` },
      ],
    };
  });

  // Glass overlay style - more pronounced effect
  const glassOverlayStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: theme === 'dark' ? 'rgba(3, 5, 12, 0.4)' : 'rgba(255, 255, 255, 0.4)', // More transparent
      backdropFilter: 'blur(60px)', // Less blur for more visible blobs
      transform: [
        { translateY: translateY.value * -0.3 }, // More pronounced parallax for glass effect
        { scale: 1 + (scrollY.value * 0.0002) }, // Subtle scale with scroll
      ],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.gradientContainer, backgroundStyle]}>
        <Animated.View style={blob1Style} />
        <Animated.View style={blob2Style} />
        <Animated.View style={blob3Style} />
        <Animated.View style={blob4Style} /> {/* Nouveau blob avec couleur différente */}
        <Animated.View style={glassOverlayStyle} />
      </Animated.View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden', // Prevent any content from spilling outside
  },
  gradientContainer: {
    position: 'absolute',
    width: '120%', // Wider than the screen to prevent white edges
    height: '250%', // Much taller than the screen to allow for movement
    left: '-10%', // Center the wider container
    top: '-10%', // Start a bit above to prevent white edges
    overflow: 'hidden',
  },
});
