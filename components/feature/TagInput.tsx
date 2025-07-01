import React, { useState, useEffect } from 'react';
import { 
    View, 
    TextInput, 
    StyleSheet, 
    TouchableOpacity, 
    FlatList, 
    ActivityIndicator 
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ThemedText } from '@/components/base/ThemedText';
import { TagChip } from './TagChip';
import { useTagSearchQuery, useValidateTagsMutation } from '@/hooks/interfaces/useTagInterface';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/images/Icon';

interface TagInputProps {
    tags: string[];
    onTagsChange: (tags: string[]) => void;
    placeholder?: string;
    maxTags?: number;
    errorText?: string;
}

export function TagInput({ 
    tags, 
    onTagsChange, 
    placeholder, 
    maxTags = 3,
    errorText 
}: TagInputProps) {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [localError, setLocalError] = useState('');

    // Hook pour rechercher des tags
    const { data: searchResults, isLoading: isSearching } = useTagSearchQuery(
        inputValue.trim(),
        10
    );

    // Hook pour valider les tags
    const validateMutation = useValidateTagsMutation();

    // Valider les tags quand ils changent
    useEffect(() => {
        if (tags.length > 0) {
            validateMutation.mutate(
                { body: { tags } },
                {
                    onSuccess: (response) => {
                        if (!response.data.valid && response.data.error) {
                            setLocalError(response.data.error);
                        } else {
                            setLocalError('');
                        }
                    },
                    onError: () => {
                        setLocalError(t('tags.validationError', 'Erreur de validation des tags'));
                    }
                }
            );
        } else {
            setLocalError('');
        }
    }, [tags]);

    const addTag = (tagName: string) => {
        const cleanTag = tagName.trim().toLowerCase();
        
        // Vérifications
        if (!cleanTag) return;
        if (tags.includes(cleanTag)) {
            setLocalError(t('tags.alreadyExists', 'Ce tag existe déjà'));
            return;
        }
        if (tags.length >= maxTags) {
            setLocalError(t('tags.maxReached', `Maximum ${maxTags} tags autorisés`));
            return;
        }

        // Ajouter le tag
        onTagsChange([...tags, cleanTag]);
        setInputValue('');
        setShowSuggestions(false);
        setLocalError('');
    };

    const removeTag = (tagToRemove: string) => {
        onTagsChange(tags.filter(tag => tag !== tagToRemove));
        setLocalError('');
    };

    const handleInputChange = (text: string) => {
        setInputValue(text);
        setShowSuggestions(text.trim().length > 0);
        setLocalError('');
    };

    const handleInputSubmit = () => {
        if (inputValue.trim()) {
            addTag(inputValue);
        }
    };

    const suggestions = searchResults?.data?.tags?.filter(
        tag => !tags.includes(tag.name.toLowerCase())
    ) || [];

    const displayError = errorText || localError;

    return (
        <View style={styles.container}>
            {/* Tags sélectionnés */}
            {tags.length > 0 && (
                <View style={styles.tagsContainer}>
                    {tags.map((tag, index) => (
                        <TagChip
                            key={index}
                            tag={tag}
                            variant="removable"
                            onRemove={() => removeTag(tag)}
                        />
                    ))}
                </View>
            )}

            {/* Input pour ajouter des tags */}
            <View style={[
                styles.inputContainer,
                { 
                    backgroundColor: colors.card,
                    borderColor: displayError ? colors.danger : colors.border
                }
            ]}>
                <Icon name="tag" size={20} color={colors.textSecondary} />
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={inputValue}
                    onChangeText={handleInputChange}
                    onSubmitEditing={handleInputSubmit}
                    placeholder={placeholder || t('tags.placeholder', 'Ajouter un tag...')}
                    placeholderTextColor={colors.textSecondary}
                    maxLength={30}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={tags.length < maxTags}
                />
                {isSearching && (
                    <ActivityIndicator size="small" color={colors.accent} />
                )}
            </View>

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
                <View style={[styles.suggestionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item) => item.name}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                                onPress={() => addTag(item.name)}
                            >
                                <ThemedText style={{ color: colors.text }}>
                                    #{item.name}
                                </ThemedText>
                            </TouchableOpacity>
                        )}
                        style={styles.suggestionsList}
                        keyboardShouldPersistTaps="handled"
                    />
                </View>
            )}

            {/* Message d'erreur */}
            {displayError && (
                <ThemedText style={[styles.errorText, { color: colors.danger }]}>
                    {displayError}
                </ThemedText>
            )}

            {/* Compteur de tags */}
            <ThemedText style={[styles.counterText, { color: colors.textSecondary }]}>
                {tags.length}/{maxTags} tags
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 8,
    },
    input: {
        flex: 1,
        height: 40,
        marginLeft: 8,
        fontSize: 16,
    },
    suggestionsContainer: {
        borderRadius: 8,
        borderWidth: 1,
        maxHeight: 150,
        marginBottom: 8,
    },
    suggestionsList: {
        maxHeight: 150,
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
    },
    errorText: {
        fontSize: 12,
        marginBottom: 4,
    },
    counterText: {
        fontSize: 12,
        textAlign: 'right',
    },
});
