"use client";

import { PostType, ReactionType } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Download, Edit, MessageCircle, MoreVertical, PaperclipIcon, Reply, Trash } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { addReaction, markPostAsViewed, removeReaction, getPostComments } from "@/actions/forum";
import ReactionButton from "./ReactionButton";
import Comments from "./Comments";
import { Button } from "../ui/button";
import { useI18n } from "@/locales/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { VideoPlayer } from "../ui/video-player";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Using Sonner toast instead of the UI toast component
import { toast } from "sonner";

interface PostCardProps {
  post: PostType;
  isComment?: boolean;
  isReply?: boolean;
  showComments?: boolean;
  onReplyClick?: () => void;
  onEdit?: (post: PostType) => void;
  onDelete?: (post: PostType) => void;
}

export default function PostCard({ 
  post, 
  isComment = false, 
  isReply = false,
  showComments = true, 
  onReplyClick,
  onEdit,
  onDelete
}: PostCardProps) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<PostType>(post);
  const t = useI18n();
  const viewMarked = useRef(false);
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  // Check if the current user is the post owner or an admin
  const isOwner = session?.user?.id === post.sender.id;
  const isAdmin = session?.user?.role === "admin";
  const canModify = isOwner || isAdmin;

  // Set up intersection observer to detect when post is viewed
  const { ref, inView } = useInView({
    threshold: 0.5, // Post is considered viewed when 50% visible
    triggerOnce: true, // Only trigger the callback once
  });

  // Use TanStack Query mutation for marking posts as viewed
  const viewMutation = useMutation({
    mutationFn: async (postId: number) => {
      await markPostAsViewed(postId);
    },
  });

  // When post comes into view, mark it as viewed
  useEffect(() => {
    if (inView && !isComment && !viewMarked.current) {
      viewMarked.current = true;
      viewMutation.mutate(post.id);
    }
  }, [inView, post.id, isComment, viewMutation]);

  // Use TanStack Query for reaction mutations
  const reactionMutation = useMutation({
    mutationFn: async ({ postId, reactionType, isRemove }: {
      postId: number, 
      reactionType: ReactionType, 
      isRemove: boolean
    }) => {
      if (isRemove) {
        await removeReaction(postId);
        return null;
      } else {
        const reaction = await addReaction(postId, reactionType);
        return reaction;
      }
    },
    onSuccess: (data, variables) => {
      const { reactionType, isRemove } = variables;
      
      if (isRemove) {
        const updatedReactionCounts = currentPost.reaction_counts.map(count => 
          count.reaction_type === reactionType 
            ? { ...count, count: Math.max(0, count.count - 1) } 
            : count
        );
        
        setCurrentPost({
          ...currentPost,
          user_reaction: null,
          reaction_counts: updatedReactionCounts
        });
      } else {
        const oldReactionType = currentPost.user_reaction?.reaction_type;
        
        let updatedReactionCounts = [...currentPost.reaction_counts];
        
        if (oldReactionType) {
          updatedReactionCounts = updatedReactionCounts.map(count => 
            count.reaction_type === oldReactionType 
              ? { ...count, count: Math.max(0, count.count - 1) } 
              : count
          );
        }
        
        const existingReaction = updatedReactionCounts.find(
          c => c.reaction_type === reactionType
        );
        
        if (existingReaction) {
          updatedReactionCounts = updatedReactionCounts.map(count => 
            count.reaction_type === reactionType 
              ? { ...count, count: count.count + 1 } 
              : count
          );
        } else {
          updatedReactionCounts.push({
            reaction_type: reactionType,
            count: 1
          });
        }
        
        setCurrentPost({
          ...currentPost,
          user_reaction: {
            ...data,
            reaction_type: reactionType
          },
          reaction_counts: updatedReactionCounts
        });
      }
    }
  });

  const handleToggleComments = () => {
    setIsCommentsOpen(!isCommentsOpen);
    
    if (!isCommentsOpen) {
      queryClient.prefetchQuery({
        queryKey: ['postComments', currentPost.id],
        queryFn: async () => {
          const data = await getPostComments(currentPost.id);
          return data.results || [];
        }
      });
    }
  };

  const handleReaction = async (reactionType: ReactionType) => {
    const isRemove = currentPost.user_reaction?.reaction_type === reactionType;
    
    reactionMutation.mutate({
      postId: currentPost.id,
      reactionType,
      isRemove
    });
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(currentPost);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(currentPost);
    } else {
      toast.error(t("forum.postCreationFailed"), {
        description: t("forum.error")
      });
    }
  };

  const isVideoUrl = (url: string) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.mkv'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  return (
    <Card 
      className={`${isComment ? "shadow-none border-0 bg-transparent" : "shadow-md"} 
      ${isReply ? "ml-0" : ""}`}
      ref={!isComment ? ref : undefined}
    >
      <CardHeader className={isComment ? `pb-2 pt-2 px-0 ${isReply ? "py-1" : ""}` : undefined}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className={isReply ? "h-7 w-7" : "h-9 w-9"}>
              <AvatarImage src={post.sender.avatar} />
              <AvatarFallback>
                {post.sender.first_name?.[0]}
                {post.sender.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className={`font-medium ${isReply ? "text-sm" : ""}`}>
                {post.sender.first_name} {post.sender.last_name}
              </div>
              <div className={`text-xs text-muted-foreground ${isReply ? "text-[10px]" : ""}`}>
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
          
          {canModify && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && ( // Only owner can edit their own post
                  <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={isComment ? `py-0 px-0 ${isReply ? "text-sm" : ""}` : undefined}>
        <div className="whitespace-pre-wrap">{post.content}</div>
        
        {post.image && (
          <div className="mt-3">
            <Image 
              src={post.image} 
              alt="Post image" 
              width={800}
              height={500}
              className="rounded-md max-h-[500px] object-contain" 
            />
          </div>
        )}
        
        {post.file && isVideoUrl(post.file) && (
          <div className="mt-3">
            <VideoPlayer 
              src={post.file} 
              className="max-h-[500px] w-full"
            />
          </div>
        )}
        
        {post.file && !isVideoUrl(post.file) && (
          <div className="mt-3">
            <a 
              href={post.file} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              <PaperclipIcon className="h-5 w-5 text-blue-600" />
              <span className="flex-1 truncate text-sm">{post.file.split('/').pop()}</span>
              <Download className="h-4 w-4" />
            </a>
          </div>
        )}
        
        {!isComment && currentPost.reaction_counts.length > 0 && (
          <div className="flex items-center mt-4 text-sm text-gray-500">
            <div className="flex -space-x-1 mr-2">
              {Array.from(new Set(currentPost.reaction_counts.map(r => r.reaction_type))).slice(0, 3).map((type) => (
                <div key={type} className="w-5 h-5 rounded-full overflow-hidden border border-white bg-blue-50">
                  {type === 'LIKE' && '👍'}
                  {type === 'LOVE' && '❤️'}
                  {type === 'HAHA' && '😄'}
                  {type === 'WOW' && '😮'}
                  {type === 'SAD' && '😢'}
                  {type === 'ANGRY' && '😠'}
                </div>
              ))}
            </div>
            <span>
              {currentPost.reaction_counts.reduce((acc, curr) => acc + curr.count, 0)}
            </span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className={`flex ${isComment ? `px-0 pt-1 pb-0 ${isReply ? "gap-1" : ""}` : 'pt-0'} justify-between`}>
        <div className={`flex ${isReply ? "gap-1" : "gap-1 sm:gap-2"}`}>
          <ReactionButton 
            onReact={handleReaction} 
            activeReaction={currentPost.user_reaction?.reaction_type}
            isLoading={reactionMutation.isPending}
            isSmall={isReply}
          />
          
          {!isComment ? (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleToggleComments}
              className="text-gray-500 flex items-center gap-1 hover:bg-gray-100 hover:text-gray-700"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">{t("forum.comment")}</span>
              {currentPost.comment_count > 0 && (
                <span className="text-xs ml-1">({currentPost.comment_count})</span>
              )}
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size={isReply ? "xs" : "sm"}
              onClick={onReplyClick}
              className={`text-gray-500 flex items-center gap-1 hover:bg-gray-100 hover:text-gray-700 ${isReply ? "py-1 px-2 h-7" : ""}`}
            >
              <Reply className={isReply ? "h-3 w-3" : "h-4 w-4"} />
              <span className={isReply ? "text-xs" : "text-sm"}>{t("forum.reply")}</span>
            </Button>
          )}
        </div>
      </CardFooter>
      
      {!isComment && showComments && isCommentsOpen && (
        <div className="px-6 pb-4">
          <Comments 
            post={currentPost} 
            onEdit={onEdit} 
            onDelete={onDelete}
          />
        </div>
      )}
    </Card>
  );
}
