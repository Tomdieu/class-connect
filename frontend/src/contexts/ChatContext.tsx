"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ChatWebSocketService, WebSocketMessage, getChatWebSocketService } from "@/services/websocket";
import { useSession } from "next-auth/react";

// Types based on your Django models
export interface Forum {
  id: number;
  name: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
}

export interface Message {
  id: number;
  forum_id: number;
  sender_id: string;
  content: string;
  file?: string | null;
  created_at: string;
  seen_by: string[]; // Array of user IDs who've seen the message
}

interface ChatContextType {
  forums: Forum[];
  currentForum: Forum | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  setCurrentForum: (forum: Forum) => void;
  sendMessage: (content: string, file?: File) => void;
  markAsSeen: (messageId: number) => void;
  isConnected: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [websocketService, setWebsocketService] = useState<ChatWebSocketService | null>(null);
  const [forums, setForums] = useState<Forum[]>([]);
  const [currentForum, setCurrentForum] = useState<Forum | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Initialize WebSocket service
  useEffect(() => {
    if (!session?.user) return;

    const getToken = () => session.user.accessToken as string;
    const service = getChatWebSocketService(
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || "wss://your-django-backend.com", 
      getToken
    );

    setWebsocketService(service);

    // Cleanup
    return () => {
      service.disconnect();
    };
  }, [session]);

  // Load forums
  useEffect(() => {
    if (!session?.user) return;

    const fetchForums = async () => {
      setIsLoading(true);
      try {
        // Replace with your API call
        const response = await fetch('/api/forums', {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch forums');
        
        const data = await response.json();
        setForums(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForums();
  }, [session]);

  // Connect to WebSocket when forum changes
  useEffect(() => {
    if (!websocketService || !currentForum) return;

    websocketService.connect(currentForum.id);
    setIsConnected(websocketService.isConnected);

    // Load historical messages
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        // Replace with your API call
        const response = await fetch(`/api/forums/${currentForum.id}/messages`, {
          headers: {
            'Authorization': `Bearer ${session?.user?.accessToken}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch messages');
        
        const data = await response.json();
        setMessages(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Handle incoming WebSocket messages
    const unsubscribe = websocketService.onMessage((message: WebSocketMessage) => {
      switch (message.type) {
        case 'message':
          setMessages(prev => [...prev, message.payload]);
          break;
        case 'seen':
          setMessages(prev => 
            prev.map(msg => 
              msg.id === message.payload.message_id 
                ? { ...msg, seen_by: [...msg.seen_by, message.payload.user_id] } 
                : msg
            )
          );
          break;
        case 'error':
          setError(message.payload.message);
          break;
      }
    });

    // Check connection status periodically
    const connectionCheckInterval = setInterval(() => {
      setIsConnected(websocketService.isConnected);
    }, 5000);

    // Cleanup
    return () => {
      unsubscribe();
      clearInterval(connectionCheckInterval);
      websocketService.disconnect();
    };
  }, [currentForum, websocketService, session]);

  const sendMessageHandler = (content: string, file?: File) => {
    if (!websocketService || !currentForum) return;
    
    websocketService.sendMessage(content, file);
    
    // Optimistically add message to UI
    const tempId = Date.now();
    const newMessage: Message = {
      id: tempId,
      forum_id: currentForum.id,
      sender_id: session?.user?.id || '',
      content,
      created_at: new Date().toISOString(),
      seen_by: [session?.user?.id || ''],
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const markAsSeenHandler = (messageId: number) => {
    if (!websocketService) return;
    websocketService.sendSeen(messageId);
  };

  const selectForumHandler = (forum: Forum) => {
    setCurrentForum(forum);
  };

  return (
    <ChatContext.Provider
      value={{
        forums,
        currentForum,
        messages,
        isLoading,
        error,
        setCurrentForum: selectForumHandler,
        sendMessage: sendMessageHandler,
        markAsSeen: markAsSeenHandler,
        isConnected,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
