"use client";

import { createForum, listForums, updateForum, deleteForum } from "@/actions/forum";
import { ForumType } from "@/types";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, Edit, Plus, Search, Trash } from "lucide-react";
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
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("admin.forum.title")}</h1>
          <p className="text-muted-foreground">
            {t("admin.forum.description")}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {t("admin.forum.createForum")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("admin.forum.createForum")}</DialogTitle>
              <DialogDescription>
                {t("admin.forum.createForumDescription")}
              </DialogDescription>
            </DialogHeader>
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
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t("common.cancel")}</Button>
              </DialogClose>
              <Button 
                onClick={handleCreateForum} 
                disabled={createForumMutation.isPending || !newForumName.trim()}
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
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
      </div>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">{t("admin.forum.allForums")}</TabsTrigger>
            <TabsTrigger value="posts">{t("admin.forum.posts")}</TabsTrigger>
          </TabsList>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("admin.forum.searchForums")}
              className="w-[250px] pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredForums.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="rounded-full bg-muted p-3">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{t("admin.forum.noForumsFound")}</h3>
                <p className="text-sm text-muted-foreground text-center max-w-[500px] mt-2">
                  {searchQuery 
                    ? t("admin.forum.noForumsMatchSearch", { search: searchQuery })
                    : t("admin.forum.noForumsYet")}
                </p>
                {!searchQuery && (
                  <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> {t("admin.forum.createFirstForum")}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredForums.map((forum) => (
                <Card key={forum.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{forum.name}</CardTitle>
                      <Badge variant="outline" className="font-normal">
                        {t("admin.forum.forumId", { id: forum.id })}
                      </Badge>
                    </div>
                    <CardDescription>
                      {t("admin.forum.createdOn", { date: new Date(forum.created_at).toLocaleDateString() })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <Link href={`/admin/forum/${forum.id}`}>
                        <Button variant="default">
                          {t("admin.forum.manageForum")}
                        </Button>
                      </Link>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedForum(forum);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            setForumToDelete(forum);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.forum.allForumPosts")}</CardTitle>
              <CardDescription>
                {t("admin.forum.forumPostsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center">
                <Button 
                  variant="default" 
                  onClick={() => router.push('/admin/forum/posts')}
                >
                  {t("admin.forum.viewAllPosts")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <Separator className="my-4" />
        <h2 className="text-xl font-semibold mb-4">{t("admin.forum.quickAccess")}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t("admin.forum.posts")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t("admin.forum.forumPostsDescription")}
              </p>
              <Button onClick={() => router.push('/admin/forum/posts')} variant="outline" className="w-full">
                {t("admin.forum.viewAllPostsButton")}
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t("forum.notifications.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t("admin.forum.forumNotificationsDescription")}
              </p>
              <Button onClick={() => router.push('/admin/forum/notifications')} variant="outline" className="w-full">
                {t("admin.forum.viewNotificationsButton")}
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t("forum.post")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t("admin.forum.createPostDescription")}
              </p>
              <Button onClick={() => router.push('/admin/forum/posts/create')} variant="outline" className="w-full">
                {t("admin.forum.createPostButton")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
