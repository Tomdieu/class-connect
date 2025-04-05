"use client";

import { getFeeds, getForumNotifications } from "@/actions/forum";
import { useEffect, useState } from "react";
import { ForumNotification, PaginatedResponse, PostType } from "@/types";
import CreatePost from "@/components/forum/CreatePost";
import PostFeed from "@/components/forum/PostFeed";
import ForumNotifications from "@/components/forum/ForumNotifications";
import { useI18n } from "@/locales/client";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";

export default function ForumPage() {
  const t = useI18n();
  const PAGE_SIZE = 10;
  const queryClient = useQueryClient();

  // Use TanStack Query for fetching notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['forumNotifications'],
    queryFn: async () => {
      const data = await getForumNotifications();
      return data || [];
    },
    initialData: [],
  });

  // Use TanStack Query with infinite scrolling for posts
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['forumPosts'],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getFeeds({ 
        page: pageParam, 
        page_size: PAGE_SIZE 
      });
      return result;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      
      // Extract page number from the "next" URL
      const url = new URL(lastPage.next);
      const nextPage = url.searchParams.get('page');
      return nextPage ? parseInt(nextPage) : undefined;
    },
    initialPageParam: 1,
  });

  // Flatten the pages of posts
  const posts = data?.pages.flatMap(page => page.results) || [];

  const handlePostCreated = () => {
    // Invalidate and refetch forum posts query
    queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
  };

  // Setup periodic refetch to check for new posts
  useEffect(() => {
    const interval = setInterval(() => {
      // Quietly check for updates in the background
      queryClient.invalidateQueries({ 
        queryKey: ['forumPosts'],
        refetchType: 'all',
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [queryClient]);

  return (
    <div className="flex flex-col w-full h-full flex-1">
      <div className="px-4 py-6 md:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6">{t("forum.title")}</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main content - Posts and Feed */}
          <div className="flex-grow order-2 md:order-1">
            <CreatePost onPostCreated={handlePostCreated} />
            
            <div className="mt-6">
              {status === 'pending' && !data ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              ) : status === 'error' ? (
                <div className="text-center p-8">
                  <p className="text-red-500 mb-2">Error loading posts</p>
                  <button 
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <PostFeed 
                  posts={posts}
                  onLoadMore={fetchNextPage}
                  hasMore={!!hasNextPage}
                  isLoadingMore={isFetchingNextPage}
                />
              )}
            </div>
          </div>
          
          {/* Sidebar - Notifications */}
          <div className="w-full md:w-80 lg:w-96 order-1 md:order-2">
            <ForumNotifications 
              notifications={notifications}
              onNotificationRead={() => {
                // Refresh notifications when a notification is read
                queryClient.invalidateQueries({ queryKey: ['forumNotifications'] });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
