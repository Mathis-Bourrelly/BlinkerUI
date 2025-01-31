import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import {useTheme} from '@/context/ThemeContext';
import {ThemedText} from "@/components/base/ThemedText";
import {Icon} from "@/components/images/Icon";

interface LanguageOption {
    code: string;
    label: string;
}

const languages: LanguageOption[] = [
    {code: 'en', label: 'English'},
    {code: 'fr', label: 'Français'},
    {code: 'jp', label: '日本語'},
];

export const LanguageDropdown: React.FC = () => {
    const {i18n} = useTranslation();
    const {colors} = useTheme();
    const [isOpen, setIsOpen] = useState(false); // État pour afficher ou cacher le menu
    const [selectedLanguage, setSelectedLanguage] = useState<string>(i18n.language); // Langue sélectionnée

    const handleLanguageChange = async (language: string) => {
        setSelectedLanguage(language);
        await i18n.changeLanguage(language); // Changer la langue avec i18next
        await AsyncStorage.setItem('language', language); // Stocker dans AsyncStorage
        setIsOpen(false); // Fermer le menu après sélection
    };

    return (
        <View>
            <TouchableOpacity
                style={[styles.button, {backgroundColor: colors.card}]}
                onPress={() => setIsOpen(!isOpen)}
            >
                <Icon name={"language"} size={32} color={colors.text}/>
            </TouchableOpacity>
            {isOpen && (
                <View style={[styles.dropdown, {backgroundColor: colors.card}]}>
                    {languages.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            style={styles.dropdownItem}
                            onPress={() => handleLanguageChange(lang.code)}
                        >
                            <ThemedText
                                style={[
                                    styles.dropdownText,
                                    {color: selectedLanguage === lang.code ? colors.text : colors.text},
                                ]}
                            >
                                {lang.label}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dropdown: {
        position: 'absolute',
        top: 45,
        left: 0,
        width: 'auto',
        borderRadius: 8,
        elevation: 5,
        paddingVertical: 5,
        zIndex: 1,
    },
    dropdownItem: {
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    dropdownText: {
        fontSize: 14,
    },
});
