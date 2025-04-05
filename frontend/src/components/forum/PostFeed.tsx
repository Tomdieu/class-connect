import { PostType } from "@/types";
import PostCard from "./PostCard";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/locales/client";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

interface PostFeedProps {
  posts: PostType[];
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}

export default function PostFeed({ posts, onLoadMore, hasMore, isLoadingMore }: PostFeedProps) {
  const t = useI18n();
  
  // Set up intersection observer for infinite scrolling
  const { ref, inView } = useInView({
    // Once element is 200px from viewport, trigger callback
    rootMargin: '200px 0px',
    // Only trigger once per intersection
    threshold: 0,
  });

  // Trigger next page fetch when the loading element comes into view
  useEffect(() => {
    if (inView && hasMore && !isLoadingMore) {
      onLoadMore();
    }
  }, [inView, hasMore, isLoadingMore, onLoadMore]);

  if (posts.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">{t("forum.noPostsYet")}</h3>
        <p className="text-sm text-gray-500 mt-1">{t("forum.beTheFirstToPost")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      
      {/* Loading indicator and sentinel for intersection observer */}
      {hasMore && (
        <div 
          className="flex justify-center py-6" 
          ref={ref} // This element will trigger loading more when scrolled into view
        >
          {isLoadingMore ? (
            <div className="animate-spin h-6 w-6 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          ) : (
            <Button onClick={onLoadMore} variant="outline">
              {t("forum.loadMore")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
