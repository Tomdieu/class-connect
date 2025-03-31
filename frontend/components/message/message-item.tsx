import { useState } from "react";
import { Message } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, content: string) => void;
}

export const MessageItem = ({
  message,
  isCurrentUser,
  onDelete,
  onUpdate,
}: MessageItemProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const handleUpdate = () => {
    if (editedContent.trim() === "") return;
    onUpdate?.(message.id, editedContent);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete?.(message.id);
  };

  return (
    <div
      className={cn(
        "flex gap-2 w-full p-2 group",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender.imageUrl} />
          <AvatarFallback>
            {message.sender.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col", isCurrentUser && "items-end")}>
        <div className="flex items-center gap-2">
          {!isCurrentUser && (
            <div className="text-sm font-semibold">{message.sender.name}</div>
          )}
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
            })}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div
            className={cn(
              "p-2 rounded-md max-w-xs break-words",
              isCurrentUser
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            )}
          >
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <textarea
                  className="bg-transparent outline-none w-full resize-none"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedContent(message.content);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleUpdate}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              message.content
            )}
          </div>

          {isCurrentUser && isHovering && !isEditing && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-fit p-2" align="end">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                    onClick={handleDelete}
                  >
                    <Trash className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender.imageUrl} />
          <AvatarFallback>
            {message.sender.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};