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
import { AlertCircle, ArrowLeft, ArrowUp, Bell, BellOff, Image as ImageIcon, Loader2, MessageSquare, PaperclipIcon } from "lucide-react";
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
import { motion } from "framer-motion";
import Link from "next/link";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const SCROLL_THRESHOLD = 300; // Show scroll-to-top button after scrolling this many pixels

// Add animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const fadeInVariants = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen w-full bg-gradient-to-b from-primary/5 via-background to-background p-4 sm:p-6"
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-[2400px] mx-auto mb-6"
      >
        <Button variant="outline" size="sm" asChild className="hover:bg-primary/10 transition-all">
          <Link href="/students">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('common.back')} {t('common.dashboard')}
          </Link>
        </Button>
      </motion.div>

      <div className="w-full mx-auto">
        <motion.div 
          className="relative flex flex-col items-center justify-between mb-10 pb-4 border-b border-primary/10"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/10 rounded-bl-full z-0 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-primary/10 rounded-tr-full z-0 opacity-10"></div>
          
          <div className="flex items-center justify-between mb-4 relative z-10 w-full">
            <div className="flex items-center">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <MessageSquare className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {t("forum.title")}
                </h1>
                <p className="text-sm text-gray-600">{t("forum.description")}</p>
              </div>
            </div>
            
            {/* Notifications button */}
            <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative hover:bg-primary/10 transition-all">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Post creation form */}
          <motion.div variants={sectionVariants}>
            <Card className="shadow-lg border-primary/20 overflow-hidden bg-card/95 backdrop-blur">
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
          </motion.div>

          {/* Posts feed */}
          <motion.div variants={sectionVariants} className="space-y-6">
            {feedsQuery.isLoading ? (
              <div className="flex justify-center my-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : feedsQuery.error ? (
              <Card className="shadow-lg border-primary/20 overflow-hidden bg-card/95 backdrop-blur text-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  {t("forum.somethingWentWrong")}
                </h3>
                <Button onClick={() => feedsQuery.refetch()}>
                  {t("common.tryAgain")}
                </Button>
              </Card>
            ) : feedsQuery.data?.pages[0].results.length === 0 ? (
              <Card className="shadow-lg border-primary/20 overflow-hidden bg-card/95 backdrop-blur text-center py-12">
                <h3 className="font-semibold text-lg mb-2">
                  {t("forum.noPostsYet")}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t("forum.beTheFirstToPost")}
                </p>
              </Card>
            ) : (
              <>
                {/* Map through all pages and their results */}
                {feedsQuery.data?.pages.map((page, i) => (
                  <motion.div 
                    key={i} 
                    variants={sectionVariants}
                    className="space-y-6"
                  >
                    {page.results.map((post: PostType, index: number) => (
                      <motion.div
                        key={post.id}
                        variants={fadeInVariants}
                        custom={index}
                        transition={{ delay: index * 0.1 }}
                      >
                        <PostCard 
                          post={post} 
                          onEdit={handleEditPost}
                          onDelete={handleDeletePost}
                          className="shadow-lg border-primary/20 overflow-hidden bg-card/95 backdrop-blur"
                        />
                      </motion.div>
                    ))}
                  </motion.div>
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
          </motion.div>
        </motion.div>
      </div>

      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("forum.editPost")}</DialogTitle>
            <DialogDescription>
              {t("forum.editPostDescription")}
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
              {t("common.cancel")}
            </Button>
            <Button 
              onClick={handleEditSubmit}
              disabled={updatePostMutation.isPending || !editContent.trim()}
            >
              {updatePostMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("forum.deletePost")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("forum.deletePostWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePostMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
          className="fixed bottom-8 right-8 z-50 rounded-full shadow-lg size-12 p-0"
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
          0% { background-color: rgba(59, 130, 246, 0.1); }
          50% { background-color: rgba(59, 130, 246, 0.2); }
          100% { background-color: transparent; }
        }
      `}</style>
    </motion.div>
  );
}
