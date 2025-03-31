import React, { useState } from "react";
import { UserType } from "@/types";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

export default function MessageItem({
  message,
  currentUser,
  onUpdateMessage,
  onDeleteMessage,
}: {
  message: any;
  currentUser: UserType;
  onUpdateMessage?: (messageId: string, content: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}) {
  const [isHovering, setIsHovering] = useState(false);
  
  const isCurrentUserMessage = message.sender.id === currentUser.id;

  return (
    <div
      className={cn(
        "flex gap-2 p-2 rounded-md",
        isCurrentUserMessage ? "flex-row-reverse" : ""
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div>
        <Image
          src={message.sender.profile_pic || "/placeholder-user.jpg"}
          alt={message.sender.username}
          width={40}
          height={40}
          className="rounded-full"
        />
      </div>
      <div
        className={cn(
          "bg-slate-200 p-2 rounded-md max-w-[70%] relative",
          isCurrentUserMessage ? "bg-blue-200" : ""
        )}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold">{message.sender.username}</span>
          <span className="text-xs text-slate-500">
            {format(new Date(message.created_at), "h:mm a")}
          </span>
        </div>
        <p className="mt-1">{message.content}</p>
        
        {isCurrentUserMessage && isHovering && (
          <div className="absolute top-1 right-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <div className="h-1 w-1 rounded-full bg-slate-500 mb-0.5" />
                  <div className="h-1 w-1 rounded-full bg-slate-500 mb-0.5" />
                  <div className="h-1 w-1 rounded-full bg-slate-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-2">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex justify-start items-center gap-2"
                    onClick={() => onUpdateMessage && onUpdateMessage(message.id, message.content)}
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex justify-start items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => onDeleteMessage && onDeleteMessage(message.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </div>
  );
}