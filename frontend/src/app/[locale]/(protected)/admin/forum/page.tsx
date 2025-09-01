"use client";

import { createForum, listForums, updateForum, deleteForum } from "@/actions/forum";
import { ForumType } from "@/types";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  MessagesSquare, 
  MessageCircle,
  Plus, 
  Search, 
  Settings, 
  Shield, 
  Trash, 
  Bell, 
  Edit, 
  Eye
} from "lucide-react";
import { useI18n } from "@/locales/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Credenza, CredenzaClose, CredenzaContent, CredenzaDescription, CredenzaFooter, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from "@/components/ui/credenza";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function AdminForumPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [newForumName, setNewForumName] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedForum, setSelectedForum] = useState<ForumType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [forumToDelete, setForumToDelete] = useState<ForumType | null>(null);
  const t = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();

  const forumSchema = z.object({
    name: z.string().min(3, t("admin.forum.forumNameRequired"))
  });

  // Fetch forums with TanStack Query
  const { 
    data: forums = [], 
    isLoading,
    error: forumsError
  } = useQuery({
    queryKey: ['forums'],
    queryFn: async () => {
      return await listForums();
    }
  });

  // Create forum mutation
  const createForumMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      return await createForum(data);
    },
    onSuccess: (newForum) => {
      // Update forums cache
      queryClient.setQueryData(['forums'], (prevData: ForumType[] | undefined) => {
        return prevData ? [...prevData, newForum] : [newForum];
      });

      setNewForumName("");
      setDialogOpen(false);
      
      toast.success(t("admin.forum.createSuccess"), {
        description: t("admin.forum.createDescription", { name: newForum.name }),
      });
    },
    onError: (error) => {
      console.error("Error creating forum:", error);
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      } else {
        setError(t("admin.forum.createError"));
        toast.error(t("forum.error"), {
          description: t("admin.forum.unexpectedError"),
        });
      }
    }
  });

  // Update forum mutation
  const updateForumMutation = useMutation({
    mutationFn: async (forum: ForumType) => {
      return await updateForum(forum);
    },
    onSuccess: (updatedForum) => {
      // Update forums cache
      queryClient.setQueryData(['forums'], (prevData: ForumType[] | undefined) => {
        if (!prevData) return [updatedForum];
        return prevData.map(forum => 
          forum.id === updatedForum.id ? updatedForum : forum
        );
      });

      setIsEditDialogOpen(false);
      setSelectedForum(null);
      
      toast.success("Forum updated successfully", {
        description: `The forum "${updatedForum.name}" has been updated`,
      });
    },
    onError: (error) => {
      console.error("Error updating forum:", error);
      toast.error(t("forum.error"), {
        description: "Failed to update forum",
      });
    }
  });

  // Delete forum mutation
  const deleteForumMutation = useMutation({
    mutationFn: async (forumId: number) => {
      return await deleteForum(forumId.toString());
    },
    onSuccess: (_, forumId) => {
      // Update forums cache
      queryClient.setQueryData(['forums'], (prevData: ForumType[] | undefined) => {
        if (!prevData) return [];
        return prevData.filter(forum => forum.id !== forumId);
      });
      
      toast.success("Forum deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting forum:", error);
      toast.error(t("forum.error"), {
        description: "Failed to delete forum",
      });
    }
  });

  const handleCreateForum = async () => {
    try {
      // Validate input
      forumSchema.parse({ name: newForumName });
      setError("");
      
      // Execute the mutation
      createForumMutation.mutate({ name: newForumName });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      } else {
        console.error("Error creating forum:", error);
        setError(t("admin.forum.createError"));
        toast.error(t("forum.error"), {
          description: t("admin.forum.unexpectedError"),
        });
      }
    }
  };

  const handleUpdateForum = async () => {
    if (!selectedForum) return;
    
    try {
      // Validate input
      forumSchema.parse({ name: selectedForum.name });
      setError("");
      
      // Execute the mutation
      updateForumMutation.mutate(selectedForum);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      } else {
        console.error("Error updating forum:", error);
        setError("Failed to update forum");
        toast.error(t("forum.error"), {
          description: t("admin.forum.unexpectedError"),
        });
      }
    }
  };

  const handleConfirmDelete = () => {
    if (!forumToDelete) return;
    deleteForumMutation.mutate(forumToDelete.id);
    setIsDeleteDialogOpen(false);
    setForumToDelete(null);
  };

  const filteredForums = forums.filter((forum) =>
    forum.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full px-4 sm:px-6 py-8 bg-gradient-to-b from-primary/5 via-background to-background min-h-screen"
    >
      <motion.div 
        className="relative flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-primary/10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/10 rounded-bl-full z-0 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-primary/10 rounded-tr-full z-0 opacity-10"></div>
        
        <div className="flex items-center mb-4 sm:mb-0 relative z-10">
          <div className="hidden sm:flex bg-primary/10 sm:p-3 rounded-full sm:mr-4">
            <MessagesSquare className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {t("admin.forum.title")}
            </h1>
            <p className="text-sm text-gray-600">{t("admin.forum.description")}</p>
          </div>
        </div>

        <Credenza open={dialogOpen} onOpenChange={setDialogOpen}>
          <CredenzaTrigger asChild>
            <Button 
              className="w-full sm:w-fit bg-primary hover:bg-primary/90 text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow rounded-lg relative z-10"
              size="default"
            >
              <Plus size={20} /> {t("admin.forum.createForum")}
            </Button>
          </CredenzaTrigger>
          <CredenzaContent className="p-2 mb-10">
            <CredenzaHeader>
              <CredenzaTitle>{t("admin.forum.createForum")}</CredenzaTitle>
              <CredenzaDescription>
                {t("admin.forum.createForumDescription")}
              </CredenzaDescription>
            </CredenzaHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t("admin.forum.forumName")}</Label>
                <Input
                  id="name"
                  placeholder={t("admin.forum.enterForumName")}
                  value={newForumName}
                  onChange={(e) => setNewForumName(e.target.value)}
                />
                {error && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {error}
                  </p>
                )}
              </div>
            </div>
            <CredenzaFooter className="p-0">
              <div className="flex items-center gap-5">
                <CredenzaClose asChild className="flex-1">
                <Button variant="outline">{t("common.cancel")}</Button>
              </CredenzaClose>
              <Button 
                onClick={handleCreateForum} 
                disabled={createForumMutation.isPending || !newForumName.trim()}
                className="flex-1"
              >
                {createForumMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    {t("admin.forum.creatingButton")}
                  </>
                ) : (
                  <>{t("admin.forum.createButton")}</>
                )}
              </Button>
              </div>
            </CredenzaFooter>
          </CredenzaContent>
        </Credenza>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Forum</DialogTitle>
              <DialogDescription>
                Update the forum details below
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">{t("admin.forum.forumName")}</Label>
                <Input
                  id="edit-name"
                  placeholder={t("admin.forum.enterForumName")}
                  value={selectedForum?.name || ""}
                  onChange={(e) => setSelectedForum(prev => prev ? {...prev, name: e.target.value} : null)}
                />
                {error && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {error}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t("common.cancel")}</Button>
              </DialogClose>
              <Button 
                onClick={handleUpdateForum} 
                disabled={updateForumMutation.isPending || !selectedForum?.name.trim()}
              >
                {updateForumMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    Updating...
                  </>
                ) : (
                  <>Update Forum</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Forum</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this forum? This action cannot be undone and will delete all associated posts and comments.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t("common.cancel")}</Button>
              </DialogClose>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDelete} 
                disabled={deleteForumMutation.isPending}
              >
                {deleteForumMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  <>Delete Forum</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      <Tabs defaultValue="all" className="space-y-6" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="sm:min-w-[300px] bg-primary/10">
            <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white">
              <MessagesSquare className="h-4 w-4 mr-2" />
              {t("admin.forum.allForums")}
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white">
              <MessageCircle className="h-4 w-4 mr-2" />
              {t("admin.forum.posts")}
            </TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("admin.forum.searchForums")}
              className="w-full sm:w-[300px] pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <TabsContent value="all" className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : filteredForums.length === 0 ? (
            <Card className="border border-primary/20 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <AlertCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-2 text-xl font-semibold">{t("admin.forum.noForumsFound")}</h3>
                <p className="text-base text-muted-foreground text-center max-w-[500px] mt-3">
                  {searchQuery 
                    ? t("admin.forum.noForumsMatchSearch", { search: searchQuery })
                    : t("admin.forum.noForumsYet")}
                </p>
                {!searchQuery && (
                  <Button className="mt-6 bg-primary hover:bg-primary/90 text-white" onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 h-5 w-5" /> {t("admin.forum.createFirstForum")}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            >
              {filteredForums.map((forum) => (
                <motion.div variants={itemVariants} key={forum.id}>
                  <Card className="overflow-hidden border border-primary/20 h-full transition-all hover:shadow-lg">
                    <CardHeader className="pb-2 relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-bold">{forum.name}</CardTitle>
                        <Badge variant="outline" className="font-normal bg-primary/5">
                          {t("admin.forum.forumId", { id: forum.id })}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {t("admin.forum.createdOn", { date: new Date(forum.created_at).toLocaleDateString() })}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardFooter className="flex flex-col pt-4 gap-3">
                      <div className="flex w-full gap-2">
                        <Button 
                          variant="default"
                          className="flex-1 bg-primary hover:bg-primary/90 text-white"
                          asChild
                        >
                          <Link href={`/admin/forum/${forum.id}`}>
                            <Shield className="h-4 w-4 mr-1" />
                            {t("admin.forum.manageForum")}
                          </Link>
                        </Button>
                        
                        <Button 
                          variant="outline"
                          className="flex-shrink-0 bg-background hover:bg-muted"
                          asChild
                        >
                          <Link href={`/forum/${forum.id}`} target="_blank">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Forum</span>
                          </Link>
                        </Button>
                      </div>

                      <div className="flex justify-between w-full gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="flex-1 hover:bg-blue-50 hover:text-blue-500"
                          onClick={() => {
                            setSelectedForum(forum);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="flex-1 hover:bg-red-50 hover:text-red-500"
                          onClick={() => {
                            setForumToDelete(forum);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
        
        <TabsContent value="posts">
          <Card className="border border-primary/20 shadow-md">
            <CardHeader>
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                <CardTitle>{t("admin.forum.allForumPosts")}</CardTitle>
              </div>
              <CardDescription>
                {t("admin.forum.forumPostsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center py-4">
                <Button 
                  variant="default" 
                  onClick={() => router.push('/admin/forum/posts')}
                  className="bg-primary hover:bg-primary/90 text-white px-6"
                  size="lg"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t("admin.forum.viewAllPosts")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-12">
        <Separator className="my-6" />
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          {t("admin.forum.quickAccess")}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border border-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-2">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">{t("admin.forum.posts")}</CardTitle>
              <CardDescription className="line-clamp-2">
                {t("admin.forum.forumPostsDescription")}
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-0">
              <Button 
                onClick={() => router.push('/admin/forum/posts')}
                variant="outline" 
                className="w-full border-primary/20 hover:bg-primary/5 hover:text-primary"
              >
                <Eye className="mr-2 h-4 w-4" />
                {t("admin.forum.viewAllPostsButton")}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border border-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="bg-blue-100 p-3 rounded-full w-fit mb-2">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">{t("forum.notifications.title")}</CardTitle>
              <CardDescription className="line-clamp-2">
                {t("admin.forum.forumNotificationsDescription")}
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-0">
              <Button 
                onClick={() => router.push('/admin/forum/notifications')}
                variant="outline" 
                className="w-full border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                <Eye className="mr-2 h-4 w-4" />
                {t("admin.forum.viewNotificationsButton")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
