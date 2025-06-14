import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Icon } from "@/components/images/Icon";
import { ThemedText } from "@/components/base/ThemedText";
import { useTranslation } from "react-i18next";
import { useCreateCommentMutation } from "@/hooks/interfaces/useCommentInterface";

interface CommentInputProps {
  blinkID: string;
  onCommentCreated?: () => void;
  placeholder?: string;
}

export function CommentInput({ blinkID, onCommentCreated, placeholder }: CommentInputProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const createMutation = useCreateCommentMutation();

  const handleSubmit = async () => {
    const trimmedContent = content.trim();

    // Réinitialiser le message d'erreur
    setErrorMessage("");

    if (!trimmedContent) {
      setErrorMessage('comment.emptyError');
      return;
    }

    if (trimmedContent.length > 1000) {
      setErrorMessage('comment.tooLongError');
      return;
    }

    try {
      await createMutation.mutateAsync({
        blinkID,
        content: trimmedContent
      });

      setContent("");
      setErrorMessage("");
      onCommentCreated?.();
    } catch (error: any) {
      console.error('Error creating comment:', error);

      // Vérifier si c'est l'erreur "AlreadyCommented"
      const errorMsg = error?.message || '';

      if (errorMsg.includes('Comments.AlreadyCommented')) {
        setErrorMessage('comment.alreadyCommented');
      } else {
        setErrorMessage('comment.createError');
      }
    }
  };

  const isSubmitDisabled = !content.trim() || createMutation.isPending;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[
        styles.inputContainer,
        {
          borderColor: errorMessage ? colors.danger : (isFocused ? colors.accent : colors.border),
          backgroundColor: colors.background
        }
      ]}>
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          value={content}
          onChangeText={setContent}
          placeholder={placeholder || t('comment.placeholder')}
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={1000}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          textAlignVertical="top"
        />
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            { 
              backgroundColor: isSubmitDisabled ? colors.border : colors.accent,
              opacity: isSubmitDisabled ? 0.5 : 1
            }
          ]}
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
        >
          {createMutation.isPending ? (
            <Icon name="loading" size={20} color={colors.color} />
          ) : (
            <Icon name="send" size={20} color={colors.color} />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Compteur de caractères */}
      <View style={styles.footer}>
        <ThemedText style={[
          styles.characterCount,
          {
            color: content.length > 900 ? colors.danger : colors.textSecondary
          }
        ]}>
          {content.length}/1000
        </ThemedText>
      </View>

      {/* Message d'erreur */}
      {errorMessage && (
        <View style={styles.errorContainer}>
          <ThemedText variant="Body" color={colors.danger}>
            <ThemedText variant="BodyBold" color={colors.danger}>
              {t("base.error")}
            </ThemedText>
            : {t(errorMessage)}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    margin: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    minHeight: 40,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
  },
  errorContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
});
