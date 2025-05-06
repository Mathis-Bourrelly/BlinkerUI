import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import webSocketService from '@/services/WebSocketService';
import { useUser } from './UserContext';
import { useMessageContext } from './MessageContext';
import {
  ServerEvents,
  NewMessageEvent,
  MessageNotificationEvent,
  MessagesReadEvent,
  ConversationMessagesEvent,
  MessagesExpiredEvent
} from '@/types/WebSocketTypes';

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (content: string, conversationID?: string, receiverID?: string) => Promise<void>;
  markAsRead: (conversationID: string) => Promise<void>;
  getConversationMessages: (conversationID: string) => Promise<void>;
  onNewMessage: (handler: (message: NewMessageEvent) => void) => () => void;
  onMessageNotification: (handler: (data: MessageNotificationEvent) => void) => () => void;
  onMessagesRead: (handler: (data: MessagesReadEvent) => void) => () => void;
  onConversationMessages: (handler: (data: ConversationMessagesEvent) => void) => () => void;
  onMessagesExpired: (handler: (data: MessagesExpiredEvent) => void) => () => void;
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

    const handleNewMessage = () => {
      setHasUnreadMessages(true);
      setUnreadCount(prev => prev + 1);
    };

    const handleMessageNotification = () => {
      setHasUnreadMessages(true);
      setUnreadCount(prev => prev + 1);
    };

    // Register event handlers
    const unsubscribeNewMessage = webSocketService.on(ServerEvents.NEW_MESSAGE, handleNewMessage);
    const unsubscribeMessageNotification = webSocketService.on(ServerEvents.MESSAGE_NOTIFICATION, handleMessageNotification);

    // Cleanup function
    return () => {
      unsubscribeNewMessage();
      unsubscribeMessageNotification();
    };
  }, [isConnected, setHasUnreadMessages, setUnreadCount]);

  // Send a message via WebSocket
  const sendMessage = async (content: string, conversationID?: string, receiverID?: string) => {
    if (!content.trim()) return;

    try {
      await webSocketService.sendMessage({
        content,
        conversationID,
        receiverID,
      });
    } catch (error) {
      console.error('Error sending message via WebSocket:', error);
      throw error;
    }
  };

  // Mark messages as read via WebSocket
  const markAsRead = async (conversationID: string) => {
    try {
      await webSocketService.markAsRead({ conversationID });
    } catch (error) {
      console.error('Error marking messages as read via WebSocket:', error);
      throw error;
    }
  };

  // Get conversation messages via WebSocket
  const getConversationMessages = async (conversationID: string) => {
    try {
      await webSocketService.getConversationMessages({ conversationID });
    } catch (error) {
      console.error('Error getting conversation messages via WebSocket:', error);
      throw error;
    }
  };

  // Register handlers for WebSocket events
  const onNewMessage = (handler: (message: NewMessageEvent) => void) => {
    return webSocketService.on<NewMessageEvent>(ServerEvents.NEW_MESSAGE, handler);
  };

  const onMessageNotification = (handler: (data: MessageNotificationEvent) => void) => {
    return webSocketService.on<MessageNotificationEvent>(ServerEvents.MESSAGE_NOTIFICATION, handler);
  };

  const onMessagesRead = (handler: (data: MessagesReadEvent) => void) => {
    return webSocketService.on<MessagesReadEvent>(ServerEvents.MESSAGES_READ, handler);
  };

  const onConversationMessages = (handler: (data: ConversationMessagesEvent) => void) => {
    return webSocketService.on<ConversationMessagesEvent>(ServerEvents.CONVERSATION_MESSAGES, handler);
  };

  const onMessagesExpired = (handler: (data: MessagesExpiredEvent) => void) => {
    return webSocketService.on<MessagesExpiredEvent>(ServerEvents.MESSAGES_EXPIRED, handler);
  };

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        sendMessage,
        markAsRead,
        getConversationMessages,
        onNewMessage,
        onMessageNotification,
        onMessagesRead,
        onConversationMessages,
        onMessagesExpired,
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
