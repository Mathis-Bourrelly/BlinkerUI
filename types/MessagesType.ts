export interface ConversationType {
  conversationID: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageType {
  messageID: string;
  conversationID: string;
  senderID: string;
  content: string;
  createdAt: string;
  expiresAt: string;
  isRead: boolean;
  sender?: {
    userID: string;
    email?: string;
    display_name?: string;
    username?: string;
    avatar_url?: string;
    score?: number;
  };
}

// For backward compatibility
export interface LegacyMessageType {
  messageID: string;
  senderID: string;
  receiverID: string;
  content: string;
  createdAt: string;
  expiresAt: string;
  read: boolean;
}

export interface ConversationPreviewType {
  conversationID: string;
  userID: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  lastMessage: {
    content: string;
    createdAt: string;
    read: boolean; // Note: l'API peut renvoyer 'read' ou 'isRead'
    isRead?: boolean; // Support pour les deux formats
    isFromUser: boolean;
  };
  unreadCount: number;
}
