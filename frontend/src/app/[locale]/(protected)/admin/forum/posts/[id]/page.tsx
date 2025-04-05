"use client";

import { deletePost, getFeedById, getPostById } from "@/actions/forum";
import { PostType } from "@/types";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Edit, Eye, FileIcon, ImageIcon, Trash } from "lucide-react";
import { useI18n } from "@/locales/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Comments from "@/components/forum/Comments";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function PostDetailPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const t = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Use useParams hook to get the params object
  const params = useParams();
  const postId = params.id as string;

  // Fetch post data with TanStack Query
  const { 
    data: post, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      return await getFeedById(parseInt(postId));
    }
  });

  console.log({error, post});

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      await deletePost(postId);
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      // Navigate back to posts list
      router.push("/admin/forum/posts");
      // Invalidate queries to refetch posts
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error("Error deleting post:", error);
      toast.error(t("forum.error"), {
        description: "Failed to delete post",
      });
      setDeleteDialogOpen(false);
    }
  });

  const handleConfirmDelete = async () => {
    if (!post) return;
    deletePostMutation.mutate(post.id);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-muted p-3">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{t("forum.postNotFound")}</h3>
            <p className="text-sm text-muted-foreground text-center max-w-[500px] mt-2">
              {t("forum.somethingWentWrong")}
            </p>
            <Button className="mt-4" onClick={() => router.push('/admin/forum/posts')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {t("forum.backToForum")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/admin/forum/posts')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("admin.post.backToPosts")}</span>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.sender.avatar} />
                    <AvatarFallback>
                      {post.sender.first_name?.[0]}
                      {post.sender.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {post.sender.first_name} {post.sender.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("admin.post.posted", { time: formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) })}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {/* <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" /> {t("admin.post.viewOnSite")}
                  </Button> */}
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" /> {t("admin.post.edit")}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash className="h-4 w-4 mr-1" /> {t("admin.post.delete")}
                  </Button>
                </div>
              </div>

              <div className="mt-4 whitespace-pre-wrap">
                {post.content}
              </div>

              {post.image && (
                <div className="mt-4">
                  <Image 
                    src={post.image} 
                    alt="Post image" 
                    width={800}
                    height={500}
                    className="rounded-md max-h-[500px] object-contain" 
                  />
                </div>
              )}

              {post.file && (
                <div className="mt-4 p-3 border rounded-md flex items-center gap-3">
                  <FileIcon className="h-8 w-8 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium">Attachment</p>
                    <p className="text-sm text-muted-foreground">{post.file.split('/').pop()}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={post.file} target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
                  </Button>
                </div>
              )}

              <Separator className="my-6" />

              <h3 className="text-lg font-semibold mb-4">
                {t("admin.post.comments", { count: post.comment_count })}
              </h3>
              
              {post.comment_count > 0 ? (
                <Comments post={post} />
              ) : (
                <div className="text-center py-6 bg-muted/10 rounded-md">
                  <h4 className="font-medium">{t("admin.post.noComments")}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("admin.post.noCommentsDesc")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Post Details</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">ID</dt>
                  <dd>{post.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                  <dd>{new Date(post.created_at).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Forum</dt>
                  <dd className="flex items-center gap-2">
                    <span>Forum #{post.forum}</span>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto"
                      onClick={() => router.push(`/admin/forum/${post.forum}`)}
                    >
                      {t("admin.post.viewForum")}
                    </Button>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">{t("admin.post.reactions", { count: post.reaction_counts.reduce((sum, r) => sum + r.count, 0) })}</dt>
                  <dd className="flex flex-wrap gap-2 mt-1">
                    {post.reaction_counts.map((reaction) => (
                      <Badge key={reaction.reaction_type} variant="outline">
                        {reaction.reaction_type === 'LIKE' && '👍'}
                        {reaction.reaction_type === 'LOVE' && '❤️'}
                        {reaction.reaction_type === 'HAHA' && '😄'}
                        {reaction.reaction_type === 'WOW' && '😮'}
                        {reaction.reaction_type === 'SAD' && '😢'}
                        {reaction.reaction_type === 'ANGRY' && '😠'}
                        <span className="ml-1">{reaction.count}</span>
                      </Badge>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Metadata</dt>
                  <dd className="flex flex-wrap gap-2 mt-1">
                    {post.image && <Badge variant="outline"><ImageIcon className="h-3 w-3 mr-1" /> {t("admin.post.hasImage")}</Badge>}
                    {post.file && <Badge variant="outline"><FileIcon className="h-3 w-3 mr-1" /> {t("admin.post.hasAttachment")}</Badge>}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.posts.deleteConfirmation")}</DialogTitle>
            <DialogDescription>
              {t("admin.posts.deleteWarning")}
              {post.comment_count > 0 && (
                <p className="mt-2 text-destructive">
                  {t("admin.posts.commentDeleteWarning", { count: post.comment_count })}
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletePostMutation.isPending}
            >
              {t("admin.posts.cancel")}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? (
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
