import { useFetchQuery } from "@/hooks/repository/useFetchQuery";
import { usePostMutation } from "@/hooks/repository/usePostMutation";
import { usePutMutation } from "@/hooks/repository/usePutMutation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { MessageType, ConversationPreviewType, ConversationType, LegacyMessageType } from "@/types/MessagesType";
import { getToken } from "@/hooks/useSetToken";

// Récupérer les conversations de l'utilisateur
export function useConversationsQuery() {
  return useFetchQuery(`/conversations`, ["conversations"]);
}

// Récupérer les messages d'une conversation spécifique
export function useConversationMessagesQuery(conversationID: string) {
  return useFetchQuery(`/messages/conversation/${conversationID}`, ["messages", "conversation", conversationID]);
}

// Pour la compatibilité avec l'existant - Récupérer les messages entre l'utilisateur connecté et un autre utilisateur
export function useMessagesBetweenQuery(userID: string) {
  return useFetchQuery(`/messages/between/${userID}`, ["messages", userID]);
}

// Récupérer les messages non lus
export function useUnreadMessagesQuery() {
  return useFetchQuery(`/messages/unread`, ["messages", "unread"]);
}

// Envoyer un nouveau message
export function useSendMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageData: {
      conversationID?: string;
      receiverID?: string;
      content: string;
    }) => {
      // Toujours utiliser l'endpoint /messages comme spécifié dans la documentation API
      const endpoint = "/messages";

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to send message' }));
        throw new Error(errorData.message || 'Failed to send message');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalider les requêtes pour mettre à jour l'UI
      if (variables.conversationID) {
        queryClient.invalidateQueries({ queryKey: ["messages", "conversation", variables.conversationID] });
      }
      if (variables.receiverID) {
        queryClient.invalidateQueries({ queryKey: ["messages", variables.receiverID] });
      }
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });
}

// Marquer les messages d'une conversation comme lus
export function useMarkConversationAsReadMutation() {
  const queryClient = useQueryClient();

  // Utiliser directement useMutation pour créer la mutation
  return useMutation({
    mutationFn: async (conversationID: string) => {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/messages/read/conversation/${conversationID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark conversation as read');
      }

      return response.json().catch(() => ({})); // Retourner un objet vide si pas de JSON
    },
    onSuccess: (_, conversationID) => {
      // Invalider les requêtes pour mettre à jour l'UI
      queryClient.invalidateQueries({ queryKey: ["messages", "conversation", conversationID] });
      queryClient.invalidateQueries({ queryKey: ["messages", "unread"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });
}

// Pour la compatibilité avec l'existant - Marquer les messages d'un expéditeur comme lus
export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();

  // Utiliser directement useMutation pour créer la mutation
  return useMutation({
    mutationFn: async (senderID: string) => {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/messages/read/${senderID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark messages as read');
      }

      return response.json().catch(() => ({})); // Retourner un objet vide si pas de JSON
    },
    onSuccess: (_, senderID) => {
      // Invalider les requêtes pour mettre à jour l'UI
      queryClient.invalidateQueries({ queryKey: ["messages", senderID] });
      queryClient.invalidateQueries({ queryKey: ["messages", "unread"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });
}
