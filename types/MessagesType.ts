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
  read: boolean;
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
  participant: {
    userID: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    score?: number;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    read: boolean;
  };
  unreadCount: number;
}
