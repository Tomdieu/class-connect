import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Video,
  FileQuestion,
  FileText,
  FileCode,
  GraduationCap,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AbstractResourceType } from "@/types";

export type ResourceType =
  | "VideoResource"
  | "QuizResource"
  | "RevisionResource"
  | "PDFResource"
  | "ExerciseResource";


export interface ResourceCardProps {
  className?: string;
  resource: AbstractResourceType;
  onView?: (resource: AbstractResourceType) => void;
  onUpdate?: (resource: AbstractResourceType) => void;
  onDelete?: (resource: AbstractResourceType) => void;
}
const getResourceIcon = (type: ResourceType) => {
  switch (type) {
    case "VideoResource":
      return <Video className="h-6 w-6 text-blue-500" />;
    case "QuizResource":
      return <FileQuestion className="h-6 w-6 text-purple-500" />;
    case "RevisionResource":
      return <GraduationCap className="h-6 w-6 text-green-500" />;
    case "PDFResource":
      return <FileText className="h-6 w-6 text-red-500" />;
    case "ExerciseResource":
      return <FileCode className="h-6 w-6 text-orange-500" />;
    default:
      return null;
  }
};

const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onView,
  onUpdate,
  onDelete,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView?.(resource);
  };

  const handleUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate?.(resource);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(resource);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn("relative group h-full flex", className)}
    >
      <Card
        className={cn(
          "transition-all duration-200",
          "bg-white border rounded-lg",
          "group-hover:shadow-lg",
          "w-full flex flex-col"
        )}
      >
        <CardHeader className="flex flex-row items-center gap-4 p-4 flex-shrink-0">
          {getResourceIcon(resource.resource_type)}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">
              {resource.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {resource.resource_type.replace("Resource", "")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-1"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleView}
                className="h-8 w-8 p-0 hover:bg-gray-100"
                title="View"
              >
                <Eye className="h-4 w-4 text-gray-600 hover:text-gray-900" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUpdate}
                className="h-8 w-8 p-0 hover:bg-gray-100"
                title="Edit"
              >
                <Pencil className="h-4 w-4 text-gray-600 hover:text-gray-900" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 hover:bg-gray-100"
                title="Delete"
              >
                <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
              </Button>
            </motion.div>
          </div>
        </CardHeader>
        {resource.description && (
          <CardContent className="px-4 pb-4 pt-0">
            <p className="text-sm text-gray-600 line-clamp-2">
              {resource.description}
            </p>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};

export default ResourceCard;
