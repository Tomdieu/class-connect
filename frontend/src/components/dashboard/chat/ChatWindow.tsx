"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useI18n } from "@/locales/client"
import { MoreVertical, PaperclipIcon, Send, SmileIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { useChat } from "@/contexts/ChatContext"
import { useSession } from "next-auth/react"
import { format } from "date-fns"

export function ChatWindow() {
  const t = useI18n()
  const { data: session } = useSession()
  const { currentForum, messages, sendMessage, markAsSeen, isConnected } = useChat()
  const [newMessage, setNewMessage] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentUserId = session?.user?.id || "";

  const handleSend = () => {
    if (newMessage.trim() || file) {
      sendMessage(newMessage, file || undefined);
      setNewMessage("");
      setFile(null);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as seen
  useEffect(() => {
    if (!currentUserId) return;

    const unseenMessages = messages.filter(
      m => m.sender_id !== currentUserId && !m.seen_by.includes(currentUserId)
    );
    
    unseenMessages.forEach(message => {
      markAsSeen(message.id);
    });
  }, [messages, currentUserId, markAsSeen]);

  if (!currentForum) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">{t("chat.selectForumToStart")}</p>
      </div>
    );
  }

  const forumMessages = messages.filter(m => m.forum_id === currentForum.id);

  return (
    <div className="flex h-full flex-1 flex-col">
      {/* Chat Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{currentForum.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h3 className="font-medium">{currentForum.name}</h3>
            {isConnected ? (
              <span className="text-xs text-green-600">{t("chat.connected")}</span>
            ) : (
              <span className="text-xs text-red-600">{t("chat.disconnected")}</span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {forumMessages.map((message) => {
            const isSender = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={cn("flex", isSender ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[70%]",
                    isSender ? "bg-blue-600 text-white" : "bg-accent"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.file && (
                    <a 
                      href={message.file} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs underline block mt-1"
                    >
                      {t("chat.attachment")}
                    </a>
                  )}
                  <div
                    className={cn(
                      "flex gap-1 items-center mt-1",
                      isSender ? "justify-end" : "justify-start"
                    )}
                  >
                    <span className="text-xs opacity-70">
                      {format(new Date(message.created_at), "h:mm a")}
                    </span>
                    {isSender && (
                      <span className="text-xs">
                        {message.seen_by.filter(id => id !== currentUserId).length > 0 
                          ? "✓✓" 
                          : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* File preview if selected */}
      {file && (
        <div className="border-t border-b p-2 bg-accent">
          <div className="flex items-center justify-between">
            <span className="text-sm truncate">{file.name}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setFile(null)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <SmileIcon className="h-5 w-5" />
          </Button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleAttachClick}
          >
            <PaperclipIcon className="h-5 w-5" />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t("chat.messagePlaceholder")}
            className="flex-1"
          />
          
          <Button 
            size="icon" 
            onClick={handleSend} 
            disabled={!newMessage.trim() && !file}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
