"use client";

import { createPost, listForums, addPostComments } from "@/actions/forum";
import { useEffect, useState } from "react";
import { ForumType, CreatePostRequestType } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileImage, Paperclip, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/locales/client";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import api from "@/services/api";
import { useSession } from "next-auth/react";
import { z } from "zod";

interface CreatePostProps {
  onPostCreated?: () => void;
  parentId?: number;
  forumId?: number;
  placeholder?: string;
  onClose?(): void;
}

// Max file size constants (in bytes)
const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB for images
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB for files

// Validation schema using Zod
const createPostSchema = z.object({
  content: z.string().min(1, "Content is required"),
  forum: z.number().positive("Forum is required"),
  image: z.custom<File>()
    .refine(file => !file || file.size <= MAX_IMAGE_SIZE, 
      `Image file size must be less than 8MB`)
    .optional()
    .nullable(),
  file: z.custom<File>()
    .refine(file => !file || file.size <= MAX_FILE_SIZE, 
      `File size must be less than 100MB`)
    .optional()
    .nullable(),
});

export default function CreatePost({
  onPostCreated,
  parentId,
  forumId,
  placeholder,
  onClose,
}: CreatePostProps) {
  const t = useI18n();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [forums, setForums] = useState<ForumType[]>([]);
  const [selectedForum, setSelectedForum] = useState<number | null>(
    forumId || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isComment, setIsComment] = useState(!!parentId);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const { data: session } = useSession();
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Validation function
  const validatePostData = (data: {
    content: string;
    forum: number | null;
    image: File | null;
    file: File | null;
  }): boolean => {
    // Reset previous errors
    setValidationErrors({});
    
    try {
      // Validate using Zod schema
      createPostSchema.parse({
        content: data.content,
        forum: data.forum || 0,
        image: data.image,
        file: data.file,
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format errors into a user-friendly object
        const errors: {[key: string]: string} = {};
        error.errors.forEach((err) => {
          if (err.path) {
            errors[err.path[0]] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  useEffect(() => {
    // Only fetch forums if we're creating a top-level post
    if (!parentId && !forumId) {
      const loadForums = async () => {
        try {
          const data = await listForums();
          setForums(data);

          // Auto-select the first forum if available
          if (data.length > 0 && !selectedForum) {
            setSelectedForum(data[0].id);
          }
        } catch (error) {
          console.error("Error loading forums:", error);
        }
      };

      loadForums();
    }
  }, [parentId, forumId, selectedForum]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file size before setting
      if (selectedFile.size > MAX_IMAGE_SIZE) {
        toast.error("Image Too Large", {
          description: `The image exceeds the maximum size of 8MB. Please select a smaller image.`,
        });
        e.target.value = ''; // Reset the input
        return;
      }
      
      setImage(selectedFile);
      setValidationErrors((prev) => ({...prev, image: undefined})); // Clear any previous error
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(selectedFile);
      setImagePreview(previewUrl);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file size before setting
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error("File Too Large", {
          description: `The file exceeds the maximum size of 100MB. Please select a smaller file.`,
        });
        e.target.value = ''; // Reset the input
        return;
      }
      
      setFile(selectedFile);
      setValidationErrors((prev) => ({...prev, file: undefined})); // Clear any previous error
    }
  };

  const clearImage = () => {
    setImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  const handleSubmit = async () => {
    const activeForumId = forumId || selectedForum;
    
    // Validate the form data
    const isValid = validatePostData({
      content,
      forum: activeForumId,
      image,
      file,
    });
    
    if (!isValid) {
      // Display validation errors
      if (validationErrors.content) {
        toast.error("Content Required", {
          description: "Please enter some content for your post."
        });
      }
      if (validationErrors.forum) {
        toast.error("Forum Required", {
          description: "Please select a forum for your post."
        });
      }
      return;
    }

    // If we have no content and no attachments, don't submit
    if (!content.trim() && !image && !file) {
      toast.error("Empty Post", {
        description: "Please add some content, image, or file to your post."
      });
      return;
    }

    setIsSubmitting(true);
    setShowProgress(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append("forum", activeForumId?.toString() || "0");
      formData.append("content", content);
      
      if (image) {
        formData.append("image", image);
      }
      
      if (file) {
        formData.append("file", file);
      }

      if (parentId) {
        // If this is a comment, use API directly with upload progress
        const response = await api.post(`/api/posts/${parentId}/comment/`, formData, {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total!
            );
            setUploadProgress(percentCompleted);
          },
        });

        // Invalidate the specific post's comments query to refresh the comments list
        queryClient.invalidateQueries({ queryKey: ["postComments", parentId] });
      } else {
        // If this is a new post, use API directly with upload progress
        const response = await api.post(`/api/posts/`, formData, {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total!
            );
            setUploadProgress(percentCompleted);
          },
        });
      }

      // Set progress to 100% when complete
      setUploadProgress(100);
      
      // Short delay to show completed progress
      setTimeout(() => {
        // Clear the form
        setContent("");
        clearImage();
        clearFile();
        setShowProgress(false);
        
        // Always invalidate the main forum feed to reflect the changes
        queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
        
        // Trigger parent component callback if provided
        if (onPostCreated) {
          onPostCreated();
        }
      }, 500);

      toast.success(
        parentId ? t("forum.commentCreated") : t("forum.postCreated"),
        {
          description: parentId
            ? t("forum.commentCreatedSuccess")
            : t("forum.postCreatedSuccess"),
        }
      );
    } catch (error: any) {
      setShowProgress(false);
      
      // Check for file size error from server
      if (error.message && error.message.includes("Body exceeded")) {
        toast.error("File Too Large", {
          description: "The file exceeds the maximum size limit. Please select a smaller file.",
        });
      } else {
        console.error(
          parentId ? "Error creating comment:" : "Error creating post:",
          error
        );
        toast.error(t("forum.error"), {
          description: parentId
            ? t("forum.commentCreationFailed")
            : t("forum.postCreationFailed"),
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-4 ${
        isComment ? "border border-gray-100" : ""
      }`}
    >
      {!parentId && !forumId && (
        <div className="mb-4">
          <Select
            value={selectedForum?.toString()}
            onValueChange={(value) => {
              setSelectedForum(parseInt(value));
              setValidationErrors((prev) => ({...prev, forum: undefined}));
            }}
          >
            <SelectTrigger className={`w-full ${validationErrors.forum ? 'border-red-500' : ''}`}>
              <SelectValue placeholder={t("forum.selectForum")} />
            </SelectTrigger>
            <SelectContent>
              {forums.map((forum) => (
                <SelectItem key={forum.id} value={forum.id.toString()}>
                  {forum.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.forum && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.forum}</p>
          )}
        </div>
      )}

      <Textarea
        placeholder={
          placeholder ||
          (parentId ? t("forum.writeComment") : t("forum.whatsOnYourMind"))
        }
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (e.target.value.trim()) {
            setValidationErrors((prev) => ({...prev, content: undefined}));
          }
        }}
        className={`min-h-[60px] focus:ring-0 border-none p-3 ${
          isComment ? "text-sm" : ""
        } ${validationErrors.content ? 'border-red-500' : ''}`}
      />
      {validationErrors.content && (
        <p className="text-sm text-red-500 mt-1">{validationErrors.content}</p>
      )}

      {imagePreview && (
        <div className="relative mt-3">
          <button
            onClick={clearImage}
            className="absolute -top-2 -right-2 bg-gray-200 rounded-full p-1 hover:bg-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
          <Image
            src={imagePreview || ""}
            alt="Preview"
            width={400}
            height={200}
            className="max-h-[200px] rounded-md object-contain"
            unoptimized // For blob URLs created with URL.createObjectURL
          />
          <p className="text-xs text-gray-400 mt-1">
            Size: {(image?.size ? (image.size / 1024 / 1024).toFixed(2) : 0)} MB / 8 MB
          </p>
        </div>
      )}

      {file && (
        <div className="flex items-center gap-2 mt-3 p-2 bg-gray-50 rounded-md">
          <Paperclip className="h-4 w-4 text-gray-500" />
          <span className="text-sm truncate">{file.name}</span>
          <span className="text-xs text-gray-400">
            {(file.size / 1024 / 1024).toFixed(2)} MB / 100 MB
          </span>
          <button
            onClick={clearFile}
            className="ml-auto bg-gray-200 rounded-full p-1 hover:bg-gray-300"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {showProgress && (
        <div className="mt-4">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            {uploadProgress < 100
              ? `${t("common.uploading")} ${uploadProgress}%`
              : t("common.success")}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex gap-2">
          <label className="cursor-pointer p-2 rounded-md hover:bg-gray-100">
            <FileImage className="h-5 w-5 text-blue-500" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isSubmitting}
            />
          </label>

          <label className="cursor-pointer p-2 rounded-md hover:bg-gray-100">
            <Paperclip className="h-5 w-5 text-green-500" />
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          {isComment && (
            <Button
              variant="outline"
              size="default"
              onClick={() => {
                if (onClose) {
                  onClose();
                }
              }}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`${isComment ? "py-1 px-3 h-8 text-sm" : ""}`}
          >
            {isSubmitting
              ? `${t("forum.posting")} ${uploadProgress > 0 ? `${uploadProgress}%` : ''}`
              : parentId
              ? t("forum.reply")
              : t("forum.post")}
          </Button>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-400 flex flex-col">
        <span>• {t("forum.contentRequired")}</span>
        <span>• {t("forum.maxFileSize", { image: "8MB", file: "100MB" })}</span>
      </div>
    </div>
  );
}
