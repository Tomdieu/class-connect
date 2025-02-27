import { toast } from "sonner";

export type WebSocketMessage = {
  type: 'message' | 'seen' | 'typing' | 'error';
  payload: any;
};

export class ChatWebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private forumId: number | null = null;
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];

  constructor(private baseUrl: string, private getAuthToken: () => string) {}

  public connect(forumId: number): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.disconnect();
    }

    this.forumId = forumId;
    const token = this.getAuthToken();
    const url = `${this.baseUrl}/ws/chat/${forumId}/?token=${token}`;
    
    try {
      this.socket = new WebSocket(url);
      
      this.socket.onopen = () => {
        console.log(`WebSocket connection established for forum ${forumId}`);
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          this.messageHandlers.forEach(handler => handler(message));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Chat connection error. Trying to reconnect...');
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      toast.error('Could not reconnect to chat. Please refresh the page.');
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      if (this.forumId) {
        this.connect(this.forumId);
      }
    }, Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)); // Exponential backoff
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.forumId = null;
    this.reconnectAttempts = 0;
  }

  public sendMessage(content: string, file?: File): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      toast.error('Chat connection lost. Reconnecting...');
      if (this.forumId) {
        this.connect(this.forumId);
      }
      return;
    }

    const message = {
      type: 'message',
      payload: {
        content,
        file_id: file ? 'pending' : null, // File upload would be handled separately
      }
    };

    this.socket.send(JSON.stringify(message));
  }

  public sendSeen(messageId: number): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const message = {
      type: 'seen',
      payload: {
        message_id: messageId,
      }
    };

    this.socket.send(JSON.stringify(message));
  }

  public onMessage(handler: (message: WebSocketMessage) => void): () => void {
    this.messageHandlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  public get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// Create a singleton instance
let chatWebSocketService: ChatWebSocketService | null = null;

export const getChatWebSocketService = (baseUrl: string, getAuthToken: () => string) => {
  if (!chatWebSocketService) {
    chatWebSocketService = new ChatWebSocketService(baseUrl, getAuthToken);
  }
  return chatWebSocketService;
};
