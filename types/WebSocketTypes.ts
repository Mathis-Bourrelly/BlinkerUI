// WebSocket event types based on the API documentation
export interface WebSocketAuthentication {
  token: string;
}

// Base interface for all client events
export interface BaseClientEvent {
  requestId?: string; // Optional ID for tracking requests
}

export interface SendMessageEvent extends BaseClientEvent {
  content: string;
  conversationID?: string;
  receiverID?: string;
}

export interface MarkAsReadEvent extends BaseClientEvent {
  conversationID: string;
}

export interface GetConversationMessagesEvent extends BaseClientEvent {
  conversationID: string;
}

// Base interface for all server events
export interface BaseServerEvent {
  eventId: string;     // Unique ID for the event
  timestamp: number;   // Timestamp in milliseconds
  requestId?: string;  // ID of the original request if applicable
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

export interface MessageNotificationEvent extends BaseServerEvent {
  conversationID: string;
  message: NewMessageEvent;
}

export interface MessageSentEvent extends BaseServerEvent {
  success: boolean;
  messageID: string;
  conversationID: string;
}

export interface MarkAsReadConfirmationEvent extends BaseServerEvent {
  success: boolean;
  conversationID: string;
  count: number;
}

export interface MessagesReadEvent extends BaseServerEvent {
  conversationID: string;
  userID: string;
}

export interface ConversationMessagesEvent extends BaseServerEvent {
  conversationID: string;
  messages: NewMessageEvent[];
  count: number;
}

export interface MessagesExpiredEvent extends BaseServerEvent {
  conversationID: string;
  messageIDs: string[];
}

export interface ErrorEvent extends BaseServerEvent {
  message: string;
  code: string;
  details?: string;
}

// Error codes as defined in the documentation
export enum ErrorCode {
  EMPTY_CONTENT = 'EMPTY_CONTENT',
  CONVERSATION_NOT_FOUND = 'CONVERSATION_NOT_FOUND',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  MISSING_RECIPIENT = 'MISSING_RECIPIENT',
  SEND_MESSAGE_ERROR = 'SEND_MESSAGE_ERROR',
  MARK_READ_ERROR = 'MARK_READ_ERROR',
  GET_MESSAGES_ERROR = 'GET_MESSAGES_ERROR'
}

// Socket event names
export enum ClientEvents {
  SEND_MESSAGE = 'sendMessage',
  MARK_AS_READ = 'markAsRead',
  GET_CONVERSATION_MESSAGES = 'getConversationMessages',
}

export enum ServerEvents {
  MESSAGE_NOTIFICATION = 'messageNotification',
  MESSAGE_SENT = 'messageSent',
  MARK_AS_READ_CONFIRMATION = 'markAsReadConfirmation',
  MESSAGES_READ = 'messagesRead',
  CONVERSATION_MESSAGES = 'conversationMessages',
  MESSAGES_EXPIRED = 'messagesExpired',
  ERROR = 'error',
}
