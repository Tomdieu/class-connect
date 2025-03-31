"use client"

import { ChatSidebar } from "@/components/dashboard/chat/ChatSidebar"
import { ChatWindow } from "@/components/dashboard/chat/ChatWindow"
import { ChatProvider } from "@/contexts/ChatContext"


export default function ChatPage() {
  
  
  return (
    <ChatProvider>
        <div className="flex h-[calc(100vh-4rem)] bg-background">
          <ChatSidebar />
          <ChatWindow />
        </div>
      </ChatProvider>
  )
}
