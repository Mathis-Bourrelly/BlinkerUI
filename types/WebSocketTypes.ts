// WebSocket event types based on the API documentation
export interface WebSocketAuthentication {
  token: string;
}

export interface SendMessageEvent {
  content: string;
  conversationID?: string;
  receiverID?: string;
}

export interface MarkAsReadEvent {
  conversationID: string;
}

export interface GetConversationMessagesEvent {
  conversationID: string;
}

export interface NewMessageEvent {
  messageID: string;
  conversationID: string;
  content: string;
  expiresAt: string;
  isRead: boolean;
  senderID: string;
  createdAt: string;
  sender?: {
    userID: string;
    email?: string;
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export interface MessageNotificationEvent {
  conversationID: string;
  message: NewMessageEvent;
}

export interface MessagesReadEvent {
  conversationID: string;
  userID: string;
}

export interface ConversationMessagesEvent {
  conversationID: string;
  messages: NewMessageEvent[];
}

export interface MessagesExpiredEvent {
  conversationID: string;
  messageIDs: string[];
}

export interface ErrorEvent {
  message: string;
}

// Socket event names
export enum ClientEvents {
  SEND_MESSAGE = 'sendMessage',
  MARK_AS_READ = 'markAsRead',
  GET_CONVERSATION_MESSAGES = 'getConversationMessages',
}

export enum ServerEvents {
  NEW_MESSAGE = 'newMessage',
  MESSAGE_NOTIFICATION = 'messageNotification',
  MESSAGES_READ = 'messagesRead',
  CONVERSATION_MESSAGES = 'conversationMessages',
  MESSAGES_EXPIRED = 'messagesExpired',
  ERROR = 'error',
}
