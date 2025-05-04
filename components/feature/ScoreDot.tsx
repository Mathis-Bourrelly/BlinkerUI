import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { useFormatUserScore } from '@/utils/scoreUtils';
import { useTheme } from '@/context/ThemeContext';

type ScoreDotProps = {
  score: number;
  showValue?: boolean;
  size?: number;
  onPress?: () => void;
};

/**
 * Composant qui affiche un point coloré représentant le score de l'utilisateur
 * La couleur varie selon le score:
 * - Rouge (danger) pour un score < 20 jours
 * - Couleur d'accent pour un score entre 20 et 30 jours
 * - Vert (valide) pour un score > 30 jours
 */
export function ScoreDot({
  score,
  showValue = false,
  size = 8,
  onPress
}: ScoreDotProps) {
  const { colors } = useTheme();
  const { formatScore, getScoreDotColor } = useFormatUserScore();

  // Convertir le score en jours pour la comparaison
  // Pour un score de 86400 (24h), on considère que c'est 1 jour
  const scoreInDays = score / 86400;

  // Afficher les valeurs pour le débogage
  console.log(`Score en secondes: ${score}, Score en jours: ${scoreInDays}`);

  // Déterminer la couleur en fonction du score en jours
  let dotColor;

  // Pour un score de 86400 (24h/1j), on utilise la couleur d'accent
  if (score === 86400) {
    dotColor = colors.accent; // Couleur d'accent pour exactement 1 jour (24h)
  } else if (scoreInDays < 20) {
    dotColor = colors.danger; // Rouge pour score < 20 jours
  } else if (scoreInDays >= 20 && scoreInDays <= 30) {
    dotColor = colors.accent; // Couleur d'accent pour score entre 20 et 30 jours
  } else {
    dotColor = colors.valide; // Vert pour score > 30 jours
  }

  const dotStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: dotColor
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.dot, dotStyle]} />
      {showValue && (
        <Text style={[styles.scoreText, { color: colors.text }]}>
          {formatScore(score)}
        </Text>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    marginRight: 4,
  },
  scoreText: {
    fontSize: 12,
  }
});
