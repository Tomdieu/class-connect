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
import { AlertCircle, ArrowUp, Bell, BellOff, Image as ImageIcon, Loader2, LoaderCircle, MessageCircle, PaperclipIcon } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

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
      if (!lastPage || !lastPage.next) return undefined;
      const url = new URL(lastPage.next);
      const page = url.searchParams.get("page");
      return page ? parseInt(page, 10) : undefined;
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
      toast.success(t("forum.postUpdated"), {
        description: t("forum.postUpdatedSuccess"),
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
        description: t("forum.postUpdateFailed"),
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
      toast.success(t("forum.postDeleted"), {
        description: t("forum.postDeletedSuccess"),
      });

      // Reset delete state
      setPostToDelete(null);
      setIsDeleteDialogOpen(false);

      // Invalidate and refetch forum feed
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: () => {
      toast.error(t("forum.error"), {
        description: t("forum.postDeleteFailed"),
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
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="py-8 px-4 sm:px-6">
        <div className="relative mb-8">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/30 rounded-bl-full z-0 opacity-20 hidden md:block"></div>
          <div className="flex justify-between items-center relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">{t("forum.title")}</h1>
            
            {/* Notifications */}
            <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="relative border-primary/20 hover:bg-primary/10 hover:text-primary"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 border-primary/20 bg-card/95 backdrop-blur" align="end">
                <div className="flex items-center justify-between p-4 border-b border-primary/20">
                  <h4 className="font-medium text-primary">{t("forum.notifications.title")}</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleMarkAllRead}
                    disabled={!notificationsQuery.data?.length || markAllReadMutation.isPending}
                    className="hover:text-primary hover:bg-primary/10"
                  >
                    {markAllReadMutation.isPending ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      t("forum.notifications.markAllRead")
                    )}
                  </Button>
                </div>
                <ScrollArea className="h-[300px]">
                  {notificationsQuery.isLoading ? (
                    <div className="flex justify-center items-center h-20">
                      <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
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
                          className={`p-3 border-b border-primary/10 cursor-pointer transition-colors ${
                            !notification.read ? "bg-primary/5" : "hover:bg-primary/5"
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="h-9 w-9 rounded-full overflow-hidden">
                                <Avatar className="h-full w-full">
                                  <AvatarImage 
                                    src={notification.sender.avatar} 
                                    alt={`${notification.sender.first_name} ${notification.sender.last_name}`}
                                  />
                                  <AvatarFallback className="bg-primary text-white">
                                    {notification.sender.first_name?.[0]}
                                    {notification.sender.last_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
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
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
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
          <p className="text-muted-foreground relative z-10 mt-2">
            Connect with other students and teachers in our community forum
          </p>
        </div>

        {/* Post creation form */}
        <Card className="mb-8 bg-card/95 backdrop-blur border-primary/20 shadow-md relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-primary/20 rounded-tr-full z-0 opacity-20"></div>
          <CardContent className="pt-6 relative z-10">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Forum selector */}
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  {t("forum.selectForum")}
                </label>
                <Select 
                  onValueChange={handleForumSelect} 
                  value={selectedForum}
                >
                  <SelectTrigger className="bg-background border-primary/20">
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
                className="min-h-[120px] bg-background border-primary/20 focus-visible:ring-primary/20"
                value={content}
                onChange={handleContentChange}
              />

              {/* Attachment previews */}
              <div className="flex gap-4 flex-wrap">
                {imageFile && (
                  <div className="relative group">
                    <div className="border border-primary/20 rounded-md overflow-hidden h-24 w-24">
                      <Image
                        src={URL.createObjectURL(imageFile)}
                        alt={t("forum.imagePreview")}
                        className="object-cover h-full w-full"
                        width={96}
                        height={96}
                      />
                    </div>
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 h-6 w-6 flex items-center justify-center shadow-sm"
                      onClick={() => setImageFile(null)}
                    >
                      ×
                    </button>
                  </div>
                )}

                {fileAttachment && (
                  <div className="relative group">
                    <div className="border border-primary/20 rounded-md p-2 h-24 w-32 flex flex-col items-center justify-center bg-primary/5">
                      <PaperclipIcon className="h-8 w-8 text-primary" />
                      <span className="text-xs truncate max-w-full">
                        {fileAttachment.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 h-6 w-6 flex items-center justify-center shadow-sm"
                      onClick={() => setFileAttachment(null)}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-primary/20">
                <div className="flex flex-wrap gap-2">
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
                    className="border-primary/20 hover:bg-primary/10 hover:text-primary"
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
                    className="border-primary/20 hover:bg-primary/10 hover:text-primary"
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
                  className="bg-primary hover:bg-primary/90"
                >
                  {createPostMutation.isPending ? (
                    <>
                      <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                      {t("forum.posting")}
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {t("forum.post")}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Posts feed */}
        <div className="space-y-6 relative">
          <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-primary/20 rounded-tr-full z-0 opacity-20 hidden lg:block"></div>

          {feedsQuery.isLoading ? (
            <div className="flex justify-center my-12 py-10">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : feedsQuery.error ? (
            <div className="text-center my-12 py-10 bg-card/95 backdrop-blur rounded-lg border border-destructive/20">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                {t("forum.somethingWentWrong")}
              </h3>
              <Button 
                onClick={() => feedsQuery.refetch()}
                className="bg-primary hover:bg-primary/90 mt-2"
              >
                {t("common.tryAgain")}
              </Button>
            </div>
          ) : feedsQuery.data?.pages[0].results.length === 0 ? (
            <div className="text-center my-12 bg-card/95 backdrop-blur py-16 rounded-lg border border-primary/20 shadow-md">
              <div className="mx-auto mb-4 rounded-full bg-primary/10 p-3 w-16 h-16 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-primary">
                {t("forum.noPostsYet")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t("forum.beTheFirstToPost")}
              </p>
            </div>
          ) : (
            <>
              {/* Map through all pages and their results */}
              {feedsQuery.data?.pages.map((page, i) => (
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
                    className="border-primary/20 hover:bg-primary/10 hover:text-primary"
                  >
                    {feedsQuery.isFetchingNextPage ? (
                      <>
                        <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                        {t("forum.loading")}
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
          <DialogContent className="bg-card/95 backdrop-blur border-primary/20">
            <DialogHeader>
              <DialogTitle className="text-primary">{t("forum.editPost")}</DialogTitle>
              <DialogDescription>
                {t("forum.editPostDescription")}
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[150px] mt-2 bg-background border-primary/20"
            />
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="border-primary/20 hover:bg-primary/10"
              >
                {t("common.cancel")}
              </Button>
              <Button 
                onClick={handleEditSubmit}
                disabled={updatePostMutation.isPending || !editContent.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                {updatePostMutation.isPending ? (
                  <>
                    <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                    {t("forum.updating")}
                  </>
                ) : (
                  t("forum.saveChanges")
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-card/95 backdrop-blur border-primary/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-primary">{t("forum.deletePost")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("forum.deletePostWarning")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-primary/20 hover:bg-primary/10">
                {t("common.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deletePostMutation.isPending ? (
                  <>
                    <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                    {t("forum.deleting")}
                  </>
                ) : (
                  t("common.delete")
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Scroll to top button */}
        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 rounded-full shadow-lg size-12 p-0 bg-primary hover:bg-primary/90"
            aria-label={t("forum.scrollToTop")}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        )}

        <style jsx global>{`
          .highlight-post {
            animation: highlight 2s ease-in-out;
          }
          
          @keyframes highlight {
            0% { background-color: rgba(var(--primary-rgb), 0.1); }
            50% { background-color: rgba(var(--primary-rgb), 0.2); }
            100% { background-color: transparent; }
          }
        `}</style>
      </div>
    </div>
  );
}
