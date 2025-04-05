"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/locales/client";
import { useRouter } from "next/navigation";
import CreatePost from "@/components/forum/CreatePost";
import { listForums } from "@/actions/forum";
import { ForumType } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreatePostPage() {
  const t = useI18n();
  const router = useRouter();
  const [forums, setForums] = useState<ForumType[]>([]);
  const [selectedForum, setSelectedForum] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchForums = async () => {
      try {
        const data = await listForums();
        setForums(data);
        
        if (data.length > 0) {
          setSelectedForum(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching forums:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForums();
  }, []);

  const handlePostCreated = () => {
    // Navigate back to posts list after successful creation
    router.push("/admin/forum/posts");
  };

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
          <span>{t("admin.createPost.backToPosts")}</span>
        </Button>
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-4">{t("admin.createPost.title")}</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.createPost.postContent")}</CardTitle>
              <CardDescription>
                {t("admin.createPost.postContentDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : forums.length > 0 ? (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      {t("admin.createPost.selectForum")}
                    </label>
                    <Select
                      value={selectedForum?.toString()}
                      onValueChange={(value) => setSelectedForum(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("admin.createPost.selectAForum")} />
                      </SelectTrigger>
                      <SelectContent>
                        {forums.map((forum) => (
                          <SelectItem key={forum.id} value={forum.id.toString()}>
                            {forum.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedForum && (
                    <CreatePost
                      forumId={selectedForum}
                      onPostCreated={handlePostCreated}
                      placeholder={t("admin.createPost.whatsOnYourMind")}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No forums available. Create a forum first.</p>
                  <Button 
                    onClick={() => router.push('/admin/forum')} 
                    className="mt-4"
                  >
                    Create Forum
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.createPost.imageOptional")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Add an image to enhance your post visibility and engagement. Supported formats include JPEG, PNG, and GIF up to 8MB.
              </p>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t("admin.createPost.attachmentOptional")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Attach documents or other files to provide additional resources. Maximum file size is 100MB.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
