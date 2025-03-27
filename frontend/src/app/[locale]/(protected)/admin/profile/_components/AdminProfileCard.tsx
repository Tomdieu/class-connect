"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useI18n } from "@/locales/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserAvatar } from "@/actions/accounts";
import { Label } from "@/components/ui/label";

interface AdminProfileCardProps {
  userId: string;
  firstName: string;
  lastName: string;
  educationLevel: string;
  profilePicture: string;
  isStaff: boolean;
  isSuperuser: boolean;
}

export default function AdminProfileCard({ 
  userId, 
  firstName, 
  lastName,
  educationLevel,
  profilePicture,
  isStaff,
  isSuperuser 
}: AdminProfileCardProps) {
  const t = useI18n();
  const { update, data: session } = useSession();
  const queryClient = useQueryClient();
  
  // Avatar upload state
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Mutation for uploading avatar
  const mutation = useMutation({
    mutationFn: async () => {
      if (!avatar) return null;
      return await updateUserAvatar({ id: userId, avatar });
    },
    onSuccess: (data) => {
      const updatedAvatarUrl = data?.avatar || preview;
      toast.success(t("common.success"), { description: t("student.profile.avatarUpdated") });
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
      
      if (updatedAvatarUrl && session) {
        update({
          ...session,
          user: { ...session.user, avatar: updatedAvatarUrl }
        });
      }
      setAvatar(null);
      setPreview(null);
    },
    onError: (error) => {
      toast.error(t("common.error"), { description: t("student.profile.avatarUpdateFailed") });
      console.error("Error updating avatar:", error);
    }
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

  const handleAvatarSave = () => {
    if (avatar) mutation.mutate();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Profile Image with Upload */}
      <div className="mb-6 relative">
        <div className="mx-auto">
          <Avatar className="w-32 h-32">
            {preview || profilePicture ? (
              <AvatarImage 
                src={preview || profilePicture} 
                alt={`${firstName} ${lastName}`} 
              />
            ) : (
              <AvatarFallback>
                {firstName?.charAt(0)}
                {lastName?.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="avatar-upload"
          onChange={handleFileChange}
        />
        <div className="mt-4 flex flex-col items-center space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("avatar-upload")?.click()}
          >
            {t("profile.changePhoto")}
          </Button>
          {preview && (
            <Button
              type="button"
              onClick={handleAvatarSave}
              disabled={mutation.isPending}
              size="sm"
              className="w-full text-xs"
            >
              {mutation.isPending ? t("common.uploading") : t("common.save")}
            </Button>
          )}
        </div>
      </div>
      
      {/* User Info */}
      <div className="text-center mb-4">
        <h3 className="font-medium text-lg">{firstName} {lastName}</h3>
        <div className="flex flex-wrap justify-center gap-2 mt-1">
          {educationLevel && (
            <Badge variant="outline">
              {educationLevel}
            </Badge>
          )}
          {isStaff && (
            <Badge variant="secondary">
              Staff
            </Badge>
          )}
          {isSuperuser && (
            <Badge variant="default">
              Admin
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {t("profile.userIdLabel")}: {userId || "N/A"}
        </p>
      </div>
      
      <Separator className="my-4 w-full" />
      
      {/* Read-only Information */}
      <div className="w-full space-y-3 text-sm">
        <div>
          <Label htmlFor="lastName" className="text-xs text-muted-foreground">{t("student.profile.lastName")}</Label>
          <div className="font-medium">{lastName || t("common.notDefined")}</div>
        </div>
        
        <div>
          <Label htmlFor="firstName" className="text-xs text-muted-foreground">{t("student.profile.firstName")}</Label>
          <div className="font-medium">{firstName || t("common.notDefined")}</div>
        </div>
        
        <div>
          <Label htmlFor="educationLevel" className="text-xs text-muted-foreground">{t("student.profile.educationLevel")}</Label>
          <div className="font-medium">{educationLevel || t("common.notDefined")}</div>
        </div>

        <div>
          <Label htmlFor="permissions" className="text-xs text-muted-foreground">{t("admin.permissions")}</Label>
          <div className="font-medium">
            {isSuperuser 
              ? t("admin.isSuperuser") 
              : isStaff 
                ? t("admin.isStaff") 
                : t("common.notDefined")}
          </div>
        </div>
      </div>
    </div>
  );
}