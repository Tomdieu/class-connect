"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useI18n } from "@/locales/client";
import {
  MoreVertical,
  PaperclipIcon,
  Send,
  SmileIcon,
  Globe,
  Check,
  X,
  Edit,
  Trash,
  Reply,
  CornerDownLeft,
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useChat } from "@/contexts/ChatContext";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCreateType, MessagesType } from "@/types";
import {
  updateForumMessage,
  deleteForumMessage,
  markMessageSeenByUser,
} from "@/actions/forum";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FaCaretDown } from "react-icons/fa6";
import { Separator } from "@/components/ui/separator";

export function ChatWindow() {
  const t = useI18n();
  const { data: session } = useSession();
  const {
    currentForum,
    messages,
    sendMessage,
    isConnected,
    isLoadingMessages,
    publicChat,
  } = useChat();

  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingMessage, setEditingMessage] = useState<MessagesType | null>(
    null
  );
  const [replyingToMessage, setReplyingToMessage] =
    useState<MessagesType | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [messageActionsVisible, setMessageActionsVisible] = useState<
    string | null
  >(null);
  const [startX, setStartX] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);
  const dragThreshold = 50; // Minimum distance to trigger the drag action
  const inputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement }>({});

  const currentUserId = session?.user?.id || "";
  const isPublicChat = currentForum?.id === publicChat?.id;

  // Handler for sending a message
  const handleSend = () => {
    if (editingMessage) {
      handleUpdateMessage();
      return;
    }

    if (newMessage.trim() || file) {
      const messageData: MessageCreateType = {
        content: newMessage,
        file: file || undefined,
      };

      // If replying, add the parent message ID
      if (replyingToMessage) {
        messageData.parent = Number(replyingToMessage.id);
      }

      sendMessage(messageData);
      setNewMessage("");
      setFile(null);
      setReplyingToMessage(null);
    }
  };

  // Handler for updating a message
  const handleUpdateMessage = async () => {
    if (!editingMessage || !currentForum) return;

    try {
      const updateData: MessageCreateType = {
        content: editedContent,
      };

      await updateForumMessage(
        currentForum.id.toString(),
        editingMessage.id.toString(),
        updateData
      );

      toast.success("Message updated");
      cancelEditMessage();
    } catch (error) {
      console.error("Failed to update message:", error);
      toast.error("Failed to update message");
    }
  };

  // Handler for deleting a message
  const handleDeleteMessage = async (messageId: string) => {
    if (!currentForum) return;

    try {
      await deleteForumMessage(currentForum.id.toString(), messageId);
      toast.success("Message deleted");
      setMessageActionsVisible(null);
    } catch (error) {
      console.error("Failed to delete message:", error);
      toast.error("Failed to delete message");
    }
  };

  // Start editing a message
  const startEditMessage = (message: MessagesType) => {
    setEditingMessage(message);
    setEditedContent(message.content);
    setNewMessage(message.content);
    setMessageActionsVisible(null);
    setReplyingToMessage(null);
    inputRef.current?.focus();
  };

  // Cancel edit mode
  const cancelEditMessage = () => {
    setEditingMessage(null);
    setEditedContent("");
    setNewMessage("");
  };

  // Start replying to a message
  const startReplyMessage = (message: MessagesType) => {
    setReplyingToMessage(message);
    setEditingMessage(null);
    setMessageActionsVisible(null);
    inputRef.current?.focus();
  };

  // Cancel reply mode
  const cancelReplyMessage = () => {
    setReplyingToMessage(null);
  };

  // Scroll to parent message when clicking on reply preview
  const scrollToMessage = (messageId: string) => {
    const messageElement = messageRefs.current[messageId];
    if (messageElement && scrollAreaRef.current) {
      // Get the position of the element relative to the scrollable area
      const containerRect = scrollAreaRef.current.getBoundingClientRect();
      const elementRect = messageElement.getBoundingClientRect();
      const relativePosition = elementRect.top - containerRect.top;

      // Scroll to the element with some offset
      scrollAreaRef.current.scrollTop =
        scrollAreaRef.current.scrollTop + relativePosition - 100;

      // Highlight the message briefly
      messageElement.style.transition = "background-color 0.5s";
      messageElement.style.backgroundColor = "#fde047"; // Yellow highlight
      setTimeout(() => {
        messageElement.style.backgroundColor = "";
      }, 1500);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === "Escape") {
      if (editingMessage) {
        cancelEditMessage();
      } else if (replyingToMessage) {
        cancelReplyMessage();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  // Mark messages as seen when viewed
  useEffect(() => {
    if (!currentForum || !session?.user?.id) return;

    const forumMessages = messages.filter(
      (m) => m.forum.toString() === currentForum.id.toString()
    );

    forumMessages.forEach((message) => {
      if (
        message.sender.id !== session.user?.id &&
        !message.seen_by.includes(session?.user?.id)
      ) {
        try {
          markMessageSeenByUser(currentForum.id.toString(), message.id);
        } catch (error) {
          console.error("Failed to mark message as seen:", error);
        }
      }
    });
  }, [currentForum, messages, session?.user?.id]);

  // Touch/drag handlers for message actions
  const handleTouchStart = (
    e: React.TouchEvent | React.MouseEvent,
    messageId: string
  ) => {
    // Only allow actions on own messages
    const message = messages.find((m) => m.id === messageId);
    if (message?.sender.id !== currentUserId) return;

    // Set the starting position
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setDragDistance(0);
  };

  const handleTouchMove = (
    e: React.TouchEvent | React.MouseEvent,
    messageId: string
  ) => {
    // Only allow actions on own messages
    const message = messages.find((m) => m.id === messageId);
    if (message?.sender.id !== currentUserId) return;

    // Calculate the drag distance
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const distance = startX - clientX;

    // Only allow dragging to the left (positive distance)
    if (distance > 0) {
      setDragDistance(distance);

      // If drag exceeds threshold, show message actions
      if (distance > dragThreshold && messageActionsVisible !== messageId) {
        setMessageActionsVisible(messageId);
      }
    }
  };

  const handleTouchEnd = () => {
    setDragDistance(0);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentForum) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">{t("chat.selectForumToStart")}</p>
      </div>
    );
  }

  // Filter messages for current forum and sort from oldest to newest
  const forumMessages = messages
    .filter((m) => m.forum?.toString() === currentForum.id?.toString())
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  // Get parent messages for easier lookup
  const messageMap = new Map<string, MessagesType>();
  forumMessages.forEach((msg) => messageMap.set(msg.id, msg));

  return (
    <div className="flex h-full flex-1 flex-col">
      {/* Chat Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          <Avatar>
            {isPublicChat ? (
              <AvatarFallback className="bg-green-600 text-white">
                <Globe className="h-5 w-5" />
              </AvatarFallback>
            ) : (
              <AvatarFallback>{currentForum.name[0]}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <h3 className="font-medium">{currentForum.name}</h3>
            {isConnected ? (
              <span className="text-xs text-green-600">
                {t("chat.connected")}
              </span>
            ) : (
              <span className="text-xs text-red-600">
                {t("chat.disconnected")}
              </span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {isLoadingMessages ? (
          // Loading skeletons for messages
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  i % 2 === 0 ? "justify-start" : "justify-end"
                )}
              >
                <div className={cn("space-y-2", "max-w-[70%]")}>
                  <Skeleton
                    className={cn(
                      "h-12 w-64",
                      i % 2 === 0 ? "bg-accent/50" : "bg-blue-600/30"
                    )}
                  />
                  <Skeleton
                    className={cn(
                      "h-3 w-24",
                      i % 2 === 0 ? "bg-accent/30" : "bg-blue-600/20"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : forumMessages.length === 0 ? (
          // No messages to display
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {forumMessages.map((message) => {
              const isSender = message.sender.id === currentUserId;
              const showActions =
                messageActionsVisible === message.id && isSender;
              const parentMessage = message.parent
                ? messageMap.get(message.parent.toString())
                : null;

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex relative group",
                    isSender ? "justify-end" : "justify-start"
                  )}
                  ref={(el) => {
                    if (el) messageRefs.current[message.id] = el;
                  }}
                >
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2 min-w-[30%] max-w-[70%] relative transition-all duration-200",
                      isSender ? "bg-blue-600 text-white" : "bg-accent",
                      editingMessage?.id === message.id && "opacity-50"
                    )}
                    // onTouchStart={(e) => handleTouchStart(e, message.id)}
                    // onTouchMove={(e) => handleTouchMove(e, message.id)}
                    // onTouchEnd={handleTouchEnd}
                    // onMouseDown={(e) => handleTouchStart(e, message.id)}
                    // onMouseMove={(e) => handleTouchMove(e, message.id)}
                    // onMouseUp={handleTouchEnd}
                    // onMouseLeave={handleTouchEnd}
                    style={
                      isSender && dragDistance > 0
                        ? {
                            transform: `translateX(-${Math.min(
                              dragDistance,
                              100
                            )}px)`,
                          }
                        : {}
                    }
                  >
                    <div className="flex items-center">
                      {isSender && (
                        <Popover>
                          <PopoverTrigger>
                            <ChevronDown className="size-4" />
                          </PopoverTrigger>
                          <PopoverContent
                            align={isSender ? "end" : "start"}
                            className="p-0"
                          >
                            <div className="flex flex-col gap-1">
                              <div
                                className="rounded-s text-muted-foreground flex items-center gap-2 p-2 cursor-pointer"
                                onClick={() => startEditMessage(message)}
                              >
                                <Edit className="h-4 w-4" />
                                Modifier
                              </div>
                              <Separator />
                              <div
                                className="rounded-s text-red-500 flex items-center gap-2 p-2 cursor-pointer"
                                onClick={() => handleDeleteMessage(message.id)}
                              >
                                <Trash className="h-4 w-4" />
                                Supprimer
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}

                      {/* Sender info for messages not from current user */}
                      {!isSender && (
                        <div className="mb-1 text-xs font-semibold text-gray-500">
                          {message.sender?.first_name || "User"}
                        </div>
                      )}
                    </div>
                    {/* Parent/Reply Message Quote */}
                    {message.parent && (
                      <div
                        className={cn(
                          "p-2 mb-2 rounded border-l-2 text-xs cursor-pointer",
                          isSender
                            ? "bg-blue-700 border-blue-400"
                            : "bg-gray-100 border-gray-300 text-gray-600"
                        )}
                        onClick={() => {
                          if (message.parent)
                            scrollToMessage(message.parent.toString());
                        }}
                      >
                        <div className="font-semibold">
                          {message.parent
                            ? message.parent.sender.id === currentUserId
                              ? "You"
                              : message.parent.sender?.first_name || "User"
                            : "Unknown User"}
                        </div>
                        <div className="line-clamp-2">
                          {message.parent
                            ? message.parent.content
                            : "Message not available"}
                        </div>
                      </div>
                    )}

                    {/* Message Content */}
                    <p className="text-sm">
                      {message.content}
                      {editingMessage?.id === message.id && (
                        <span className="text-xs italic ml-2">
                          (editing...)
                        </span>
                      )}
                    </p>

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

                    {/* Message Metadata */}
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
                          {message.seen_by.filter((id) => id !== currentUserId)
                            .length > 0
                            ? "✓✓"
                            : "✓"}
                        </span>
                      )}
                    </div>

                    {/* Context Menu for All Messages */}
                    <div
                      className={cn(
                        "absolute -top-3 opacity-0 group-hover:opacity-100 transition-opacity",
                        isSender ? "right-0" : "left-0"
                      )}
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 rounded-full bg-gray-100 text-gray-600"
                        onClick={() => startReplyMessage(message)}
                      >
                        <Reply className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Reply Preview */}
      {replyingToMessage && (
        <div className="border-t p-2 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CornerDownLeft className="h-4 w-4 mr-2 text-blue-600" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-blue-600">
                  Replying to{" "}
                  {replyingToMessage.sender.id === currentUserId
                    ? "yourself"
                    : replyingToMessage.sender?.first_name || "User"}
                </span>
                <span className="text-xs text-gray-500 line-clamp-1">
                  {replyingToMessage.content}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelReplyMessage}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Editing Notification */}
      {editingMessage && (
        <div className="border-t p-2 bg-amber-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Edit className="h-4 w-4 mr-2 text-amber-600" />
              <span className="text-xs font-semibold text-amber-800">
                Editing message
              </span>
            </div>
            <div className="flex">
              <Button
                size="sm"
                variant="ghost"
                className="text-green-600 h-7 mr-1"
                onClick={handleUpdateMessage}
              >
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 h-7"
                onClick={cancelEditMessage}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
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
            disabled={!!editingMessage}
          >
            <PaperclipIcon className="h-5 w-5" />
          </Button>

          <Input
            ref={inputRef}
            value={editingMessage ? editedContent : newMessage}
            onChange={(e) =>
              editingMessage
                ? setEditedContent(e.target.value)
                : setNewMessage(e.target.value)
            }
            onKeyDown={handleKeyPress}
            placeholder={
              editingMessage
                ? "Edit your message..."
                : replyingToMessage
                ? "Type your reply..."
                : t("chat.messagePlaceholder")
            }
            className="flex-1"
          />

          <Button
            size="icon"
            onClick={handleSend}
            disabled={
              (editingMessage
                ? !editedContent.trim()
                : !newMessage.trim() && !file) || !isConnected
            }
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
