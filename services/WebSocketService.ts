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
  MessageSentEvent,
  MarkAsReadConfirmationEvent,
  MessagesReadEvent,
  ConversationMessagesEvent,
  MessagesExpiredEvent,
  ErrorEvent,
  ErrorCode,
  BaseClientEvent
} from '@/types/WebSocketTypes';
import { v4 as uuidv4 } from 'uuid';

class WebSocketService {
  private socket: Socket | null = null;
  private isConnecting = false;
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private processedEvents: Set<string> = new Set(); // Track processed events by eventId
  private pendingRequests: Map<string, { resolve: Function, reject: Function }> = new Map(); // Track pending requests

  // Get the WebSocket URL from environment variables
  private getWebSocketUrl(): string {
    // Use secure WebSocket in production, non-secure in development
    return process.env.NODE_ENV === 'production'
      ? 'wss://dev.blinker.eterny.fr'
      : 'ws://localhost:3011';
  }

  // Check if WebSocket is supported by the browser
  public isWebSocketSupported(): boolean {
    return typeof WebSocket !== 'undefined';
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
        withCredentials: true,
        forceNew: true,
        timeout: 10000
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
          console.error('WebSocket URL:', this.getWebSocketUrl());
          console.error('Error details:', error.message);
          this.isConnecting = false;
          reject(error);
        });

        // Add more detailed error handling
        this.socket.on('error', (error) => {
          console.error('Socket general error:', error);
          // Don't reject here as connect_error will handle that
        });

        this.socket.io.on('error', (error) => {
          console.error('Transport error:', error);
          // Don't reject here as connect_error will handle that
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

    // Handle message notifications
    this.socket.on(ServerEvents.MESSAGE_NOTIFICATION, (data: MessageNotificationEvent) => {
      this.handleServerEvent(ServerEvents.MESSAGE_NOTIFICATION, data);
    });

    // Handle message sent confirmations
    this.socket.on(ServerEvents.MESSAGE_SENT, (data: MessageSentEvent) => {
      this.handleServerEvent(ServerEvents.MESSAGE_SENT, data);

      // Resolve pending request if requestId is present
      if (data.requestId && this.pendingRequests.has(data.requestId)) {
        const { resolve } = this.pendingRequests.get(data.requestId)!;
        resolve(data);
        this.pendingRequests.delete(data.requestId);
      }
    });

    // Handle mark as read confirmations
    this.socket.on(ServerEvents.MARK_AS_READ_CONFIRMATION, (data: MarkAsReadConfirmationEvent) => {
      this.handleServerEvent(ServerEvents.MARK_AS_READ_CONFIRMATION, data);

      // Resolve pending request if requestId is present
      if (data.requestId && this.pendingRequests.has(data.requestId)) {
        const { resolve } = this.pendingRequests.get(data.requestId)!;
        resolve(data);
        this.pendingRequests.delete(data.requestId);
      }
    });

    // Handle messages read status updates
    this.socket.on(ServerEvents.MESSAGES_READ, (data: MessagesReadEvent) => {
      this.handleServerEvent(ServerEvents.MESSAGES_READ, data);
    });

    // Handle conversation messages
    this.socket.on(ServerEvents.CONVERSATION_MESSAGES, (data: ConversationMessagesEvent) => {
      this.handleServerEvent(ServerEvents.CONVERSATION_MESSAGES, data);

      // Resolve pending request if requestId is present
      if (data.requestId && this.pendingRequests.has(data.requestId)) {
        const { resolve } = this.pendingRequests.get(data.requestId)!;
        resolve(data);
        this.pendingRequests.delete(data.requestId);
      }
    });

    // Handle message expiration
    this.socket.on(ServerEvents.MESSAGES_EXPIRED, (data: MessagesExpiredEvent) => {
      this.handleServerEvent(ServerEvents.MESSAGES_EXPIRED, data);
    });

    // Handle errors
    this.socket.on(ServerEvents.ERROR, (data: ErrorEvent) => {
      console.error(`WebSocket error: ${data.code} - ${data.message}`, data.details || '');
      this.handleServerEvent(ServerEvents.ERROR, data);

      // Reject pending request if requestId is present
      if (data.requestId && this.pendingRequests.has(data.requestId)) {
        const { reject } = this.pendingRequests.get(data.requestId)!;
        reject(data);
        this.pendingRequests.delete(data.requestId);
      }
    });

    // Handle disconnection
    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });
  }

  // Helper method to handle server events with deduplication
  private handleServerEvent(event: string, data: any): void {
    // Check if this event has already been processed (using eventId)
    if (data.eventId && this.processedEvents.has(data.eventId)) {
      console.log(`Skipping duplicate event ${event} with ID ${data.eventId}`);
      return;
    }

    // Add this event to the processed events set
    if (data.eventId) {
      this.processedEvents.add(data.eventId);

      // Limit the size of the processed events set to avoid memory leaks
      // Keep only the last 1000 events
      if (this.processedEvents.size > 1000) {
        const iterator = this.processedEvents.values();
        this.processedEvents.delete(<string>iterator.next().value);
      }
    }

    // Notify handlers
    this.notifyHandlers(event, data);
  }

  // Send a message via WebSocket
  async sendMessage(data: SendMessageEvent): Promise<MessageSentEvent> {
    try {
      const socket = await this.connect();

      // Add requestId if not provided
      const requestId = data.requestId || uuidv4();
      const requestData = { ...data, requestId };

      // Create a promise that will be resolved when we get a response
      const responsePromise = new Promise<MessageSentEvent>((resolve, reject) => {
        this.pendingRequests.set(requestId, { resolve, reject });

        // Set a timeout to reject the promise if no response is received
        setTimeout(() => {
          if (this.pendingRequests.has(requestId)) {
            this.pendingRequests.delete(requestId);
            reject(new Error('WebSocket request timed out'));
          }
        }, 10000); // 10 second timeout
      });

      // Send the message
      socket.emit(ClientEvents.SEND_MESSAGE, requestData);

      // Wait for the response
      return await responsePromise;
    } catch (error) {
      console.error('Error sending message via WebSocket:', error);
      throw error;
    }
  }

  // Mark messages as read via WebSocket
  async markAsRead(data: MarkAsReadEvent): Promise<MarkAsReadConfirmationEvent> {
    try {
      const socket = await this.connect();

      // Add requestId if not provided
      const requestId = data.requestId || uuidv4();
      const requestData = { ...data, requestId };

      // Create a promise that will be resolved when we get a response
      const responsePromise = new Promise<MarkAsReadConfirmationEvent>((resolve, reject) => {
        this.pendingRequests.set(requestId, { resolve, reject });

        // Set a timeout to reject the promise if no response is received
        setTimeout(() => {
          if (this.pendingRequests.has(requestId)) {
            this.pendingRequests.delete(requestId);
            reject(new Error('WebSocket request timed out'));
          }
        }, 10000); // 10 second timeout
      });

      // Send the request
      socket.emit(ClientEvents.MARK_AS_READ, requestData);

      // Wait for the response
      return await responsePromise;
    } catch (error) {
      console.error('Error marking messages as read via WebSocket:', error);
      throw error;
    }
  }

  // Get conversation messages via WebSocket
  async getConversationMessages(data: GetConversationMessagesEvent): Promise<ConversationMessagesEvent> {
    try {
      const socket = await this.connect();

      // Add requestId if not provided
      const requestId = data.requestId || uuidv4();
      const requestData = { ...data, requestId };

      // Create a promise that will be resolved when we get a response
      const responsePromise = new Promise<ConversationMessagesEvent>((resolve, reject) => {
        this.pendingRequests.set(requestId, { resolve, reject });

        // Set a timeout to reject the promise if no response is received
        setTimeout(() => {
          if (this.pendingRequests.has(requestId)) {
            this.pendingRequests.delete(requestId);
            reject(new Error('WebSocket request timed out'));
          }
        }, 10000); // 10 second timeout
      });

      // Send the request
      socket.emit(ClientEvents.GET_CONVERSATION_MESSAGES, requestData);

      // Wait for the response
      return await responsePromise;
    } catch (error) {
      console.error('Error getting conversation messages via WebSocket:', error);
      throw error;
    }
  }

  // Register a handler for a specific event
  on<T>(event: ServerEvents, handler: (data: T) => void): () => void {
    // Log registration to help with debugging
    console.log(`Registering handler for event: ${event}`);

    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, new Set());
    }

    // Get the handlers set for this event
    const handlers = this.messageHandlers.get(event)!;

    // Check if the handler is already in the set by converting to string
    // This is a simple way to detect duplicate function references
    const handlerStr = handler.toString();
    const existingHandler = Array.from(handlers).find(h => h.toString() === handlerStr);

    if (existingHandler) {
      console.log(`Handler already registered for event: ${event}`);
      // Return a no-op cleanup function since we're not adding a new handler
      return () => {};
    }

    // Add the handler to the set
    handlers.add(handler);

    console.log(`Current handlers for ${event}: ${handlers.size}`);

    // Return a function to unregister the handler
    return () => {
      console.log(`Unregistering handler for event: ${event}`);
      const handlers = this.messageHandlers.get(event);
      if (handlers) {
        handlers.delete(handler);
        console.log(`Handlers left for ${event}: ${handlers.size}`);
        if (handlers.size === 0) {
          this.messageHandlers.delete(event);
          console.log(`Removed all handlers for ${event}`);
        }
      }
    };
  }

  // Notify all handlers for a specific event
  private notifyHandlers(event: string, data: any): void {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      console.log(`Notifying ${handlers.size} handlers for event: ${event}`);

      // Create a copy of the handlers to avoid issues if handlers are added/removed during iteration
      const handlersArray = Array.from(handlers);

      handlersArray.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in handler for event ${event}:`, error);
        }
      });
    } else {
      console.log(`No handlers registered for event: ${event}`);
    }
  }

  // Test connection method for debugging
  async testConnection(): Promise<{ success: boolean, message: string }> {
    try {
      // Try to connect
      const socket = await this.connect();

      // If we get here, connection was successful
      return {
        success: true,
        message: `Successfully connected to ${this.getWebSocketUrl()}`
      };
    } catch (error) {
      // Connection failed
      return {
        success: false,
        message: `Failed to connect to ${this.getWebSocketUrl()}: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

// Create a singleton instance
export const webSocketService = new WebSocketService();

export default webSocketService;
