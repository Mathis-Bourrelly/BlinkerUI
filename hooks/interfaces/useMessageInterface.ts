import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { MessageType, ConversationPreviewType, ConversationType, LegacyMessageType } from "@/types/MessagesType";
import { getToken } from "@/hooks/useSetToken";
import { useMessageContext } from "@/context/MessageContext";

type StandardResponse<T> = {
  success: boolean;
  status: number;
  message: string;
  data: T;
};

// Récupérer les conversations de l'utilisateur
export function useConversationsQuery(forceEnabled?: boolean) {
  // Utiliser le contexte pour déterminer si la requête doit être activée
  const { enableConversationsQuery } = useMessageContext();

  // Si forceEnabled est défini, il a priorité sur le contexte
  const isEnabled = forceEnabled !== undefined ? forceEnabled : enableConversationsQuery;

  // Suppression du log de débogage

  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to fetch conversations. Status: ${response.status}`);
      }

      return data.data as ConversationPreviewType[];
    },
    // Activer/désactiver la requête selon le contexte
    enabled: isEnabled,
    // Ajouter un staleTime pour éviter les refetch trop fréquents
    staleTime: 10000, // 10 secondes
    // Limiter les refetch automatiques
    refetchOnWindowFocus: false,
    refetchInterval: isEnabled ? 30000 : false // Refetch toutes les 30 secondes seulement si enabled
  });
}

// Note: useConversationMessagesQuery a été supprimé car cette fonctionnalité est maintenant gérée par WebSocket
// Utilisez useWebSocket().getConversationMessages(conversationID) à la place

// Pour la compatibilité avec l'existant - Récupérer les messages entre l'utilisateur connecté et un autre utilisateur
export function useMessagesBetweenQuery(userID: string) {
  return useQuery({
    queryKey: ["messages", userID],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/messages/between/${userID}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to fetch messages between users. Status: ${response.status}`);
      }

      // The API might return a standard response or a direct array
      return Array.isArray(data) ? data : data.data as MessageType[];
    },
    enabled: !!userID && userID !== "unknown",
    // Ajouter un staleTime pour éviter les refetch trop fréquents
    staleTime: 10000, // 10 secondes
    // Limiter les refetch automatiques
    refetchOnWindowFocus: false,
    refetchInterval: 30000 // Refetch toutes les 30 secondes
  });
}

// Récupérer les messages non lus
export function useUnreadMessagesQuery(forceEnabled?: boolean) {
  // Utiliser le contexte pour déterminer si la requête doit être activée
  const { enableUnreadMessagesQuery } = useMessageContext();

  // Si forceEnabled est défini, il a priorité sur le contexte
  const isEnabled = forceEnabled !== undefined ? forceEnabled : enableUnreadMessagesQuery;

  // Suppression du log de débogage

  return useQuery({
    queryKey: ["messages", "unread"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/messages/unread`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to fetch unread messages. Status: ${response.status}`);
      }

      // The API might return a standard response or a direct array
      return Array.isArray(data) ? data : data.data as MessageType[];
    },
    // Activer/désactiver la requête selon le contexte
    enabled: isEnabled,
    // Ajouter un staleTime pour éviter les refetch trop fréquents
    staleTime: 10000, // 10 secondes
    // Limiter les refetch automatiques
    refetchOnWindowFocus: false,
    refetchInterval: isEnabled ? 30000 : false // Refetch toutes les 30 secondes seulement si enabled
  });
}

// Note: useSendMessageMutation a été supprimé car cette fonctionnalité est maintenant gérée par WebSocket
// Utilisez useWebSocket().sendMessage(content, conversationID, receiverID) à la place

// Note: useMarkConversationAsReadMutation a été supprimé car cette fonctionnalité est maintenant gérée par WebSocket
// Utilisez useWebSocket().markAsRead(conversationID) à la place

// Pour la compatibilité avec l'existant - Marquer les messages d'un expéditeur comme lus
export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();

  // Utiliser directement useMutation pour créer la mutation
  return useMutation({
    mutationFn: async (senderID: string) => {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/messages/read/${senderID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json().catch(() => ({ success: true, message: 'Messages marked as read' }));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to mark messages as read');
      }

      return data;
    },
    onSuccess: (_, senderID) => {
      // Invalider les requêtes pour mettre à jour l'UI
      queryClient.invalidateQueries({ queryKey: ["messages", senderID] });
      queryClient.invalidateQueries({ queryKey: ["messages", "unread"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });
}
