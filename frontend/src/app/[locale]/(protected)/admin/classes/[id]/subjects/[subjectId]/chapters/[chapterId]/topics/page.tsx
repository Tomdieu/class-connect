"use client";
import { getChapter, listTopics, deleteTopic, getClass, getSubject, updateTopic } from '@/actions/courses';
import { Button } from '@/components/ui/button';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { useTopicStore } from '@/hooks/topic-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TopicType } from '@/types';
import { useI18n } from '@/locales/client';
import { Eye, File, GripVertical, Loader, Pencil, Plus, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SortableTopicProps {
  topic: TopicType;
  onEdit: (topic: TopicType) => void;
  onDelete: (topicId: number) => void;
  onView: (topicId: number) => void;
}

function SortableTopic({
  topic,
  onEdit,
  onDelete,
  onView,
}: SortableTopicProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id });
  const t = useI18n();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "w-full p-4 rounded-sm shadow-lg bg-white relative",
        "hover:shadow-md transition-all duration-200",
        isDragging && "opacity-50 cursor-grabbing",
        !isDragging && "cursor-grab"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Topic Icon */}
        <div className="flex-shrink-0">
          <File className="h-5 w-5 text-blue-500" />
        </div>

        {/* Topic Content */}
        <div className="flex-grow">
          <h1 className="text-lg font-medium mb-2">{topic.title}</h1>
          {topic.description && (

          <p className="text-muted-foreground">{topic.description}</p>
          )}
          {/* <p className="text-sm text-muted-foreground mt-2">
            {t("topic.description")}: {topic.order}
          </p> */}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onView(topic.id)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Eye className="h-4 w-4 text-gray-500" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <span>{t("topic.viewTooltip")}</span>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onEdit(topic)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Pencil className="h-4 w-4 text-gray-500" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <span>{t("topic.editTooltip")}</span>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => onDelete(topic.id)} 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <span>{t("topic.deleteTooltip")}</span>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  {...attributes}
                  {...listeners}
                  className="p-1.5 hover:bg-gray-100 rounded-full cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <span>{t("topic.dragTooltip")}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

function TopicsPage() {
  const { id, subjectId, chapterId } = useParams<{ 
    id: string; 
    subjectId: string;
    chapterId: string;
  }>();
  const t = useI18n();
  const { onAdd, setTopic } = useTopicStore();
  const [topicToDelete, setTopicToDelete] = useState<TopicType | null>(null);
  const queryClient = useQueryClient();
  const [topics, setTopics] = useState<TopicType[]>([]);

  const classQuery = useQuery({
    queryKey: ["class", id],
    queryFn: () => getClass(id),
  });

  const subjectQuery = useQuery({
    queryKey: ["class", id, "subjects", subjectId],
    queryFn: () => getSubject({ class_pk: id, subject_pk: subjectId }),
  });

  // Fetch chapter details
  const chapterQuery = useQuery({
    queryKey: ["class", id, "subjects", subjectId, "chapters", chapterId],
    queryFn: () => getChapter({ 
      class_pk: id, 
      subject_pk: subjectId,
      chapter_pk: chapterId
    }),
  });

  // Fetch topics for this chapter
  const topicsQuery = useQuery({
    queryKey: ["chapter", chapterId, "topics"],
    queryFn: () => listTopics({ 
      class_pk: id, 
      subject_pk: subjectId, 
      chapter_pk: chapterId 
    }),
    enabled: !!chapterQuery.data,
  });

  // Delete topic mutation
  const deleteTopicMutation = useMutation({
    mutationFn: deleteTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapter", chapterId, "topics"] });
      toast.success(t("topic.delete.success"));
      setTopicToDelete(null);
    },
    onError: (error) => {
      toast.error(t("topic.delete.error"), {
        description: error.message,
      });
    },
  });

  // Update topic mutation for reordering
  const updateTopicMutation = useMutation({
    mutationFn: ({ topic_pk, body }: { topic_pk: string; body: any }) =>
      updateTopic({
        class_pk: id,
        subject_pk: subjectId,
        chapter_pk: chapterId,
        topic_pk,
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["chapter", chapterId, "topics"] 
      });
    },
  });

  // Update local topics state when query data changes
  useEffect(() => {
    if (topicsQuery.data) {
      setTopics(topicsQuery.data);
    }
  }, [topicsQuery.data]);

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDeleteTopic = (topic: TopicType) => {
    setTopicToDelete(topic);
  };

  const handleConfirmDelete = () => {
    if (topicToDelete) {
      deleteTopicMutation.mutate({
        class_pk: id,
        subject_pk: subjectId,
        chapter_pk: chapterId,
        topic_pk: topicToDelete.id.toString(),
      });
    }
  };

  const handleEditTopic = (topic: TopicType) => {
    setTopic({ topic, classId: id, subjectId, chapterId });
  };

  const handleViewTopic = (topicId: number) => {
    window.location.href = `/admin/classes/${id}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}`;
  };

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTopics((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const updatedTopics = arrayMove(items, oldIndex, newIndex);

        updatedTopics.forEach((topic, index) => {
          if (topic.order !== index + 1) {
            updateTopicMutation.mutate({
              topic_pk: topic.id.toString(),
              body: { order: index + 1 },
            });
          }
        });

        return updatedTopics.map((topic, index) => ({
          ...topic,
          order: index + 1,
        }));
      });
    }
  }

  // Show loading state
  if (chapterQuery.isLoading || topicsQuery.isLoading) {
    return (
      <div className="container flex justify-center items-center h-screen">
        <Loader className="animate-spin size-8" />
      </div>
    );
  }

  // Show error state
  if (chapterQuery.isError) {
    return (
      <div className="container flex justify-center items-center h-screen">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">{t("error")}: </strong>
          <span className="block sm:inline">{chapterQuery.error.message}</span>
        </div>
      </div>
    );
  }

  if (topicsQuery.isError) {
    return (
      <div className="container flex justify-center items-center h-screen">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">{t("error")}: </strong>
          <span className="block sm:inline">{topicsQuery.error.message}</span>
        </div>
      </div>
    );
  }

  const chapter = chapterQuery.data;

  return (
    <>
      <div className="container py-10 flex flex-col gap-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/classes/">Classes</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/admin/classes/${id}/subjects`}>
               {classQuery.data?.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/admin/classes/${id}/subjects/${subjectId}/chapters`}>
                {subjectQuery.data?.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{chapter?.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid 2xl:grid-cols-12 gap-5">
          <div className="col-span-3">
            <div className="flex flex-col gap-4">
              <div>
                <Link
                  className="flex items-center gap-1"
                  href={`/admin/classes/${id}/subjects/${subjectId}/chapters`}
                >
                  <Button variant="outline">&larr; Back</Button>
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-medium">{t("topic.title")}</h1>
                {chapter && (
                  <>
                    <div className="flex flex-col gap-2">
                      <h2 className="text-lg font-medium">{chapter?.title}</h2>
                      <p className="text-muted-foreground text-sm">
                        {chapter?.description}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-9">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-medium">{t("topic.title")}</h1>
              <Button
                onClick={() => chapter && onAdd({ classId: id, subjectId, chapterId })}
              >
                <Plus className="size-4 mr-2" />
                {t("topic.add")}
              </Button>
            </div>

            <div className="flex flex-col gap-4 w-full">
              {topics && topics.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={topics}
                    strategy={verticalListSortingStrategy}
                  >
                    {topics.map((topic) => (
                      <SortableTopic
                        key={topic.id}
                        topic={topic}
                        onEdit={handleEditTopic}
                        onDelete={handleDeleteTopic}
                        onView={handleViewTopic}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <File className="size-12 text-gray-300 mb-2" />
                  <h3 className="text-xl font-medium mb-1">{t("topic.empty")}</h3>
                  <p className="text-gray-500 mb-4">{t("topic.noTopics")}</p>
                  <Button onClick={() => chapter && onAdd({ classId: id, subjectId, chapterId })}>
                    <Plus className="size-4 mr-2" />
                    {t("topic.add")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={!!topicToDelete}
        onClose={() => setTopicToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t("topic.delete.title")}
        description={t("topic.delete.description")}
        isLoading={deleteTopicMutation.isPending}
      />
    </>
  );
}

export default TopicsPage;
