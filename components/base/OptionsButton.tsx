import React, {useEffect, useRef, useState} from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Icon } from '@/components/images/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemeToggleIcon } from '@/components/base/ThemeToggleIcon';
import { LanguageIcon } from '@/components/base/LanguageIcon';
import { useTranslation } from 'react-i18next';
import { Row } from '@/components/base/Row';
import { CountryFlag } from '@/components/images/CountryFlag';

export const OptionsButton: React.FC = () => {
  const { colors, toggleTheme } = useTheme();
  const { i18n, t } = useTranslation();
  const [showOptions, setShowOptions] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Fonction pour changer la langue
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setShowLanguageDropdown(false);
  };

  const optionsRef = useRef<any>(null);
  const buttonRef = useRef<any>(null);

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
          setShowLanguageDropdown(false);
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

  return (
    <View>
      {/* Bouton principal */}
      <TouchableOpacity
        onPress={() => setShowOptions(!showOptions)}
        style={[styles.optionsButton, { backgroundColor: colors.card }]}
      >
        <Icon name="settings" size={24} color={colors.text} />
      </TouchableOpacity>

      {/* Menu d'options en modal pour éviter les problèmes de z-index et de clic */}
      {Platform.OS === 'web' ? (
        // Version web avec positionnement absolu
        showOptions && (
          <View
            style={[
              styles.webOptionsContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              }
            ]}
          >
            {/* Option de thème */}
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                toggleTheme();
                setShowOptions(false);
              }}
            >
              <ThemedText style={styles.optionLabel}>{t('navigation.theme')}</ThemedText>
              <ThemeToggleIcon />
            </TouchableOpacity>

            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            <TouchableOpacity
                style={styles.optionItem}
                onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <Row gap={8} style={{alignItems: 'center'}}>
                <ThemedText style={styles.optionLabel}>{t('navigation.languageLabel')}</ThemedText>
              </Row>
              <LanguageIcon />
            </TouchableOpacity>
            {showLanguageDropdown && (
                <View style={styles.languageDropdown}>
                  <TouchableOpacity
                      style={styles.languageOption}
                      onPress={() => {
                        i18n.changeLanguage('fr');
                        setShowLanguageDropdown(false);
                      }}
                  >
                    <Row gap={8} style={styles.languageRow}>
                      <CountryFlag countryCode="fr" size={20} />
                      <ThemedText style={[styles.languageText, i18n.language === 'fr' && styles.activeLanguage]}>Français</ThemedText>
                    </Row>
                  </TouchableOpacity>
                  <TouchableOpacity
                      style={styles.languageOption}
                      onPress={() => {
                        i18n.changeLanguage('en');
                        setShowLanguageDropdown(false);
                      }}
                  >
                    <Row gap={8} style={styles.languageRow}>
                      <CountryFlag countryCode="en" size={20} />
                      <ThemedText style={[styles.languageText, i18n.language === 'en' && styles.activeLanguage]}>English</ThemedText>
                    </Row>
                  </TouchableOpacity>
                  <TouchableOpacity
                      style={styles.languageOption}
                      onPress={() => {
                        i18n.changeLanguage('jp');
                        setShowLanguageDropdown(false);
                      }}
                  >
                    <Row gap={8} style={styles.languageRow}>
                      <CountryFlag countryCode="jp" size={20} />
                      <ThemedText style={[styles.languageText, i18n.language === 'jp' && styles.activeLanguage]}>日本語</ThemedText>
                    </Row>
                  </TouchableOpacity>
                </View>
            )}
          </View>
        )
      ) : (
        // Version mobile avec modal
        <Modal
          visible={showOptions}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowOptions(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowOptions(false)}
          >
            <View 
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }
              ]}
            >
              {/* Option de thème */}
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  toggleTheme();
                  setShowOptions(false);
                }}
              >
                <ThemedText style={styles.optionLabel}>{t('navigation.theme')}</ThemedText>
                <ThemeToggleIcon />
              </TouchableOpacity>
              
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
              
              {/* Option de langue */}
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
              >
                <ThemedText style={styles.optionLabel}>{t('navigation.languageLabel')}</ThemedText>
                <LanguageIcon />
              </TouchableOpacity>
              
              {/* Menu déroulant des langues */}
              {showLanguageDropdown && (
                <View style={[styles.languageDropdown, { borderTopColor: colors.border }]}>
                  {/* Français */}
                  <TouchableOpacity
                    style={[styles.languageOption, i18n.language === 'fr' && { backgroundColor: colors.accent + '30' }]}
                    onPress={() => changeLanguage('fr')}
                  >
                    <Row gap={8} style={styles.languageRow}>
                      <CountryFlag countryCode="fr" size={20} />
                      <ThemedText style={[styles.languageText, i18n.language === 'fr' && styles.activeLanguage]}>Français</ThemedText>
                    </Row>
                  </TouchableOpacity>
                  
                  {/* English */}
                  <TouchableOpacity
                    style={[styles.languageOption, i18n.language === 'en' && { backgroundColor: colors.accent + '30' }]}
                    onPress={() => changeLanguage('en')}
                  >
                    <Row gap={8} style={styles.languageRow}>
                      <CountryFlag countryCode="en" size={20} />
                      <ThemedText style={[styles.languageText, i18n.language === 'en' && styles.activeLanguage]}>English</ThemedText>
                    </Row>
                  </TouchableOpacity>
                  
                  {/* Japonais */}
                  <TouchableOpacity
                    style={[styles.languageOption, i18n.language === 'jp' && { backgroundColor: colors.accent + '30' }]}
                    onPress={() => changeLanguage('jp')}
                  >
                    <Row gap={8} style={styles.languageRow}>
                      <CountryFlag countryCode="jp" size={20} />
                      <ThemedText style={[styles.languageText, i18n.language === 'jp' && styles.activeLanguage]}>日本語</ThemedText>
                    </Row>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  optionsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webOptionsContainer: {
    position: 'absolute',
    top: 45,
    right: 0,
    width: 180,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    zIndex: 10000,
    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.3)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 250,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    margin: 20,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  separator: {
    height: 1,
    width: '100%',
    marginVertical: 8,
  },
  languageDropdown: {
    marginTop: 8,
    width: '100%',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  languageOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginVertical: 4,
  },
  languageText: {
    fontSize: 14,
  },
  activeLanguage: {
    fontWeight: 'bold',
  },
  languageRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
