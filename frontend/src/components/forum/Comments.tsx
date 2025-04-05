"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useI18n } from "@/locales/client";
import { PostType } from "@/types";
import { getPostComments } from "@/actions/forum";
import PostCard from "./PostCard";
import { Button } from "../ui/button";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import CreatePost from "./CreatePost";

interface CommentsProps {
  post: PostType;
  onEdit?: (post: PostType) => void;
  onDelete?: (post: PostType) => void;
}

export default function Comments({ post, onEdit, onDelete }: CommentsProps) {
  const [replyTo, setReplyTo] = useState<PostType | null>(null);
  const t = useI18n();
  const queryClient = useQueryClient();

  // Fetch comments for this post
  const { data, isLoading, error } = useQuery({
    queryKey: ["postComments", post.id],
    queryFn: async () => {
      const data = await getPostComments(post.id);
      return data.results || [];
    },
  });

  // Simplified comment component for each level
  const CommentWithReplies = ({ comment, onEdit, onDelete, level = 0 }: 
    { comment: PostType; onEdit?: (post: PostType) => void; onDelete?: (post: PostType) => void; level?: number }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    // Query client for invalidating queries
    const queryClient = useQueryClient();

    // Handle reply button click
    const handleReplyClick = () => {
      setIsReplying(true);
      // Also show existing replies when replying
      setShowReplies(true);
      // Ensure comment is expanded when replying
      setIsCollapsed(false);
    };

    // Handle close reply form
    const handleCloseReply = () => {
      setIsReplying(false);
    };
    
    // Toggle comment expansion/collapse
    const toggleCollapse = () => {
      setIsCollapsed(!isCollapsed);
      // When expanding, close reply form as a UX improvement
      if (isCollapsed) {
        setIsReplying(false);
      }
    };
    
    // Fetch replies for this comment
    const { data: replies, isLoading: loadingReplies } = useQuery({
      queryKey: ["commentReplies", comment.id],
      queryFn: async () => {
        const data = await getPostComments(comment.id);
        return data.results || [];
      },
      enabled: showReplies, // Only fetch when replies are toggled on
    });

    return (
      <div className="comment-thread relative">
        {/* Only show collapse/expand button if the comment has replies */}
        {comment.comment_count > 0 && (
          <div className="absolute left-[-24px] top-3 z-10">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 rounded-full hover:bg-gray-100"
              onClick={toggleCollapse}
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
        )}
        
        {/* PostCard component with all its original design and functionality */}
        <PostCard
          post={comment}
          isComment={true}
          isReply={level > 0}
          onReplyClick={handleReplyClick}
          onEdit={onEdit}
          onDelete={onDelete}
        />

        {/* Collapsible content */}
        {!isCollapsed && (
          <>
            {/* Show number of replies if any and not already expanded */}
            {comment.comment_count > 0 && !showReplies && (
              <div 
                className="ml-8 mt-1 text-sm text-blue-600 cursor-pointer hover:underline" 
                onClick={() => setShowReplies(true)}
              >
                {comment.comment_count === 1 
                  ? t("forum.viewOneReply") 
                  : t("forum.viewReplies", { count: comment.comment_count })
                }
              </div>
            )}

            {/* Container for replies with left border styling */}
            <div className={`pl-8 ${level < 2 ? "border-l-2 border-gray-100 ml-6" : ""}`}>
              {/* Reply form - Use CreatePost with direct API call to show progress */}
              {isReplying && (
                <CreatePost 
                  parentId={comment.id} 
                  forumId={comment.forum}
                  placeholder={t("forum.writeReply")}
                  onPostCreated={() => {
                    setIsReplying(false);
                    // Ensure replies are visible after posting
                    setShowReplies(true);
                    // Invalidate queries to refresh comments
                    queryClient.invalidateQueries({ queryKey: ["commentReplies", comment.id] });
                    // Also invalidate parent's comments if this is a nested reply
                    if (comment.parent) {
                      queryClient.invalidateQueries({ 
                        queryKey: ["commentReplies", comment.parent.id] 
                      });
                    }
                    // Also invalidate the top-level comments
                    queryClient.invalidateQueries({ queryKey: ["postComments", post.id] });
                  }}
                  onClose={handleCloseReply}
                />
              )}

              {/* Replies list */}
              {showReplies && (
                <div className="mt-2 space-y-3">
                  {loadingReplies ? (
                    <div className="flex justify-center my-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  ) : replies && replies.length > 0 ? (
                    replies.map((reply) => (
                      <CommentWithReplies
                        key={reply.id}
                        comment={reply}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        level={level + 1}
                      />
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground text-xs py-2">
                      {t("forum.noReplies")}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hide replies button */}
            {showReplies && comment.comment_count > 0 && (
              <div 
                className="ml-8 mt-1 text-sm text-blue-600 cursor-pointer hover:underline" 
                onClick={() => setShowReplies(false)}
              >
                {t("forum.hideReplies")}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // If loading, show loading indicator
  if (isLoading) {
    return (
      <div className="flex justify-center my-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="text-destructive my-4 text-center">
        {t("forum.somethingWentWrong")}
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-4">
      {/* Use CreatePost component for the main comment form to show upload progress */}
      <CreatePost 
        parentId={post.id}
        forumId={post.forum}
        placeholder={t("forum.writeComment")}
        onPostCreated={() => {
          // Invalidate queries to refresh comments
          queryClient.invalidateQueries({ queryKey: ["postComments", post.id] });
          // Also invalidate feed queries to update the comment count
          queryClient.invalidateQueries({ queryKey: ["feed"] });
        }}
      />

      {/* Comments list */}
      <div className="space-y-4 mt-4 relative pl-6">
        {data && data.length > 0 ? (
          data.map((comment) => (
            <CommentWithReplies
              key={comment.id}
              comment={comment}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="text-center text-muted-foreground text-sm py-3">
            {t("forum.noComments")}
          </div>
        )}
      </div>
    </div>
  );
}
