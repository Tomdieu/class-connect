"use client";

import { createPost, getFeeds, listForums, deletePost, updatePost, getForumNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/actions/forum";
import PostCard from "@/components/forum/PostCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/locales/client";
import { CreatePostRequestType, ForumNotification, ForumType, PostType } from "@/types";
import { AlertCircle, ArrowUp, Bell, BellOff, Image as ImageIcon, Loader2, PaperclipIcon } from "lucide-react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const SCROLL_THRESHOLD = 300; // Show scroll-to-top button after scrolling this many pixels

export default function ForumPage() {
  const t = useI18n();
  const queryClient = useQueryClient();
  const [selectedForum, setSelectedForum] = useState<string>("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fileAttachment, setFileAttachment] = useState<File | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<PostType | null>(null);
  const [postToEdit, setPostToEdit] = useState<PostType | null>(null);
  const [editContent, setEditContent] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle scroll events to show/hide the scroll-to-top button
  const handleScroll = useCallback(() => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Query for forums
  const forumsQuery = useQuery({
    queryKey: ["forums"],
    queryFn: listForums,
  });

  // Query for notifications
  const notificationsQuery = useQuery({
    queryKey: ["forumNotifications"],
    queryFn: getForumNotifications,
  });

  // Mutation for marking all notifications as read
  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumNotifications"] });
    },
  });

  // Mutation for marking a single notification as read
  const markNotificationReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumNotifications"] });
    },
  });

  // Infinite query for posts/feeds
  const feedsQuery = useInfiniteQuery({
    queryKey: ["feed", selectedForum],
    queryFn: async ({ pageParam = 1 }) => {
      const data = await getFeeds({
        page: pageParam,
        page_size: 10,
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      const url = new URL(lastPage.next);
      return url.searchParams.get("page");
    },
    enabled: true,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: CreatePostRequestType) => {
      return await createPost(postData);
    },
    onSuccess: () => {
      // Reset form
      setContent("");
      setImageFile(null);
      setFileAttachment(null);

      // Show success toast
      toast.success(t("forum.postCreated"), {
        description: t("forum.postCreatedSuccess"),
      });

      // Invalidate and refetch forum feed
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: () => {
      toast.error(t("forum.error"), {
        description: t("forum.postCreationFailed"),
      });
    },
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { content: string } }) => {
      return await updatePost(id, data);
    },
    onSuccess: () => {
      // Show success toast
      toast.success("Post Updated", {
        description: "Your post was updated successfully",
      });

      // Reset edit state
      setPostToEdit(null);
      setEditContent("");
      setIsEditDialogOpen(false);

      // Invalidate and refetch forum feed
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: () => {
      toast.error(t("forum.error"), {
        description: "Failed to update post. Please try again.",
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return await deletePost(postId);
    },
    onSuccess: () => {
      // Show success toast
      toast.success("Post Deleted", {
        description: "Your post was deleted successfully",
      });

      // Reset delete state
      setPostToDelete(null);
      setIsDeleteDialogOpen(false);

      // Invalidate and refetch forum feed
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: () => {
      toast.error(t("forum.error"), {
        description: "Failed to delete post. Please try again.",
      });
    },
  });

  // Forum selection handler
  const handleForumSelect = (forumId: string) => {
    setSelectedForum(forumId);
  };

  // Content input handler
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(t("forum.error"), {
        description: `${t("forum.maxFileSize", { image: "5MB", file: "10MB" })}`,
      });
      return;
    }

    setImageFile(file);
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("forum.error"), {
        description: `${t("forum.maxFileSize", { image: "5MB", file: "10MB" })}`,
      });
      return;
    }

    setFileAttachment(file);
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error(t("forum.error"), {
        description: t("forum.contentRequired"),
      });
      return;
    }

    if (!selectedForum) {
      toast.error(t("forum.selectForumError"), {
        description: t("forum.pleaseSelectForum"),
      });
      return;
    }

    const postData: CreatePostRequestType = {
      forum: parseInt(selectedForum),
      content,
      image: imageFile || undefined,
      file: fileAttachment || undefined,
    };

    createPostMutation.mutate(postData);
  };

  // Handle post edit
  const handleEditPost = (post: PostType) => {
    setPostToEdit(post);
    setEditContent(post.content);
    setIsEditDialogOpen(true);
  };

  // Handle post delete
  const handleDeletePost = (post: PostType) => {
    setPostToDelete(post);
    setIsDeleteDialogOpen(true);
  };

  // Handle post edit submission
  const handleEditSubmit = () => {
    if (!postToEdit) return;
    
    if (!editContent.trim()) {
      toast.error(t("forum.error"), {
        description: t("forum.contentRequired"),
      });
      return;
    }

    updatePostMutation.mutate({
      id: postToEdit.id,
      data: { content: editContent }
    });
  };

  // Handle post delete confirmation
  const handleDeleteConfirm = () => {
    if (!postToDelete) return;
    deletePostMutation.mutate(postToDelete.id);
  };

  // Handle notification click
  const handleNotificationClick = async (notification: ForumNotification) => {
    // Mark notification as read
    if (!notification.read) {
      markNotificationReadMutation.mutate(notification.id);
    }

    // Scroll to related post if present
    if (notification.post) {
      const postElement = document.getElementById(`post-${notification.post.id}`);
      if (postElement) {
        postElement.scrollIntoView({ behavior: 'smooth' });
        // Optional: Add a highlight effect
        postElement.classList.add('highlight-post');
        setTimeout(() => postElement.classList.remove('highlight-post'), 2000);
      }
    }

    // Close notifications popover
    setNotificationsOpen(false);
  };

  // Handle mark all notifications as read
  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  // Get notification message based on type
  const getNotificationMessage = (notification: ForumNotification) => {
    const senderName = `${notification.sender.first_name} ${notification.sender.last_name}`;
    
    switch (notification.notification_type) {
      case 'REACTION':
        return t("forum.notifications.reaction", { name: senderName });
      case 'COMMENT':
        return t("forum.notifications.comment", { name: senderName });
      case 'REPLY':
        return t("forum.notifications.reply", { name: senderName });
      case 'MENTION':
        return t("forum.notifications.mention", { name: senderName });
      default:
        return t("forum.notifications.default", { name: senderName });
    }
  };

  // Count unread notifications
  const unreadCount = notificationsQuery.data?.filter(n => !n.read).length || 0;

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("forum.title")}</h1>
        
        {/* Notifications */}
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between p-4 border-b">
              <h4 className="font-medium">{t("forum.notifications.title")}</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllRead}
                disabled={!notificationsQuery.data?.length || markAllReadMutation.isPending}
              >
                {markAllReadMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("forum.notifications.markAllRead")
                )}
              </Button>
            </div>
            <ScrollArea className="h-[300px]">
              {notificationsQuery.isLoading ? (
                <div className="flex justify-center items-center h-20">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : !notificationsQuery.data?.length ? (
                <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                  <BellOff className="h-8 w-8 mb-2" />
                  <p>{t("forum.notifications.empty")}</p>
                </div>
              ) : (
                <div>
                  {notificationsQuery.data.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        !notification.read ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="h-9 w-9 rounded-full overflow-hidden">
                            {notification.sender.avatar ? (
                              <img 
                                src={notification.sender.avatar} 
                                alt={`${notification.sender.first_name} ${notification.sender.last_name}`} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="bg-primary text-white h-full w-full flex items-center justify-center text-sm font-medium">
                                {notification.sender.first_name?.[0]}
                                {notification.sender.last_name?.[0]}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {getNotificationMessage(notification)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>

      {/* Post creation form */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Forum selector */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("forum.selectForum")}
              </label>
              <Select 
                onValueChange={handleForumSelect} 
                value={selectedForum}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("forum.selectForum")} />
                </SelectTrigger>
                <SelectContent>
                  {forumsQuery.data?.map((forum: ForumType) => (
                    <SelectItem key={forum.id} value={forum.id.toString()}>
                      {forum.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content textarea */}
            <Textarea
              placeholder={t("forum.whatsOnYourMind")}
              className="min-h-[120px]"
              value={content}
              onChange={handleContentChange}
            />

            {/* Attachment previews */}
            <div className="flex gap-4 flex-wrap">
              {imageFile && (
                <div className="relative group">
                  <div className="border rounded-md overflow-hidden h-24 w-24">
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Image preview"
                      className="object-cover h-full w-full"
                    />
                  </div>
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 h-6 w-6 flex items-center justify-center"
                    onClick={() => setImageFile(null)}
                  >
                    ×
                  </button>
                </div>
              )}

              {fileAttachment && (
                <div className="relative group">
                  <div className="border rounded-md p-2 h-24 w-32 flex flex-col items-center justify-center">
                    <PaperclipIcon className="h-8 w-8 text-gray-500" />
                    <span className="text-xs truncate max-w-full">
                      {fileAttachment.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 h-6 w-6 flex items-center justify-center"
                    onClick={() => setFileAttachment(null)}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex space-x-2">
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={Boolean(fileAttachment) || createPostMutation.isPending}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {t("forum.photo")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={Boolean(imageFile) || createPostMutation.isPending}
                >
                  <PaperclipIcon className="h-4 w-4 mr-2" />
                  {t("forum.file")}
                </Button>
              </div>
              <Button
                type="submit"
                disabled={
                  !content.trim() ||
                  !selectedForum ||
                  createPostMutation.isPending
                }
              >
                {createPostMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("forum.posting")}
                  </>
                ) : (
                  t("forum.post")
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Posts feed */}
      <div className="space-y-6">
        {feedsQuery.isLoading ? (
          <div className="flex justify-center my-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : feedsQuery.error ? (
          <div className="text-center my-12">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              {t("forum.somethingWentWrong")}
            </h3>
            <Button onClick={() => feedsQuery.refetch()}>
              {t("common.tryAgain")}
            </Button>
          </div>
        ) : feedsQuery.data.pages[0].results.length === 0 ? (
          <div className="text-center my-12 bg-muted/50 py-16 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">
              {t("forum.noPostsYet")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("forum.beTheFirstToPost")}
            </p>
          </div>
        ) : (
          <>
            {/* Map through all pages and their results */}
            {feedsQuery.data.pages.map((page, i) => (
              <div key={i} className="space-y-6">
                {page.results.map((post: PostType) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onEdit={handleEditPost}
                    onDelete={handleDeletePost}
                  />
                ))}
              </div>
            ))}

            {/* Load more button */}
            {feedsQuery.hasNextPage && (
              <div className="text-center mt-6">
                <Button
                  onClick={() => feedsQuery.fetchNextPage()}
                  disabled={feedsQuery.isFetchingNextPage}
                  variant="outline"
                >
                  {feedsQuery.isFetchingNextPage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    t("forum.loadMore")
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Make changes to your post below.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[150px] mt-2"
          />
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubmit}
              disabled={updatePostMutation.isPending || !editContent.trim()}
            >
              {updatePostMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post and all of its comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePostMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 rounded-full shadow-lg size-12 p-0"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      <style jsx global>{`
        .highlight-post {
          animation: highlight 2s ease-in-out;
        }
        
        @keyframes highlight {
          0% { background-color: rgba(59, 130, 246, 0.1); }
          50% { background-color: rgba(59, 130, 246, 0.2); }
          100% { background-color: transparent; }
        }
      `}</style>
    </div>
  );
}
