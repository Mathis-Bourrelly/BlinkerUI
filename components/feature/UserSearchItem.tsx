import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/base/ThemedText";
import { Row } from "@/components/base/Row";
import { ScoreDot } from "@/components/feature/ScoreDot";
import { Icon } from "@/components/images/Icon";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useUser } from "@/context/UserContext";
import { UserSearchResult } from "@/hooks/interfaces/useUserInterface";
import { useFollowMutation, useUnfollowMutation, useIsFollowingQuery } from "@/hooks/interfaces/useFollowInterface";

interface UserSearchItemProps {
  user: UserSearchResult;
}

export function UserSearchItem({ user }: UserSearchItemProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { user: currentUser } = useUser();
  const { t } = useTranslation();

  // Check if current user is following this user
  const { data: isFollowing, isLoading: isLoadingFollowStatus } = useIsFollowingQuery(user.userID, currentUser?.userID || undefined);

  // Follow/unfollow mutations
  const followMutation = useFollowMutation();
  const unfollowMutation = useUnfollowMutation();

  // État local pour une meilleure réactivité de l'UI
  const [isFollowingState, setIsFollowingState] = React.useState(false);

  // Mettre à jour l'état local quand les données sont chargées
  React.useEffect(() => {
    if (isFollowing !== undefined) {
      setIsFollowingState(isFollowing);
    }
  }, [isFollowing]);

  const handleFollowToggle = () => {
    // Mettre à jour l'état local immédiatement pour une meilleure réactivité
    setIsFollowingState(prevState => !prevState);

    if (isFollowingState) {
      unfollowMutation.mutate(user.userID, {
        onError: () => {
          // En cas d'erreur, rétablir l'état précédent
          setIsFollowingState(true);
        }
      });
    } else {
      followMutation.mutate(user.userID, {
        onError: () => {
          // En cas d'erreur, rétablir l'état précédent
          setIsFollowingState(false);
        }
      });
    }
  };

  const handleUserPress = () => {
    router.push(`/profile/${user.userID}`);
  };

  const handleMessagePress = () => {
    router.push(`/messages/${user.userID}`);
  };

  return (
    <TouchableOpacity
      style={[styles.userItem, { backgroundColor: colors.card }]}
      onPress={handleUserPress}
    >
      <View style={styles.userInfo}>
        <Image
          source={{ uri: user.avatar_url || `${process.env.EXPO_PUBLIC_API_URL}/uploads/default_user.png` }}
          style={[styles.avatar, { borderColor: colors.text }]}
        />
        <View style={styles.userDetails}>
          <ThemedText variant="Subtitle">{user.display_name}</ThemedText>
          <Row style={styles.usernameRow}>
            <ThemedText variant="Body">@{user.username}</ThemedText>
            <ScoreDot score={user.score} showText />
          </Row>
          {user.bio && (
            <ThemedText variant="Caption" numberOfLines={1} style={[styles.bio, { color: colors.text }]}>
              {user.bio}
            </ThemedText>
          )}
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.background,
              borderColor: colors.border
            }
          ]}
          onPress={handleMessagePress}
        >
          <Icon name="chat" size={20} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: isFollowingState ? colors.accent : colors.background,
              borderColor: colors.border
            }
          ]}
          onPress={handleFollowToggle}
        >
          <ThemedText
            variant="Caption"
            style={{ color: isFollowingState ? "#FFFFFF" : colors.text }}
          >
            {isFollowingState ? t('profile.following') : t('profile.follow')}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  usernameRow: {
    alignItems: 'center',
    marginTop: 2,
  },
  bio: {
    marginTop: 4,
    opacity: 0.8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
