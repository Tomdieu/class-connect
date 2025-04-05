"use client";

import { PostType } from "@/types";
import { useState } from "react";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import { getPostComments } from "@/actions/forum";
import { useI18n } from "@/locales/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { Separator } from "../ui/separator";

interface CommentsProps {
  post: PostType;
}

export default function Comments({ post }: CommentsProps) {
  const t = useI18n();
  const queryClient = useQueryClient();
  const [commentInputVisible, setCommentInputVisible] = useState(false);
  const [replyToComment, setReplyToComment] = useState<PostType | null>(null);

  // Use TanStack Query to fetch comments
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["postComments", post.id],
    queryFn: async () => {
      const data = await getPostComments(post.id);
      // The API returns a paginated structure with results array
      return data.results || [];
    },
    initialData: [],
  });

  const comments = data || [];

  const handleCommentCreated = () => {
    // Hide the comment input after successful submission
    setCommentInputVisible(false);
    setReplyToComment(null);

    // Refetch comments to get the latest data
    refetch();

    // Also invalidate the main feed to update comment counts
    queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
  };

  const handleReplyClick = (comment: PostType) => {
    setReplyToComment(comment);
    setCommentInputVisible(true);
  };

  const handleCloseReply = () => {
    setReplyToComment(null);
    setCommentInputVisible(false);
  };

  return (
    <div className="space-y-4">
      {replyToComment ? (
        <div className="mb-4 relative">
          <div className="bg-gray-50 p-3 rounded-lg mb-3 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={handleCloseReply}
            >
              <X className="h-3 w-3" />
            </Button>
            <p className="text-sm text-gray-600 mb-1">
              {t("forum.replyingTo")}:
            </p>
            <div className="pl-2 border-l-2 border-gray-300">
              <p className="text-sm font-medium">
                {replyToComment.sender.first_name}{" "}
                {replyToComment.sender.last_name}
              </p>
              <p className="text-sm text-gray-700 line-clamp-2">
                {replyToComment.content}
              </p>
            </div>
          </div>
          <CreatePost
            onPostCreated={handleCommentCreated}
            parentId={replyToComment.id}
            forumId={post.forum}
            placeholder={t("forum.writeReply")}
          />
        </div>
      ) : commentInputVisible ? (
        <div className="mb-4 relative">
          {/* <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-0 right-0 z-10" 
            onClick={handleCloseReply}
          >
            <X className="h-4 w-4" />
          </Button> */}
          <CreatePost
            onClose={handleCloseReply}
            onPostCreated={handleCommentCreated}
            parentId={post.id}
            forumId={post.forum}
          />
        </div>
      ) : (
        <button
          onClick={() => setCommentInputVisible(true)}
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline mb-2"
        >
          {t("forum.writeComment")}
        </button>
      )}

      {isLoading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      ) : isError ? (
        <div className="text-center p-4">
          <p className="text-red-500 mb-2">Error loading comments</p>
          <button className="text-blue-500 underline" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          <Separator className="my-2" />
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              <PostCard
                post={comment}
                isComment={true}
                showComments={false}
                onReplyClick={() => handleReplyClick(comment)}
              />

              {/* Render nested replies if they exist */}
              {comment.comments && comment.comments.length > 0 && (
                <div className="pl-8 space-y-3 mt-2">
                  {comment.comments.map((reply) => (
                    <PostCard
                      key={reply.id}
                      post={reply}
                      isComment={true}
                      showComments={false}
                      isReply={true}
                      onReplyClick={() => handleReplyClick(reply)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-3 text-sm text-gray-500">
          {t("forum.noComments")}
        </div>
      )}
    </div>
  );
}
