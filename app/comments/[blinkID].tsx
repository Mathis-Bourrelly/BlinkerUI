import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { ThemedText } from '@/components/base/ThemedText';
import { Icon } from '@/components/images/Icon';
import { CommentList } from '@/components/feature/CommentList';
import { BlinkCard } from '@/components/feature/BlinkCard';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBlinkInterface } from '@/hooks/interfaces/useBlinkInterface';

// Fonction pour s'assurer que l'avatar_url est complète
function ensureFullAvatarUrl(blink: any) {
  if (!blink || !blink.profile) {
    return blink;
  }

  // Si l'avatar_url est déjà une URL complète, la garder telle quelle
  if (blink.profile.avatar_url && blink.profile.avatar_url.startsWith('http')) {
    return blink;
  }

  // Sinon, construire l'URL complète
  const fullAvatarUrl = blink.profile.avatar_url
    ? `${process.env.EXPO_PUBLIC_API_URL}/uploads/${blink.profile.avatar_url}`
    : `${process.env.EXPO_PUBLIC_API_URL}/uploads/default_user.png`;

  return {
    ...blink,
    profile: {
      ...blink.profile,
      avatar_url: fullAvatarUrl
    }
  };
}

export default function CommentsPage() {
  const { blinkID } = useLocalSearchParams<{ blinkID: string }>();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Récupérer les données du blink (qui incluent maintenant le profil)
  const { data: blinkData, isLoading: isBlinkLoading, isError: isBlinkError } = useBlinkInterface(blinkID || '');

  // Debug: Log pour voir la structure des données
  console.log('Blink data from API (with profile):', blinkData);

  if (!blinkID) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.errorText, { color: colors.danger }]}>
          {t('comment.invalidBlink')}
        </ThemedText>
      </View>
    );
  }

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header simple avec bouton retour */}
      <View style={[styles.simpleHeader, { backgroundColor: colors.background }]}>
          <TouchableOpacity
              style={[
                styles.backButtonAboveBlink,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  shadowColor: colors.text,
                }
              ]}
              onPress={handleGoBack}
              activeOpacity={0.7}
          >
            <Icon name="left" size={18} color={colors.text} />
            <ThemedText style={[styles.backButtonText, { color: colors.text }]}>
              {t('common.back')}
            </ThemedText>
          </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* Affichage du blink */}
        {isBlinkLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
              Chargement du blink...
            </ThemedText>
          </View>
        ) : isBlinkError || !blinkData?.data ? (
          <View style={styles.errorContainer}>
            <ThemedText style={[styles.errorText, { color: colors.danger }]}>
              Erreur lors du chargement du blink
            </ThemedText>
          </View>
        ) : (
          <View style={styles.blinkContainer}>
            {(() => {
              // S'assurer que l'avatar_url est complète
              const blinkWithFullAvatar = ensureFullAvatarUrl(blinkData.data);
              console.log('About to render BlinkCard with:', blinkWithFullAvatar);

              // Vérification de sécurité
              if (!blinkWithFullAvatar || !blinkWithFullAvatar.profile) {
                return (
                  <View style={styles.errorContainer}>
                    <ThemedText style={[styles.errorText, { color: colors.danger }]}>
                      Erreur: Structure de données du blink invalide
                    </ThemedText>
                  </View>
                );
              }

              return <BlinkCard blink={blinkWithFullAvatar} onExpire={() => {
                // Gérer l'expiration du blink si nécessaire
                console.log('Blink expired:', blinkWithFullAvatar.blinkID);
              }} />;
            })()}
          </View>
        )}

        {/* Liste des commentaires */}
        <CommentList blinkID={blinkID} showInput={true} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  simpleHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  backButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButtonAboveBlink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  backButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  blinkContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
