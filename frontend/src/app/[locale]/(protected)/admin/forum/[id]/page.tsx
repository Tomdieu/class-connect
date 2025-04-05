"use client";

import { getForum, getPosts } from "@/actions/forum";
import { ForumType, PostType } from "@/types";
import { useState, use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Edit, FileText, MessageSquare, Search } from "lucide-react";
import { useI18n } from "@/locales/client";
import { Badge } from "@/components/ui/badge";
import CreatePost from "@/components/forum/CreatePost";
import PostFeed from "@/components/forum/PostFeed";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { addDays, format, isAfter, isBefore, startOfDay, subDays } from 'date-fns';

export default function ForumDetailPage({ params }: { params: { id: string } }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const t = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Unwrap the params object using React.use()
  const unwrappedParams = use(params);
  const forumId = unwrappedParams.id;

  // Fetch forum data with TanStack Query
  const { 
    data: forum, 
    isLoading: isLoadingForum,
    error: forumError 
  } = useQuery({
    queryKey: ['forum', forumId],
    queryFn: async () => {
      return await getForum(forumId);
    }
  });

  // Fetch forum posts with TanStack Query - using getPosts instead of listForumMessages
  const { 
    data: postsData,
    isLoading: isLoadingPosts,
    error: postsError,
    refetch: refetchPosts,
    isRefetching: isRefetchingPosts
  } = useQuery({
    queryKey: ['forumPosts', forumId, page],
    queryFn: async () => {
      // Use getPosts with forum filter parameter instead of listForumMessages
      const response = await getPosts({
        forum: forumId,
        page: page,
        page_size: 10 // You can adjust the page size as needed
      });
      return response;
    }
  });

  const posts = postsData?.results || [];
  const hasMore = !!postsData?.next;
  
  const handleLoadMore = () => {
    if (isRefetchingPosts || !hasMore) return;
    setPage(prevPage => prevPage + 1);
  };

  const handlePostCreated = () => {
    // Invalidate and refetch posts query
    queryClient.invalidateQueries({ queryKey: ['forumPosts', forumId] });
    setPage(1);
  };

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = isLoadingForum || isLoadingPosts;
  const error = forumError || postsError;

  function getActivityData(posts: PostType[]) {
    if (!posts || posts.length === 0) return [];
    
    // Get the date range (last 30 days)
    const today = startOfDay(new Date());
    const thirtyDaysAgo = subDays(today, 30);
    
    // Initialize the daily count data structure
    const dailyCounts: { [key: string]: { date: string; posts: number; comments: number } } = {};
    
    // Initialize the array with all days in the range
    for (let i = 0; i < 30; i++) {
      const date = subDays(today, 29 - i);
      const dateStr = format(date, 'MMM dd');
      dailyCounts[dateStr] = { date: dateStr, posts: 0, comments: 0 };
    }
    
    // Count posts per day
    posts.forEach(post => {
      const postDate = new Date(post.created_at);
      if (isAfter(postDate, thirtyDaysAgo) && isBefore(postDate, addDays(today, 1))) {
        const dateStr = format(postDate, 'MMM dd');
        if (dailyCounts[dateStr]) {
          dailyCounts[dateStr].posts += 1;
        }
      }
    });
    
    // Count comments per day by summing comment_count
    posts.forEach(post => {
      const postDate = new Date(post.created_at);
      if (isAfter(postDate, thirtyDaysAgo) && isBefore(postDate, addDays(today, 1))) {
        const dateStr = format(postDate, 'MMM dd');
        if (dailyCounts[dateStr]) {
          dailyCounts[dateStr].comments += post.comment_count;
        }
      }
    });
    
    // Convert to array for the chart
    return Object.values(dailyCounts);
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-muted p-3">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{t("common.error")}</h3>
            <p className="text-sm text-muted-foreground text-center max-w-[500px] mt-2">
              {t("common.errorDesc", { item: "forum" })}
            </p>
            <Button className="mt-4" onClick={() => router.push('/admin/forum')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {t("admin.forumDetail.back")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!forum) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-muted p-3">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{t("notFound.heading")}</h3>
            <p className="text-sm text-muted-foreground text-center max-w-[500px] mt-2">
              {t("forum.postNotFound")}
            </p>
            <Button className="mt-4" onClick={() => router.push('/admin/forum')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {t("admin.forumDetail.back")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/admin/forum')}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t("admin.forumDetail.back")}</span>
            </Button>
            <Badge variant="outline">{t("admin.forum.forumId", { id: forum.id })}</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t("admin.forumDetail.title", { name: forum.name })}</h1>
          <p className="text-muted-foreground">
            {t("admin.forumDetail.createdOn", { date: new Date(forum.created_at).toLocaleDateString() })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" /> {t("admin.forumDetail.editForum")}
          </Button>
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" /> {t("admin.forumDetail.createPost")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="posts" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="posts">{t("admin.forumDetail.posts")}</TabsTrigger>
            <TabsTrigger value="stats">{t("admin.forumDetail.stats")}</TabsTrigger>
          </TabsList>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("admin.forumDetail.searchPosts")}
              className="w-[250px] pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <TabsContent value="posts" className="space-y-4">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <CreatePost 
                forumId={forum.id} 
                onPostCreated={handlePostCreated}
              />
            </CardContent>
          </Card>

          {filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="rounded-full bg-muted p-3">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{t("admin.forumDetail.noPosts")}</h3>
                <p className="text-sm text-muted-foreground text-center max-w-[500px] mt-2">
                  {searchQuery 
                    ? t("admin.forum.noForumsMatchSearch", { search: searchQuery })
                    : t("admin.forumDetail.noPostsDesc")}
                </p>
              </CardContent>
            </Card>
          ) : (
            <PostFeed 
              posts={filteredPosts}
              onLoadMore={handleLoadMore}
              hasMore={hasMore && !searchQuery}
              isLoadingMore={isRefetchingPosts}
            />
          )}
        </TabsContent>
        
        <TabsContent value="stats">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("admin.forumDetail.totalPosts")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{posts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("admin.forumDetail.acrossAllPosts")}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("admin.forumDetail.activeUsers")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(posts.map(post => post.sender.id)).size}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("admin.forumDetail.uniquePosters")}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("admin.forumDetail.comments")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {posts.reduce((sum, post) => sum + post.comment_count, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("admin.forumDetail.acrossAllPosts")}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t("admin.forumDetail.forumActivity")}</CardTitle>
              <CardDescription>{t("admin.forumDetail.forumActivityDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/5">
                  <p className="text-muted-foreground">{t("admin.forumDetail.noActivityData")}</p>
                </div>
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getActivityData(posts)}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="posts" name={t("admin.forumDetail.posts")} fill="#8884d8" />
                      <Bar dataKey="comments" name={t("admin.forumDetail.comments")} fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
