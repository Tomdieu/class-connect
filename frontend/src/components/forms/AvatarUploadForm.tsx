"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { updateUserAvatar } from "@/actions/accounts";
import { UserType } from "@/types";
import { useI18n } from "@/locales/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UploadCloud, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

interface AvatarUploadFormProps {
  user: UserType;
}

const AvatarUploadForm = ({ user }: AvatarUploadFormProps) => {
  const t = useI18n();
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data: session, update: updateSession } = useSession();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!avatar) return null;
      return await updateUserAvatar({ id: user.id, avatar });
    },
    onSuccess: (data) => {
      const updatedAvatarUrl = data?.avatar || preview;
      
      toast.success(t("common.success"), {
        description: t("student.profile.avatarUpdated"),
      });
      
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
      
      if (updatedAvatarUrl && session) {
        updateSession({
          ...session,
          user: {
            ...session.user,
            avatar: updatedAvatarUrl,
          },
        });
      }
      
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-xl shadow-md p-4 max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="relative group">
            <Avatar className="w-20 h-20 border-2 border-primary/20">
              <AvatarImage 
                src={preview || user?.avatar || undefined} 
                alt={user?.first_name || "User"} 
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-foreground font-semibold">
                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div 
              className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => document.getElementById("avatar-upload")?.click()}
            >
              <Camera className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg border-primary/20 hover:bg-primary/10 transition-all"
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
          <motion.div 
            className="flex justify-end"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button 
              type="submit"
              disabled={mutation.isPending}
              className="mt-2 rounded-lg bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 transition-all"
              size="sm"
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
          </motion.div>
        )}
      </form>
    </motion.div>
  );
};

export default AvatarUploadForm;
