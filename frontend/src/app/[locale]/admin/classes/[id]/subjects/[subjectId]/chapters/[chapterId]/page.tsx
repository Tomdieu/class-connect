"use client";
import {
  getChapter,
  getTopic,
  listTopics,
  updateTopic,
  deleteTopic,
  deleteChapter,
} from "@/actions/courses";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { useTopicStore } from "@/hooks/topic-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GripVertical,
  Loader,
  BookOpen,
  Pencil,
  Eye,
  Trash2,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TopicType } from "@/types";
import { useI18n } from "@/locales/client";
import { toast } from "sonner";
import { useDeleteConfirmationStore } from "@/hooks/delete-confirmation-store";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";

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
          <BookOpen className="h-5 w-5 text-blue-500" />
        </div>

        {/* Topic Content */}
        <div className="flex-grow">
          <h1 className="text-lg font-medium mb-2">{topic.title}</h1>
          <p className="text-muted-foreground">{topic.description}</p>
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
                <span>View topic</span>
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
                <span>Edit topic</span>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={()=>onDelete(topic.id)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <span>Delete topic</span>
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
                <span>Drag to reorder</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

function ChapterDetail() {
  const router = useRouter();
  const t = useI18n();
  const { id, subjectId, chapterId } = useParams<{
    id: string;
    subjectId: string;
    chapterId: string;
  }>();
  const { onAdd, setTopic } = useTopicStore();
  const [topics, setTopics] = useState<TopicType[]>([]);
  const queryClient = useQueryClient();
  const [deleteChapterModal, setDeleteChapterModal] = useState({
    isOpen: false,
    chapterId: null,
  });

  const [deleteTopicModal, setDeleteTopicModal] = useState({
    isOpen: false,
    topicId: null,
  });

  const {
    isLoading,
    data: chapterData,
    isError,
    error,
  } = useQuery({
    queryKey: ["class", id, "subjects", subjectId, "chapters", chapterId],
    queryFn: () =>
      getChapter({
        class_pk: id,
        subject_pk: subjectId,
        chapter_pk: chapterId,
      }),
  });

  const topicQuery = useQuery({
    queryKey: [
      "class",
      id,
      "subjects",
      subjectId,
      "chapters",
      chapterId,
      "topics",
    ],
    queryFn: () =>
      listTopics({
        class_pk: id,
        subject_pk: subjectId,
        chapter_pk: chapterId,
      }),
  });

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
        queryKey: [
          "class",
          id,
          "subjects",
          subjectId,
          "chapters",
          chapterId,
          "topics",
        ],
      });
    },
  });

  const deleteTopicMutation = useMutation({
    mutationFn: (topic_pk: string) =>
      deleteTopic({
        class_pk: id,
        subject_pk: subjectId,
        chapter_pk: chapterId,
        topic_pk,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "class",
          id,
          "subjects",
          subjectId,
          "chapters",
          chapterId,
          "topics",
        ],
      });
      toast.success("Topic deleted successfully");
    },
  });

  const deleteChapterMutation = useMutation({
    mutationFn: ({ class_pk, subject_pk, chapter_pk }: any) =>
      deleteChapter({ class_pk, subject_pk, chapter_pk }),
    onSuccess: () => {
      router.push(`/admin/classes/${id}/subjects/${subjectId}/chapters`);
      toast.success(t("chapter.delete.success"));
    },
    onError: (error) => {
      toast.error(t("chapter.delete.error"), {
        description: error.message,
      });
    },
  });

  useEffect(() => {
    if (topicQuery.data) {
      setTopics(topicQuery.data);
    }
  }, [topicQuery.data]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTopics((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const updatedTopics = arrayMove(items, oldIndex, newIndex);

        updatedTopics.forEach((topic, index) => {
          if (topic.order !== index + 1) {
            // updateTopicMutation.mutate({
            //   topic_pk: topic.id,
            //   body: { order: index + 1 },
            // });
          }
        });

        return updatedTopics.map((topic, index) => ({
          ...topic,
          order: index + 1,
        }));
      });
    }
  }

  const handleEdit = (topic: TopicType) => {
    setTopic({
      topic,
      subjectId: subjectId,
      classId: id,
      chapterId: chapterId,
    });
  };

  const handleDeleteTopic = (topicId: number) => {
    setDeleteTopicModal({ isOpen: true, topicId });
  };

  const handleView = (topicId: number) => {
    router.push(
      `/admin/classes/${id}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}`
    );
  };

  const handleDeleteChapter = () => {
    setDeleteChapterModal({ isOpen: true, chapterId });
  };

  const handleConfirmChapterDelete = () => {
    deleteChapterMutation.mutate({
      class_pk: id,
      subject_pk: subjectId,
      chapter_pk: chapterId,
    });
    setDeleteChapterModal({ isOpen: false, chapterId: null });
  };

  const handleConfirmTopicDelete = () => {
    if (deleteTopicModal.topicId) {
      deleteTopicMutation.mutate(deleteTopicModal.topicId.toString());
    }
    setDeleteTopicModal({ isOpen: false, topicId: null });
  };

  if (isLoading) {
    return (
      <div className="container flex justify-center items-center h-screen">
        <Loader className="animate-spin size-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container flex justify-center items-center h-screen">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error.message}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container py-10 flex flex-col gap-5">
        <div className="grid 2xl:grid-cols-12 gap-5">
          <div className="col-span-3">
            <div className="flex flex-col gap-4">
              <div>
                <Link
                  className="flex items-center gap-1"
                  href={`/admin/classes/${id}/subjects/${subjectId}/chapters`}
                >
                  <BackButton />
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-medium">{t("chapter.title")}</h1>
                {chapterData && (
                  <>
                    <div className="flex flex-col gap-2">
                      <h2 className="text-lg font-medium">
                        {chapterData?.title}
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        {chapterData?.description}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteChapter}
                      className="mt-2"
                    >
                      <Trash2 className="size-4 mr-2" />
                      {t("chapter.delete")}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-9">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-medium">{t("chapter.topics")}</h1>
              <Button
                onClick={() =>
                  onAdd({
                    chapterId,
                    subjectId,
                    classId: id,
                  })
                }
              >
                <Plus className="size-4 mr-2" />
                {t("chapter.addTopic")}
              </Button>
            </div>

            <div className="flex flex-col gap-4 w-full">
              {topics && topics.length > 0 && (
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
                        onEdit={handleEdit}
                        onDelete={handleDeleteTopic}
                        onView={handleView}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteChapterModal.isOpen}
        onClose={() =>
          setDeleteChapterModal({ isOpen: false, chapterId: null })
        }
        onConfirm={handleConfirmChapterDelete}
        title={t("chapter.delete.title")}
        description={t("chapter.delete.description")}
        isLoading={deleteChapterMutation.isPending}
      />

      <DeleteConfirmationModal
        isOpen={deleteTopicModal.isOpen}
        onClose={() => setDeleteTopicModal({ isOpen: false, topicId: null })}
        onConfirm={handleConfirmTopicDelete}
        title="Delete Topic"
        description="Are you sure you want to delete this topic? This action cannot be undone."
        isLoading={deleteTopicMutation.isPending}
      />
    </>
  );
}

export default ChapterDetail;
