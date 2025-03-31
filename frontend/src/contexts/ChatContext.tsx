"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ForumType, MessagesType, MessageCreateType } from "@/types";
import { useSession } from "next-auth/react";
import { 
  listForums, 
  listForumMessages, 
  createForumMessage, 
  markMessageSeenByUser,
  getPublicChat
} from "@/actions/forum";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type Forum = ForumType;

interface ChatContextType {
  forums: Forum[];
  publicChat: Forum | null;
  currentForum: Forum | null;
  setCurrentForum: (forum: Forum | null) => void;
  messages: MessagesType[];
  isConnected: boolean;
  isLoadingForums: boolean;
  isLoadingMessages: boolean;
  sendMessage: (data: MessageCreateType) => void;
  markAsSeen: (messageId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [currentForum, setCurrentForum] = useState<Forum | null>(null);
  const [processedMessageIds] = useState<Set<string>>(new Set());
  
  // Query for forums
  const { 
    data: forums = [], 
    isLoading: isLoadingForums,
    isError: isForumsError,
    error: forumsError
  } = useQuery({
    queryKey: ['forums'],
    queryFn: listForums,
    enabled: !!session?.user
  });

  // Query for public chat
  const {
    data: publicChats = [],
    isError: isPublicChatError,
    error: publicChatError
  } = useQuery({
    queryKey: ['publicChat'],
    queryFn: getPublicChat,
    enabled: !!session?.user
  });

  const publicChat = publicChats.length > 0 ? publicChats[0] : null;

  // Query for messages based on current forum
  const {
    data: currentForumMessages = [],
    isLoading: isLoadingCurrentMessages,
    isError: isCurrentMessagesError,
    error: currentMessagesError
  } = useQuery({
    queryKey: ['messages', currentForum?.id],
    queryFn: () => currentForum ? listForumMessages(currentForum.id) : Promise.resolve([]),
    enabled: !!currentForum && !!session?.user,
    refetchInterval: 5000 // Poll every 5 seconds
  });

  // Query for public chat messages
  const {
    data: publicMessages = [],
    isLoading: isLoadingPublicMessages,
    isError: isPublicMessagesError,
    error: publicMessagesError
  } = useQuery({
    queryKey: ['messages', publicChat?.id],
    queryFn: () => publicChat ? listForumMessages(publicChat.id) : Promise.resolve([]),
    enabled: !!publicChat && !!session?.user && publicChat?.id !== currentForum?.id,
    refetchInterval: 5000 // Poll every 5 seconds
  });

  // Handle errors with useEffect
  useEffect(() => {
    if (isForumsError && forumsError) {
      toast.error("Failed to load forums", {
        description: "Please try again later."
      });
      console.error("Forums error:", forumsError);
    }
    
    if (isPublicChatError && publicChatError) {
      toast.error("Failed to load public chat", {
        description: "Please try again later."
      });
      console.error("Public chat error:", publicChatError);
    }
    
    if (isCurrentMessagesError && currentMessagesError) {
      toast.error("Failed to load messages", {
        description: "Please try again later."
      });
      console.error("Current forum messages error:", currentMessagesError);
    }
    
    if (isPublicMessagesError && publicMessagesError) {
      toast.error("Failed to load public chat messages", {
        description: "Please try again later."
      });
      console.error("Public messages error:", publicMessagesError);
    }
  }, [
    isForumsError, forumsError, 
    isPublicChatError, publicChatError,
    isCurrentMessagesError, currentMessagesError,
    isPublicMessagesError, publicMessagesError
  ]);

  // Combine messages and ensure no duplicates
  const allMessages = [...currentForumMessages, ...publicMessages];
  const messageMap = new Map();
  allMessages.forEach(msg => messageMap.set(msg.id, msg));
  const messages = Array.from(messageMap.values());
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ forumId, data }: { forumId: string | number, data: MessageCreateType }) => 
      createForumMessage(forumId, data),
    onSuccess: (newMessage) => {
      queryClient.invalidateQueries({ queryKey: ['messages', newMessage.forum] });
      toast.success("Message sent successfully");
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message", {
        description: "Please try again."
      });
    }
  });

  // Mark message as seen mutation
  const markAsSeenMutation = useMutation({
    mutationFn: ({ forumId, messageId }: { forumId: string, messageId: string }) => 
      markMessageSeenByUser(forumId, messageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.forumId] });
    },
    onError: () => {
      // Silent failure for marking messages as seen
      console.error("Failed to mark message as seen");
    }
  });

  // Set initial current forum if needed
  useEffect(() => {
    if (!currentForum && forums.length > 0) {
      setCurrentForum(forums[0]);
    }
  }, [forums, currentForum]);

  const sendMessage = async (data: MessageCreateType) => {
    if (!currentForum || !session?.user) return;
    
    sendMessageMutation.mutate({ 
      forumId: currentForum.id, 
      data
    });
  };

  // Memoize markAsSeen to prevent recreating it on every render
  const markAsSeen = useCallback((messageId: string) => {
    if (!currentForum || !session?.user) return;
    
    // Don't mark messages as seen if we've already processed this message
    if (processedMessageIds.has(messageId)) return;
    
    processedMessageIds.add(messageId);
    
    markAsSeenMutation.mutate({
      forumId: currentForum.id,
      messageId
    });
  }, [currentForum, session?.user, processedMessageIds, markAsSeenMutation]);

  return (
    <ChatContext.Provider
      value={{
        forums,
        publicChat,
        currentForum,
        setCurrentForum,
        messages,
        isConnected: !isLoadingForums && !isLoadingCurrentMessages && !isLoadingPublicMessages,
        isLoadingForums,
        isLoadingMessages: isLoadingCurrentMessages || isLoadingPublicMessages,
        sendMessage,
        markAsSeen,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};