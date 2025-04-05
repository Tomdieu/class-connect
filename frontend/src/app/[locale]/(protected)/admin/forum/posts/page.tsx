"use client";

import { getPosts, listForums } from "@/actions/forum";
import { ForumType, PostType } from "@/types";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Eye, FileImage, FileText, Plus, Search, Trash } from "lucide-react";
import { useI18n } from "@/locales/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { deletePost } from "@/actions/forum";

export default function AdminForumPostsPage() {
  const [forums, setForums] = useState<ForumType[]>([]);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedForum, setSelectedForum] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<PostType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const t = useI18n();
  const router = useRouter();

  useEffect(() => {
    const fetchForums = async () => {
      try {
        const data = await listForums();
        setForums(data);
      } catch (error) {
        console.error("Error fetching forums:", error);
      }
    };

    fetchForums();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const params: any = {};
        if (selectedForum) {
          params.forum = selectedForum;
        }
        
        const response = await getPosts(params);
        setPosts(response.results);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error(t("common.error"), {
          description: t("common.errorDesc", { item: "posts" }),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [selectedForum, t]);

  // Filter posts based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPosts(posts);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = posts.filter(
        (post) =>
          post.content.toLowerCase().includes(query) ||
          `${post.sender.first_name} ${post.sender.last_name}`.toLowerCase().includes(query)
      );
      setFilteredPosts(filtered);
    }
  }, [searchQuery, posts]);

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    
    setIsDeleting(true);
    try {
      await deletePost(postToDelete.id);
      
      // Remove the deleted post from state
      setPosts(posts.filter(p => p.id !== postToDelete.id));
      setFilteredPosts(filteredPosts.filter(p => p.id !== postToDelete.id));
      
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/admin/forum')}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t("admin.posts.backToForums")}</span>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t("admin.posts.title")}</h1>
          <p className="text-muted-foreground">
            {t("admin.posts.description")}
          </p>
        </div>
        <Button onClick={() => router.push("/admin/forum/posts/create")}>
          <Plus className="mr-2 h-4 w-4" /> {t("admin.posts.createPost")}
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full sm:w-64">
              <p className="text-sm font-medium mb-2">{t("admin.posts.selectForum")}</p>
              <Select
                value={selectedForum || ""}
                onValueChange={(value) => setSelectedForum(value === "all" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("admin.posts.allForums")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.posts.allForums")}</SelectItem>
                  {forums.map((forum) => (
                    <SelectItem key={forum.id} value={forum.id.toString()}>
                      {forum.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full relative">
              <p className="text-sm font-medium mb-2">Search</p>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("admin.posts.searchPosts")}
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-muted p-3">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{t("admin.posts.noPosts")}</h3>
            <p className="text-sm text-muted-foreground text-center max-w-[500px] mt-2">
              {posts.length === 0 
                ? t("admin.posts.noPostsYet") 
                : t("admin.posts.noPostsDesc")}
            </p>
            {posts.length === 0 && (
              <Button 
                className="mt-4" 
                onClick={() => router.push("/admin/forum/posts/create")}
              >
                <Plus className="mr-2 h-4 w-4" /> {t("admin.posts.createAPost")}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={post.sender.avatar} />
                    <AvatarFallback>
                      {post.sender.first_name?.[0]}
                      {post.sender.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {post.sender.first_name} {post.sender.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {post.image && <Badge variant="outline"><FileImage className="h-3 w-3 mr-1" /> {t("admin.posts.hasImage")}</Badge>}
                        {post.file && <Badge variant="outline"><FileText className="h-3 w-3 mr-1" /> {t("admin.posts.hasFile")}</Badge>}
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2">{post.content}</p>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-muted-foreground">
                        {post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'} · {post.reaction_counts.reduce((sum, r) => sum + r.count, 0)} reactions
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/admin/forum/posts/${post.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> {t("admin.posts.viewDetails")}
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            setPostToDelete(post);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="h-4 w-4 mr-1" /> {t("admin.posts.delete")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.posts.deleteConfirmation")}</DialogTitle>
            <DialogDescription>
              {t("admin.posts.deleteWarning")}
              {postToDelete && postToDelete.comment_count > 0 && (
                <p className="mt-2 text-destructive">
                  {t("admin.posts.commentDeleteWarning", { count: postToDelete.comment_count })}
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              {t("admin.posts.cancel")}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  {t("admin.posts.deleting")}
                </>
              ) : (
                t("admin.posts.confirmDelete")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
