import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import webSocketService from '@/services/WebSocketService';
import { useUser } from './UserContext';
import { useMessageContext } from './MessageContext';
import {
  ServerEvents,
  NewMessageEvent,
  MessageNotificationEvent,
  MessageSentEvent,
  MarkAsReadConfirmationEvent,
  MessagesReadEvent,
  ConversationMessagesEvent,
  MessagesExpiredEvent,
  ErrorEvent,
  ErrorCode
} from '@/types/WebSocketTypes';

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (content: string, conversationID?: string, receiverID?: string) => Promise<MessageSentEvent>;
  markAsRead: (conversationID: string) => Promise<MarkAsReadConfirmationEvent>;
  getConversationMessages: (conversationID: string) => Promise<ConversationMessagesEvent>;
  onMessageNotification: (handler: (data: MessageNotificationEvent) => void) => () => void;
  onMessageSent: (handler: (data: MessageSentEvent) => void) => () => void;
  onMarkAsReadConfirmation: (handler: (data: MarkAsReadConfirmationEvent) => void) => () => void;
  onMessagesRead: (handler: (data: MessagesReadEvent) => void) => () => void;
  onConversationMessages: (handler: (data: ConversationMessagesEvent) => void) => () => void;
  onMessagesExpired: (handler: (data: MessagesExpiredEvent) => void) => () => void;
  onError: (handler: (data: ErrorEvent) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useUser();
  const { setHasUnreadMessages, setUnreadCount } = useMessageContext();

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    let socket: Socket | null = null;

    const connectWebSocket = async () => {
      if (user?.userID) {
        try {
          socket = await webSocketService.connect();
          setIsConnected(true);
        } catch (error) {
          console.error('Failed to connect to WebSocket:', error);
          setIsConnected(false);
        }
      }
    };

    connectWebSocket();

    // Disconnect when component unmounts or user logs out
    return () => {
      webSocketService.disconnect();
      setIsConnected(false);
    };
  }, [user?.userID]);

  // Listen for new messages via WebSocket to update unread status
  useEffect(() => {
    if (!isConnected) return;

    // Use a single handler for both event types to avoid double counting
    const handleMessageEvent = () => {
      console.log('WebSocketContext: Received message event, updating unread count');
      // Set the flag for unread messages
      setHasUnreadMessages(true);
      // Only increment by 1 each time
      setUnreadCount(prev => prev + 1);
    };

    // Register event handlers
    const unsubscribeNewMessage = webSocketService.on(ServerEvents.NEW_MESSAGE, handleMessageEvent);
    const unsubscribeMessageNotification = webSocketService.on(ServerEvents.MESSAGE_NOTIFICATION, handleMessageEvent);

    // Cleanup function
    return () => {
      unsubscribeNewMessage();
      unsubscribeMessageNotification();
    };
  }, [isConnected, setHasUnreadMessages, setUnreadCount]);

  // Send a message via WebSocket
  const sendMessage = useCallback(async (content: string, conversationID?: string, receiverID?: string) => {
    if (!content.trim()) return Promise.reject(new Error('Message content cannot be empty'));

    try {
      return await webSocketService.sendMessage({
        content,
        conversationID,
        receiverID,
      });
    } catch (error) {
      console.error('Error sending message via WebSocket:', error);
      throw error;
    }
  }, []);

  // Mark messages as read via WebSocket
  const markAsRead = useCallback(async (conversationID: string) => {
    try {
      return await webSocketService.markAsRead({ conversationID });
    } catch (error) {
      console.error('Error marking messages as read via WebSocket:', error);
      throw error;
    }
  }, []);

  // Get conversation messages via WebSocket
  const getConversationMessages = useCallback(async (conversationID: string) => {
    try {
      return await webSocketService.getConversationMessages({ conversationID });
    } catch (error) {
      console.error('Error getting conversation messages via WebSocket:', error);
      throw error;
    }
  }, []);

  // Register handlers for WebSocket events - using useCallback to memoize the functions
  const onMessageNotification = useCallback((handler: (data: MessageNotificationEvent) => void) => {
    return webSocketService.on<MessageNotificationEvent>(ServerEvents.MESSAGE_NOTIFICATION, handler);
  }, []);

  const onMessageSent = useCallback((handler: (data: MessageSentEvent) => void) => {
    return webSocketService.on<MessageSentEvent>(ServerEvents.MESSAGE_SENT, handler);
  }, []);

  const onMarkAsReadConfirmation = useCallback((handler: (data: MarkAsReadConfirmationEvent) => void) => {
    return webSocketService.on<MarkAsReadConfirmationEvent>(ServerEvents.MARK_AS_READ_CONFIRMATION, handler);
  }, []);

  const onMessagesRead = useCallback((handler: (data: MessagesReadEvent) => void) => {
    return webSocketService.on<MessagesReadEvent>(ServerEvents.MESSAGES_READ, handler);
  }, []);

  const onConversationMessages = useCallback((handler: (data: ConversationMessagesEvent) => void) => {
    return webSocketService.on<ConversationMessagesEvent>(ServerEvents.CONVERSATION_MESSAGES, handler);
  }, []);

  const onMessagesExpired = useCallback((handler: (data: MessagesExpiredEvent) => void) => {
    return webSocketService.on<MessagesExpiredEvent>(ServerEvents.MESSAGES_EXPIRED, handler);
  }, []);

  const onError = useCallback((handler: (data: ErrorEvent) => void) => {
    return webSocketService.on<ErrorEvent>(ServerEvents.ERROR, handler);
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        sendMessage,
        markAsRead,
        getConversationMessages,
        onMessageNotification,
        onMessageSent,
        onMarkAsReadConfirmation,
        onMessagesRead,
        onConversationMessages,
        onMessagesExpired,
        onError
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
