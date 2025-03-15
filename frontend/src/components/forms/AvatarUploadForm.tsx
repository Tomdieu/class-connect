"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { updateUserAvatar } from "@/actions/accounts";
import { UserType } from "@/types";
import { useI18n } from "@/locales/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react"; // Import useSession hook

interface AvatarUploadFormProps {
  user: UserType;
}

const AvatarUploadForm = ({ user }: AvatarUploadFormProps) => {
  const t = useI18n();
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data: session, update: updateSession } = useSession(); // Add session hook

  const mutation = useMutation({
    mutationFn: async () => {
      if (!avatar) return null;
      return await updateUserAvatar({ id: user.id, avatar });
    },
    onSuccess: (data) => {
      // Extract the updated avatar URL from the response if available
      const updatedAvatarUrl = data?.avatar || preview;
      
      toast.success(t("common.success"), {
        description: t("student.profile.avatarUpdated"),
      });
      
      // Invalidate queries to refetch user data
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
      
      // Update the session with the new avatar URL
      if (updatedAvatarUrl && session) {
        updateSession({
          ...session,
          user: {
            ...session.user,
            avatar: updatedAvatarUrl,
          },
        });
      }
      
      // Reset the preview
      setPreview(null);
      setAvatar(null);
    },
    onError: (error) => {
      toast.error(t("common.error"), {
        description: t("student.profile.avatarUpdateFailed"),
      });
      console.error("Error updating avatar:", error);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (avatar) {
      mutation.mutate();
    }
  };

  return (
    <Card className="p-4 max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage 
              src={preview || user?.avatar || undefined} 
              alt={user?.first_name || "User"} 
            />
            <AvatarFallback>
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("avatar-upload")?.click()}
            >
              <UploadCloud className="h-4 w-4 mr-2" />
              {t("student.profile.selectImage")}
            </Button>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">
              {t("student.profile.imageRequirements")}
            </p>
          </div>
        </div>

        {preview && (
          <div className="flex justify-end">
            <Button 
              type="submit"
              disabled={mutation.isPending}
              className="mt-2"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("common.uploading")}
                </>
              ) : (
                t("common.save")
              )}
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
};

export default AvatarUploadForm;
