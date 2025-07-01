import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { CommentType } from "@/types/CommentsType";
import { Icon } from "@/components/images/Icon";
import { ThemedText } from "@/components/base/ThemedText";
import { useTranslation } from "react-i18next";
import { useUpdateCommentMutation, useDeleteCommentMutation } from "@/hooks/interfaces/useCommentInterface";
import { useUser } from "@/context/UserContext";
import { router } from "expo-router";

interface CommentCardProps {
  comment: CommentType;
  onEdit?: (commentID: string, newContent: string) => void;
  onDelete?: (commentID: string) => void;
}

export function CommentCard({ comment, onEdit, onDelete }: CommentCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  
  const updateMutation = useUpdateCommentMutation(comment.commentID);
  const deleteMutation = useDeleteCommentMutation();

  const isOwner = user?.userID === comment.userID;

  console.log('CommentCard debug:', {
    currentUserID: user?.userID,
    commentUserID: comment.userID,
    isOwner: isOwner,
    commentID: comment.commentID
  });

  const handleEdit = async () => {
    if (editContent.trim() === comment.content.trim()) {
      setIsEditing(false);
      return;
    }

    try {
      await updateMutation.mutateAsync({ content: editContent.trim() });
      setIsEditing(false);
      onEdit?.(comment.commentID, editContent.trim());
    } catch (error) {
      console.error('Error updating comment:', error);
      window.alert(`${t('common.error')}: ${t('comment.updateError')}`);
    }
  };

  const handleDelete = async () => {
    console.log('handleDelete called for comment:', comment.commentID);

    // Utiliser window.confirm pour la compatibilité web
    const confirmMessage = `${t('comment.deleteTitle')}\n\n${t('comment.deleteMessage')}`;
    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) {
      console.log('Delete cancelled by user');
      return;
    }

    console.log('Delete confirmed, calling API...');
    try {
      console.log('Calling deleteMutation.mutateAsync with:', comment.commentID);
      const result = await deleteMutation.mutateAsync(comment.commentID);
      console.log('Delete API result:', result);
      console.log('Calling onDelete callback...');
      onDelete?.(comment.commentID);
      console.log('Delete completed successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      // Utiliser window.alert pour l'erreur aussi
      window.alert(`${t('common.error')}: ${t('comment.deleteError')}`);
    }
  };

  const handleProfilePress = () => {
    router.push(`/profile/${comment.userID}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return t('time.now');
    if (diffInMinutes < 60) return t('time.minutesAgo', { count: diffInMinutes });
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t('time.hoursAgo', { count: diffInHours });
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return t('time.daysAgo', { count: diffInDays });
    
    return date.toLocaleDateString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 30) return colors.valide;
    if (score >= 20) return colors.accent;
    return colors.danger;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header avec profil utilisateur */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileSection} onPress={handleProfilePress}>
          <Image
            source={{ uri: comment.profile.avatar_url }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <ThemedText style={styles.displayName}>{comment.profile.display_name}</ThemedText>
            <View style={styles.usernameRow}>
              <ThemedText style={[styles.username, { color: colors.textSecondary }]}>
                @{comment.profile.username}
              </ThemedText>
              <View style={[styles.scoreDot, { backgroundColor: getScoreColor(comment.profile.score) }]} />
              <ThemedText style={[styles.score, { color: colors.color }]}>
                {Math.round(comment.profile.score / 3600)}
              </ThemedText>
            </View>
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerRight}>
          <ThemedText style={[styles.timestamp, { color: colors.textSecondary }]}>
            {formatDate(comment.createdAt)}
          </ThemedText>
          
          {isOwner && (
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => setIsEditing(!isEditing)}
              >
                <Icon name="edit" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleDelete}
              >
                <Icon name="delete" size={16} color={colors.danger} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Contenu du commentaire */}
      <View style={styles.content}>
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={[styles.editInput, { 
                color: colors.text, 
                borderColor: colors.border,
                backgroundColor: colors.background 
              }]}
              value={editContent}
              onChangeText={setEditContent}
              multiline
              placeholder={t('comment.editPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              maxLength={1000}
            />
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={[styles.editButton, { backgroundColor: colors.border }]} 
                onPress={() => {
                  setEditContent(comment.content);
                  setIsEditing(false);
                }}
              >
                <ThemedText style={[styles.editButtonText, { color: colors.text }]}>
                  {t('common.cancel')}
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.editButton, { backgroundColor: colors.accent }]} 
                onPress={handleEdit}
                disabled={updateMutation.isPending}
              >
                <ThemedText style={[styles.editButtonText, { color: colors.color }]}>
                  {updateMutation.isPending ? t('common.saving') : t('common.save')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ThemedText style={styles.commentText}>{comment.content}</ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  profileSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontSize: 14,
  },
  scoreDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  score: {
    fontSize: 12,
    fontWeight: '500',
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  timestamp: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  content: {
    marginTop: 4,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 20,
  },
  editContainer: {
    gap: 12,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
