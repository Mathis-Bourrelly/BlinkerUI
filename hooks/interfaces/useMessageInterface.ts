import { useFetchQuery } from "@/hooks/repository/useFetchQuery";
import { usePostMutation } from "@/hooks/repository/usePostMutation";
import { usePutMutation } from "@/hooks/repository/usePutMutation";
import { useQueryClient } from "@tanstack/react-query";
import { MessageType, ConversationPreviewType, ConversationType, LegacyMessageType } from "@/types/MessagesType";

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

// Envoyer un nouveau message avec conversationID
export function useSendMessageMutation() {
  const queryClient = useQueryClient();

  return usePostMutation<{
    conversationID?: string;
    receiverID?: string;
    content: string;
  }>("/messages", {
    onSuccess: (data, variables) => {
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

  return usePutMutation<void, string>("/messages/read/conversation/{conversationID}", {
    onSuccess: (data, conversationID) => {
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

  return usePutMutation<void, string>("/messages/read/{senderID}", {
    onSuccess: (data, senderID) => {
      // Invalider les requêtes pour mettre à jour l'UI
      queryClient.invalidateQueries({ queryKey: ["messages", senderID] });
      queryClient.invalidateQueries({ queryKey: ["messages", "unread"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });
}
