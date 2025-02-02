"use client";
import { getTopic, listResources } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AbstractResourceType, ResourceType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  Loader,
  Video,
  FileQuestion,
  FileText,
  FileCode,
  GraduationCap,
  Plus,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

const getResourceIcon = (type: AbstractResourceType["resource_type"]) => {
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

const ResourceCard = ({ resource }: { resource: AbstractResourceType }) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="flex flex-row items-center gap-4">
        {getResourceIcon(resource.resource_type)}
        <div>
          <CardTitle className="text-lg font-semibold">
            {resource.title}
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            {resource.resource_type.replace("Resource", "")}
          </CardDescription>
        </div>
      </CardHeader>
      {resource.description && (
        <CardContent>
          <p className="text-sm text-gray-600">{resource.description}</p>
        </CardContent>
      )}
    </Card>
  );
};

function TopicDetailPage() {
  const { id, subjectId, chapterId, topicId } = useParams<{
    id: string;
    subjectId: string;
    chapterId: string;
    topicId: string;
  }>();

  const { data, isError, error, isLoading } = useQuery({
    queryKey: [
      "class",
      id,
      "subjects",
      subjectId,
      "chapters",
      chapterId,
      "topics",
      topicId,
      "resources",
    ],
    queryFn: () =>
      listResources({
        chapter_pk: chapterId,
        class_pk: id,
        subject_pk: subjectId,
        topic_pk: topicId,
      }),
  });


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        <strong>Error: </strong>
        {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Resources</h2>
        <div>
          <Button
            className="flex items-center gap-2"
            onClick={() => { }
            }
          >
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger className="hover:shadow-lg rounded-full p-1">
              <div className="flex items-center gap-1 text-muted-foreground select-none">
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add Resource</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map(({ resource }: ResourceType) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}

export default TopicDetailPage;
