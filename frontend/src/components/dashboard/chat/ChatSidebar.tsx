"use client"

import { Input } from "@/components/ui/input"
import { useI18n } from "@/locales/client"
import { Search, MoreVertical, Globe } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useChat } from "@/contexts/ChatContext"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { useSession } from "next-auth/react"

export function ChatSidebar() {
  const t = useI18n()
  const { data: session } = useSession()
  const { 
    forums, 
    currentForum, 
    setCurrentForum, 
    messages, 
    publicChat,
    isLoadingForums
  } = useChat()
  
  const [searchQuery, setSearchQuery] = useState("")

  // Group messages by forum for showing last message
  const lastMessages = forums.reduce((acc, forum) => {
    const forumMessages = messages.filter(m => m.forum === forum.id);
    const lastMessage = forumMessages.length > 0 
      ? forumMessages.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0] 
      : null;
    
    acc[forum.id] = lastMessage;
    return acc;
  }, {} as Record<string, any>);

  // Add public chat last message if available
  if (publicChat) {
    const publicMessages = messages.filter(m => m.forum === publicChat.id);
    if (publicMessages.length > 0) {
      lastMessages[publicChat.id] = publicMessages.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
    }
  }

  // Count unread messages
  const unreadCounts = forums.reduce((acc, forum) => {
    const unreadMessages = messages.filter(
      m => m.forum === forum.id && 
      !m.seen_by.includes(session?.user?.id || "") &&
      m.sender_id !== session?.user?.id
    );
    
    acc[forum.id] = unreadMessages.length;
    return acc;
  }, {} as Record<string, any>);

  // Add public chat unread count if available
  if (publicChat) {
    const publicUnreadMessages = messages.filter(
      m => m.forum === publicChat.id && 
      !m.seen_by.includes(session?.user?.id || "") &&
      m.sender_id !== session?.user?.id
    );
    
    unreadCounts[publicChat.id] = publicUnreadMessages.length;
  }

  // Filter forums based on search query
  const filteredForums = forums.filter(forum => 
    forum.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if public chat matches search query
  const showPublicChat = publicChat && 
    publicChat.name.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <div className="flex h-full w-full max-w-xs flex-col border-r">
      {/* Header */}
      <div className="flex h-16 items-center justify-between gap-2 border-b px-4">
        <Avatar className="cursor-pointer select-none">
          <AvatarImage src={session?.user?.avatar || undefined} />
          <AvatarFallback>{session?.user?.first_name?.[0] || session?.user?.last_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="border-b p-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("chat.searchPlaceholder")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Contacts List */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {isLoadingForums ? (
            <div className="flex items-center justify-center p-4">
              <div className="text-sm text-muted-foreground">Loading forums...</div>
            </div>
          ) : (
            <>
              {/* Public Chat */}
              {showPublicChat && publicChat && (
                <button
                  onClick={() => setCurrentForum(publicChat)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg p-2 hover:bg-accent",
                    currentForum?.id === publicChat.id && "bg-accent"
                  )}
                >
                  <Avatar className="relative">
                    <AvatarFallback className="bg-green-600 text-white">
                      <Globe className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col items-start">
                    <span className="text-sm font-medium">{publicChat.name}</span>
                    {lastMessages[publicChat.id] && (
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {lastMessages[publicChat.id].sender_id === session?.user?.id ? 'You: ' : ''}
                        {lastMessages[publicChat.id].content}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {lastMessages[publicChat.id] && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(lastMessages[publicChat.id].created_at), { addSuffix: true })}
                      </span>
                    )}
                    {unreadCounts[publicChat.id] > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs text-white">
                        {unreadCounts[publicChat.id]}
                      </span>
                    )}
                  </div>
                </button>
              )}

              {/* Regular Forums */}
              {filteredForums.map((forum) => {
                const lastMessage = lastMessages[forum.id];
                const unreadCount = unreadCounts[forum.id] || 0;
                
                return (
                  <button
                    key={forum.id}
                    onClick={() => setCurrentForum(forum)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg p-2 hover:bg-accent",
                      currentForum?.id === forum.id && "bg-accent"
                    )}
                  >
                    <Avatar className="relative">
                      <AvatarFallback>{forum.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col items-start">
                      <span className="text-sm font-medium">{forum.name}</span>
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {lastMessage.sender_id === session?.user?.id ? 'You: ' : ''}
                          {lastMessage.content}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
                        </span>
                      )}
                      {unreadCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
