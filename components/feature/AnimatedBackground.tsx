import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withRepeat, 
  interpolateColor,
  Easing,
  useDerivedValue
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface AnimatedBackgroundProps {
  scrollY: Animated.SharedValue<number>;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ scrollY }) => {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  
  // Animation pour le dégradé principal
  const gradientProgress = useSharedValue(0);
  
  // Animation pour les blobs
  const blob1Position = useSharedValue({ x: width * 0.2, y: height * 0.3 });
  const blob2Position = useSharedValue({ x: width * 0.7, y: height * 0.6 });
  const blob3Position = useSharedValue({ x: width * 0.5, y: height * 0.2 });
  
  const blob1Scale = useSharedValue(1);
  const blob2Scale = useSharedValue(1.2);
  const blob3Scale = useSharedValue(0.8);
  
  const blob1Opacity = useSharedValue(0.4);
  const blob2Opacity = useSharedValue(0.3);
  const blob3Opacity = useSharedValue(0.5);

  // Dérivation des couleurs du dégradé en fonction du scroll
  const derivedGradientColors = useDerivedValue(() => {
    // Normaliser la valeur de défilement pour l'utiliser dans l'interpolation
    const normalizedScroll = Math.min(scrollY.value / (height * 0.8), 1);
    
    // Combiner l'animation autonome et le défilement
    const combinedProgress = (gradientProgress.value + normalizedScroll) % 1;
    
    // Couleurs de base du thème
    const baseColors = colors.gradient;
    const accentColors = colors.accentGradient;
    
    // Interpoler entre différentes variations de couleurs
    return [
      interpolateColor(
        combinedProgress,
        [0, 0.5, 1],
        [baseColors[0], accentColors[0], baseColors[0]]
      ),
      interpolateColor(
        combinedProgress,
        [0, 0.5, 1],
        [baseColors[1], accentColors[1], baseColors[1]]
      ),
      interpolateColor(
        combinedProgress,
        [0, 0.5, 1],
        [baseColors[2] || baseColors[1], colors.accent, baseColors[2] || baseColors[1]]
      ),
      interpolateColor(
        combinedProgress,
        [0, 0.5, 1],
        [baseColors[3] || baseColors[2] || baseColors[1], colors.background, baseColors[3] || baseColors[2] || baseColors[1]]
      ),
    ];
  });

  // Démarrer les animations autonomes
  useEffect(() => {
    // Animation du dégradé
    gradientProgress.value = withRepeat(
      withTiming(1, { duration: 15000, easing: Easing.inOut(Easing.ease) }),
      -1, // répéter indéfiniment
      true // aller-retour
    );
    
    // Animation des blobs
    const animateBlobs = () => {
      // Blob 1
      blob1Position.value = {
        x: withRepeat(
          withTiming(width * 0.3, { duration: 20000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        ),
        y: withRepeat(
          withTiming(height * 0.4, { duration: 25000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        ),
      };
      
      blob1Scale.value = withRepeat(
        withTiming(1.3, { duration: 15000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      
      // Blob 2
      blob2Position.value = {
        x: withRepeat(
          withTiming(width * 0.6, { duration: 30000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        ),
        y: withRepeat(
          withTiming(height * 0.5, { duration: 20000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        ),
      };
      
      blob2Scale.value = withRepeat(
        withTiming(0.9, { duration: 20000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      
      // Blob 3
      blob3Position.value = {
        x: withRepeat(
          withTiming(width * 0.4, { duration: 25000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        ),
        y: withRepeat(
          withTiming(height * 0.3, { duration: 30000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        ),
      };
      
      blob3Scale.value = withRepeat(
        withTiming(1.1, { duration: 18000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    };
    
    animateBlobs();
  }, [width, height]);

  // Styles animés pour le dégradé principal
  const gradientStyle = useAnimatedStyle(() => {
    // Effet de parallaxe basé sur le défilement
    const translateY = -scrollY.value * 0.3; // Effet de parallaxe léger
    
    return {
      transform: [{ translateY }],
    };
  });

  // Styles animés pour les blobs
  const blob1Style = useAnimatedStyle(() => {
    // Ajuster la position en fonction du défilement
    const translateY = blob1Position.value.y - scrollY.value * 0.15;
    
    return {
      position: 'absolute',
      left: blob1Position.value.x,
      top: translateY,
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor: colors.accent,
      opacity: blob1Opacity.value,
      transform: [
        { scale: blob1Scale.value },
      ],
    };
  });
  
  const blob2Style = useAnimatedStyle(() => {
    // Ajuster la position en fonction du défilement
    const translateY = blob2Position.value.y - scrollY.value * 0.1;
    
    return {
      position: 'absolute',
      left: blob2Position.value.x,
      top: translateY,
      width: 250,
      height: 250,
      borderRadius: 125,
      backgroundColor: colors.secondary,
      opacity: blob2Opacity.value,
      transform: [
        { scale: blob2Scale.value },
      ],
    };
  });
  
  const blob3Style = useAnimatedStyle(() => {
    // Ajuster la position en fonction du défilement
    const translateY = blob3Position.value.y - scrollY.value * 0.2;
    
    return {
      position: 'absolute',
      left: blob3Position.value.x,
      top: translateY,
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: colors.card,
      opacity: blob3Opacity.value,
      transform: [
        { scale: blob3Scale.value },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <AnimatedLinearGradient
        colors={derivedGradientColors.value}
        style={[styles.gradient, gradientStyle]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Blobs flous */}
      <Animated.View style={[styles.blob, blob1Style]} />
      <Animated.View style={[styles.blob, blob2Style]} />
      <Animated.View style={[styles.blob, blob3Style]} />
      
      {/* Overlay pour l'effet glassmorphism */}
      <View style={styles.glassOverlay} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  blob: {
    position: 'absolute',
    borderRadius: 150,
    filter: 'blur(70px)', // Fonctionne sur le web
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)', // Fonctionne sur le web
  },
});

export default AnimatedBackground;
