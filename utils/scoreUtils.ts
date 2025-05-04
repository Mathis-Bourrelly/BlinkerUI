import { ProfileType } from "@/types/usersType";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

/**
 * Hook to format user scores for display
 * @returns Object with formatting functions
 */
export function useFormatUserScore() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  /**
   * Format a user score from seconds to a human-readable string
   * @param scoreInSeconds User score in seconds
   * @returns Formatted score string (e.g., "24h" or "3d")
   */
  const formatScore = (scoreInSeconds: number): string => {
    // Default minimum score (24 hours)
    const minimumScore = 86400;

    // Use the higher of actual score or minimum
    const effectiveScore = Math.max(scoreInSeconds, minimumScore);

    // Toujours afficher en heures si c'est exactement 24h (1 jour)
    if (effectiveScore <= 86400) {
      // 24 heures ou moins - montrer en heures
      return `${Math.round(effectiveScore / 3600)}`;
    } else {
      // Plus d'un jour - montrer en jours
      return `${Math.round(effectiveScore / 86400)}`;
    }
  };

  /**
   * Get a description of what the score means
   * @param profile User profile with score
   * @returns Description string
   */
  const getScoreDescription = (profile: ProfileType): string => {
    const scoreInDays = profile.score / 86400;

    if (scoreInDays < 1) {
      return t('profile.scoreDescriptionLow');
    } else if (scoreInDays < 3) {
      return t('profile.scoreDescriptionMedium');
    } else {
      return t('profile.scoreDescriptionHigh');
    }
  };

  /**
   * Get the appropriate color for the score dot based on score value
   * @param scoreInSeconds User score in seconds
   * @returns Color string from theme
   */
  const getScoreDotColor = (scoreInSeconds: number): string => {
    // Convert seconds to days for comparison
    const scoreInDays = scoreInSeconds / 86400;

    // Afficher les valeurs pour le débogage
    console.log(`Score en secondes: ${scoreInSeconds}, Score en jours: ${scoreInDays}`);

    // Pour un score de 86400 (24h/1j), on utilise la couleur d'accent
    if (scoreInSeconds === 86400) {
      return colors.accent; // Couleur d'accent pour exactement 1 jour (24h)
    } else if (scoreInDays < 20) {
      return colors.danger; // Rouge pour score < 20 jours
    } else if (scoreInDays >= 20 && scoreInDays <= 30) {
      return colors.accent; // Couleur d'accent pour score entre 20 et 30 jours
    } else {
      return colors.valide; // Vert pour score > 30 jours
    }
  };

  return { formatScore, getScoreDescription, getScoreDotColor };
}
