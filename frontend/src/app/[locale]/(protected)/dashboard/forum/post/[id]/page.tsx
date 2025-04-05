"use client";

import { getFeedById, markPostAsViewed } from "@/actions/forum";
import PostCard from "@/components/forum/PostCard";
import { Button } from "@/components/ui/button";
import { PostType } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useI18n } from "@/locales/client";
import { useQuery } from "@tanstack/react-query";

export default function PostPage({ params }: { params: { id: string } }) {
  const t = useI18n();
  const postId = parseInt(params.id);

  // Use TanStack Query to fetch the post
  const {
    data: post,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      return await getFeedById(postId);
    },
  });

  // Mark post as viewed when page loads
  useEffect(() => {
    if (post && !isLoading && !isError) {
      markPostAsViewed(postId).catch(console.error);
    }
  }, [postId, post, isLoading, isError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">{error?.message || t("forum.postNotFound")}</h1>
        <Link href="/dashboard/forum" passHref>
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("forum.backToForum")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/forum" passHref>
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("forum.backToForum")}
          </Button>
        </Link>
      </div>
      
      <PostCard post={post} />
    </div>
  );
}
