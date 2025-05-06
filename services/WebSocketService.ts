import { io, Socket } from 'socket.io-client';
import { getToken } from '@/hooks/useSetToken';
import {
  ClientEvents,
  ServerEvents,
  SendMessageEvent,
  MarkAsReadEvent,
  GetConversationMessagesEvent,
  NewMessageEvent,
  MessageNotificationEvent,
  MessagesReadEvent,
  ConversationMessagesEvent,
  MessagesExpiredEvent,
  ErrorEvent
} from '@/types/WebSocketTypes';

class WebSocketService {
  private socket: Socket | null = null;
  private isConnecting = false;
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();

  // Get the WebSocket URL from environment variables
  private getWebSocketUrl(): string {
    // Use secure WebSocket in production, non-secure in development
    return process.env.NODE_ENV === 'production'
      ? 'wss://dev.blinker.eterny.fr'
      : 'ws://localhost:3011';
  }

  // Connect to the WebSocket server
  async connect(): Promise<Socket> {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.isConnecting) {
      // Wait for the connection to be established
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.socket?.connected) {
            clearInterval(checkInterval);
            resolve(this.socket);
          }
        }, 100);
      });
    }

    this.isConnecting = true;

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      this.socket = io(this.getWebSocketUrl(), {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Set up event listeners
      this.setupEventListeners();

      return new Promise((resolve, reject) => {
        if (!this.socket) {
          this.isConnecting = false;
          reject(new Error('Failed to initialize socket'));
          return;
        }

        this.socket.on('connect', () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          resolve(this.socket!);
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          this.isConnecting = false;
          reject(error);
        });
      });
    } catch (error) {
      this.isConnecting = false;
      console.error('Error connecting to WebSocket:', error);
      throw error;
    }
  }

  // Disconnect from the WebSocket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.messageHandlers.clear();
  }

  // Set up event listeners for server events
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Handle new messages
    this.socket.on(ServerEvents.NEW_MESSAGE, (data: NewMessageEvent) => {
      this.notifyHandlers(ServerEvents.NEW_MESSAGE, data);
    });

    // Handle message notifications
    this.socket.on(ServerEvents.MESSAGE_NOTIFICATION, (data: MessageNotificationEvent) => {
      this.notifyHandlers(ServerEvents.MESSAGE_NOTIFICATION, data);
    });

    // Handle messages read status updates
    this.socket.on(ServerEvents.MESSAGES_READ, (data: MessagesReadEvent) => {
      this.notifyHandlers(ServerEvents.MESSAGES_READ, data);
    });

    // Handle conversation messages
    this.socket.on(ServerEvents.CONVERSATION_MESSAGES, (data: ConversationMessagesEvent) => {
      this.notifyHandlers(ServerEvents.CONVERSATION_MESSAGES, data);
    });

    // Handle message expiration
    this.socket.on(ServerEvents.MESSAGES_EXPIRED, (data: MessagesExpiredEvent) => {
      this.notifyHandlers(ServerEvents.MESSAGES_EXPIRED, data);
    });

    // Handle errors
    this.socket.on(ServerEvents.ERROR, (data: ErrorEvent) => {
      console.error('WebSocket error:', data.message);
      this.notifyHandlers(ServerEvents.ERROR, data);

      // Don't disconnect on errors, let the socket's built-in reconnection handle it
      // Just log the error and continue
    });

    // Handle disconnection
    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });
  }

  // Send a message via WebSocket
  async sendMessage(data: SendMessageEvent): Promise<void> {
    try {
      const socket = await this.connect();
      socket.emit(ClientEvents.SEND_MESSAGE, data);
    } catch (error) {
      console.error('Error sending message via WebSocket:', error);
      throw error;
    }
  }

  // Mark messages as read via WebSocket
  async markAsRead(data: MarkAsReadEvent): Promise<void> {
    try {
      const socket = await this.connect();
      socket.emit(ClientEvents.MARK_AS_READ, data);
    } catch (error) {
      console.error('Error marking messages as read via WebSocket:', error);
      throw error;
    }
  }

  // Get conversation messages via WebSocket
  async getConversationMessages(data: GetConversationMessagesEvent): Promise<void> {
    try {
      const socket = await this.connect();
      socket.emit(ClientEvents.GET_CONVERSATION_MESSAGES, data);
    } catch (error) {
      console.error('Error getting conversation messages via WebSocket:', error);
      throw error;
    }
  }

  // Register a handler for a specific event
  on<T>(event: ServerEvents, handler: (data: T) => void): () => void {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, new Set());
    }

    this.messageHandlers.get(event)!.add(handler);

    // Return a function to unregister the handler
    return () => {
      const handlers = this.messageHandlers.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.messageHandlers.delete(event);
        }
      }
    };
  }

  // Notify all handlers for a specific event
  private notifyHandlers(event: string, data: any): void {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in handler for event ${event}:`, error);
        }
      });
    }
  }
}

// Create a singleton instance
export const webSocketService = new WebSocketService();

export default webSocketService;
