import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { getToken } from "@/hooks/useSetToken";
import { 
  CommentType, 
  CreateCommentRequest, 
  UpdateCommentRequest,
  CommentResponse,
  CommentMutationResponse 
} from "@/types/CommentsType";

// Hook pour récupérer les commentaires d'un blink avec pagination
export function useCommentsQuery(blinkID: string) {
  return usePaginatedQuery<CommentType>(
    `comments-${blinkID}`, 
    `/comments/${blinkID}`
  );
}

// Hook pour récupérer les commentaires d'un utilisateur
export function useUserCommentsQuery(userID: string) {
  return usePaginatedQuery<CommentType>(
    `user-comments-${userID}`, 
    `/comments/user/${userID}`
  );
}

// Hook pour créer un commentaire
export function useCreateCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCommentRequest) => {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to create comment. Status: ${response.status}`);
      }

      return result as CommentResponse;
    },
    onSuccess: (data, variables) => {
      // Invalider le cache des commentaires pour ce blink
      queryClient.invalidateQueries({ queryKey: [`comments-${variables.blinkID}`] });
      
      // Invalider le cache des blinks pour mettre à jour le commentCount
      queryClient.invalidateQueries({ queryKey: ['blinks'] });
      queryClient.invalidateQueries({ queryKey: [`blink`, variables.blinkID] });
    }
  });
}

// Hook pour modifier un commentaire
export function useUpdateCommentMutation(commentID: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCommentRequest) => {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/comments/${commentID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to update comment. Status: ${response.status}`);
      }

      return result as CommentMutationResponse;
    },
    onSuccess: () => {
      // Invalider tous les caches de commentaires
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    }
  });
}

// Hook pour supprimer un commentaire
export function useDeleteCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentID: string) => {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/comments/${commentID}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to delete comment. Status: ${response.status}`);
      }

      return result as CommentMutationResponse;
    },
    onSuccess: () => {
      // Invalider tous les caches de commentaires et blinks
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['blinks'] });
    }
  });
}

// Hook pour récupérer un commentaire spécifique
export function useCommentQuery(commentID: string) {
  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/comments/comment/${commentID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to fetch comment. Status: ${response.status}`);
      }

      return result as CommentResponse;
    }
  });
}
