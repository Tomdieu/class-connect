"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useI18n } from "@/locales/client";
import { PostType } from "@/types";
import { addPostComments, getPostComments } from "@/actions/forum";
import { toast } from "sonner";
import PostCard from "./PostCard";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Loader2 } from "lucide-react";

interface CommentsProps {
  post: PostType;
  onEdit?: (post: PostType) => void;
  onDelete?: (post: PostType) => void;
}

// New component to handle display of nested replies
const CommentWithReplies = ({ comment, onEdit, onDelete, level = 0 }: 
  { comment: PostType; onEdit?: (post: PostType) => void; onDelete?: (post: PostType) => void; level?: number }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const t = useI18n();
  const queryClient = useQueryClient();

  // Fetch replies for this comment
  const { data: replies, isLoading: loadingReplies } = useQuery({
    queryKey: ["commentReplies", comment.id],
    queryFn: async () => {
      const data = await getPostComments(comment.id);
      return data.results || [];
    },
    enabled: showReplies, // Only fetch when replies are toggled on
  });

  // Add reply mutation
  const replyMutation = useMutation({
    mutationFn: async (text: string) => {
      return await addPostComments(comment.id, { content: text, forum: comment.forum });
    },
    onSuccess: () => {
      // Reset reply form
      setReplyText("");
      setIsReplying(false);

      // Show success toast
      toast.success(t("forum.commentCreated"), {
        description: t("forum.commentCreatedSuccess")
      });

      // Invalidate queries to refetch comments
      queryClient.invalidateQueries({ queryKey: ["commentReplies", comment.id] });
      queryClient.invalidateQueries({ queryKey: ["postComments", comment.parent?.id] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: () => {
      toast.error(t("forum.error"), {
        description: t("forum.commentCreationFailed")
      });
    },
  });

  const handleReplyClick = () => {
    setIsReplying(true);
    // Also show existing replies when replying
    setShowReplies(true);
  };

  const cancelReply = () => {
    setIsReplying(false);
    setReplyText("");
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    replyMutation.mutate(replyText);
  };

  // Toggle display of replies
  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  return (
    <div className="comment-thread">
      {/* Original comment */}
      <PostCard
        post={comment}
        isComment={true}
        isReply={level > 0}
        onReplyClick={handleReplyClick}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* Show number of replies if any and not already expanded */}
      {comment.comment_count > 0 && !showReplies && (
        <div className="ml-8 mt-1 text-sm text-blue-600 cursor-pointer hover:underline" onClick={toggleReplies}>
          {comment.comment_count === 1 
            ? t("forum.viewOneReply") 
            : t("forum.viewReplies", { count: comment.comment_count })
          }
        </div>
      )}

      {/* Container for replies with left border styling */}
      <div className={`pl-8 ${level < 2 ? "border-l-2 border-gray-100 ml-6" : ""}`}>
        {/* Reply form */}
        {isReplying && (
          <form onSubmit={handleSubmitReply} className="mt-2 space-y-2">
            <Textarea
              placeholder={t("forum.writeReply")}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="resize-none text-sm"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancelReply}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={replyMutation.isPending || !replyText.trim()}
                size="sm"
              >
                {replyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {t("forum.reply")}
              </Button>
            </div>
          </form>
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
        <div className="ml-8 mt-1 text-sm text-blue-600 cursor-pointer hover:underline" onClick={toggleReplies}>
          {t("forum.hideReplies")}
        </div>
      )}
    </div>
  );
};

export default function Comments({ post, onEdit, onDelete }: CommentsProps) {
  const [commentText, setCommentText] = useState("");
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

  // Create comment mutation
  const commentMutation = useMutation({
    mutationFn: async (comment: string) => {
      // If replyTo is set, we're replying to a comment, so pass that comment's ID
      // Otherwise, we're commenting on the main post, so pass the main post's ID
      const targetPostId = replyTo ? replyTo.id : post.id;
      
      return await addPostComments(targetPostId, { 
        content: comment, 
        forum: post.forum
      });
    },
    onSuccess: () => {
      // Reset comment form
      setCommentText("");
      setReplyTo(null);

      // Show success toast
      toast.success(t("forum.commentCreated"), {
        description: t("forum.commentCreatedSuccess")
      });

      // Invalidate queries to refetch comments
      queryClient.invalidateQueries({ queryKey: ["postComments", post.id] });

      // Also invalidate feed queries to update the comment count
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: () => {
      toast.error(t("forum.error"), {
        description: t("forum.commentCreationFailed")
      });
    },
  });

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    commentMutation.mutate(commentText);
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
      {/* Comment form */}
      <form onSubmit={handleSubmitComment} className="space-y-2">
        <Textarea
          placeholder={t("forum.writeComment")}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="resize-none"
          rows={3}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={commentMutation.isPending || !commentText.trim()}
            size="sm"
          >
            {commentMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {t("forum.comment")}
          </Button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-4 mt-4">
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
