"use client";
import { getSubject, listChapters, updateChapter, deleteChapter } from "@/actions/courses";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Eye,
  GripVertical,
  Loader,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import { useChapterStore } from "@/hooks/chapter-store";
import { cn } from "@/lib/utils";
import { ChapterType } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useI18n } from "@/locales/client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Animation variants for container and items
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

function SortableCard({
  chapter,
  classId,
  setChapter,
  onView,
  onDelete
}: {
  chapter: ChapterType;
  classId: string | number;
  setChapter: (chapter: ChapterType, classId: string | number) => void;
  onView?: (chapterId: number | string) => void;
  onDelete?: (chapterId: number | string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if the click is directly on the card, not on buttons
    if (!(e.target as HTMLElement).closest('button')) {
      onView && onView(chapter.id);
    }
  };

  return (
    <motion.div
      layout
      variants={itemVariants}
      whileHover={{ scale: 1.01 }}
    >
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          "relative border border-border/50 h-full bg-white/50 backdrop-blur-sm transition-all duration-200",
          isDragging 
            ? "opacity-50 cursor-grabbing shadow-lg ring-2 ring-primary/20" 
            : "cursor-pointer shadow-sm hover:shadow-md hover:border-primary/20"
        )}
        onClick={handleCardClick}
      >
        <div
          {...attributes}
          {...listeners}
          className="absolute top-3 right-3 cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-muted/50 transition-colors"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-primary">
                <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
              </svg>
            </div>
            <CardTitle className="pr-8 text-base font-medium">{chapter.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          {chapter.description && (
            <CardDescription className="line-clamp-2 text-sm pl-9">
              {chapter.description}
            </CardDescription>
          )}
        </CardContent>
        <CardFooter className="pt-2 border-t bg-muted/5 flex justify-end">
          <div className="flex gap-2 w-full justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={(e) => {
                    e.stopPropagation();
                    onView && onView(chapter.id);
                  }} size="sm" variant="ghost" className="h-8 w-8 rounded-full">
                    <Eye size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span>View Topics</span>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setChapter(chapter, classId);
                    }}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 rounded-full"
                  >
                    <Pencil size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span>Edit</span>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete && onDelete(chapter.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span>Delete</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

function SubjectChapters() {
  const { id, subjectId } = useParams<{ id: string; subjectId: string }>();
  const { setChapter, onAdd } = useChapterStore();
  const [chapters, setChapters] = useState<ChapterType[]>([]);
  const t = useI18n();

  const queryClient = useQueryClient();
  const router = useRouter();

  const subjectQuery = useQuery({
    queryKey: ["class", id, "subjects", subjectId],
    queryFn: () => getSubject({ class_pk: id, subject_pk: subjectId }),
  });

  const { data, isError, error, isLoading } = useQuery({
    queryKey: ["class", id, "subjects", subjectId, "chapters"],
    queryFn: () => listChapters({ class_pk: id, subject_pk: subjectId }),
  });

  const updateChapterMutation = useMutation({
    mutationFn: updateChapter,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["class", id, "subjects", subjectId, "chapters"],
      });
    },
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    chapterId: null as number | null,
  });
  
  const deleteChapterMutation = useMutation({
    mutationFn: deleteChapter,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["class", id, "subjects", subjectId, "chapters"],
      });
      toast.success(t("chapter.delete.success"));
    },
    onError: () => {
      toast.error(t("chapter.delete.error"));
    }
  });

  const handleDelete = (chapterId: number) => {
    setDeleteModal({ isOpen: true, chapterId });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.chapterId) {
      deleteChapterMutation.mutate({
        class_pk: id,
        subject_pk: subjectId,
        chapter_pk: deleteModal.chapterId.toString(),
      });
    }
    setDeleteModal({ isOpen: false, chapterId: null });
  };

  useEffect(() => {
    if (data) {
      setChapters(data);
    }
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setChapters((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        // Optimistically update the UI
        const updatedChapters = arrayMove(items, oldIndex, newIndex);

        // Trigger updates for the new order
        updatedChapters.forEach((chapter, index) => {
          // Only update the chapters that have changed position
          if (chapter.order !== index + 1) {
            updateChapterMutation.mutate({
              class_pk: id,
              subject_pk: subjectId,
              chapter_pk: chapter.id,
              body: { order: index + 1 },
            });
          }
        });

        return updatedChapters.map((chapter, index) => ({
          ...chapter,
          order: index + 1,
        }));
      });
    }
  }

  const navigateToChapter = (chapterId: number | string) => {
    router.push(`/admin/classes/${id}/subjects/${subjectId}/chapters/${chapterId}`);
  };

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container flex justify-center items-center min-h-[60vh]"
      >
        <div className="flex flex-col items-center gap-2">
          <Loader className="animate-spin size-8 text-primary" />
          <p className="text-muted-foreground text-sm">{t("loading")}</p>
        </div>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container flex justify-center items-center min-h-[60vh]"
      >
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm max-w-lg"
          role="alert"
        >
          <strong className="font-bold">{t("common.error")}: </strong>
          <span className="block sm:inline">{error.message}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <div className="container py-10 flex flex-col gap-5">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">{t("breadcrumb.dashboard")}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/classes">{t("breadcrumb.class")}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/admin/classes/${id}`}>{subjectQuery.data?.class_name}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{subjectQuery.data?.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>

        <div className="grid 2xl:grid-cols-12 gap-5">
          <div className="col-span-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div>
                <Link
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-4"
                  href={`/admin/classes/${id}/subjects/${subjectId}/`}
                >
                  <BackButton />
                </Link>
              </div>
              <h1 className="text-2xl font-medium text-primary mb-4">
                {t("chapter.title")}
              </h1>
              <div>
                {subjectQuery.data && (
                  <motion.div 
                    className="relative overflow-hidden bg-gradient-to-br from-card to-background border rounded-xl p-6 shadow-md"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ 
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      y: -3,
                      transition: { duration: 0.2 }
                    }}
                  >
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-24 h-24 opacity-5 transform translate-x-8 -translate-y-8">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                        <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
                      </svg>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      {/* Subject icon and name */}
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2.5 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-primary">
                            <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
                          </svg>
                        </div>
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                          {subjectQuery.data?.name}
                        </h2>
                      </div>
                      
                      {/* Subject info */}
                      <div className="pl-12 flex flex-col gap-2">
                        {subjectQuery.data?.description ? (
                          <p className="text-muted-foreground text-sm">
                            {subjectQuery.data?.description}
                          </p>
                        ) : (
                          <p className="text-muted-foreground/70 italic text-sm">
                            {t("class.noDescription")}
                          </p>
                        )}
                        
                        {/* Chapters count */}
                        <div className="mt-2 pt-2 border-t border-border/40 flex justify-between">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clipRule="evenodd" />
                              <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zm9.586 4.089a.75.75 0 00-1.172-.936l-2.25 2.25a.75.75 0 000 1.064l2.25 2.25a.75.75 0 101.172-.936l-1.289-1.29h3.328a.75.75 0 000-1.5h-3.328l1.289-1.29z" clipRule="evenodd" />
                            </svg>
                            {t("class.detail.class")}:
                          </span>
                          <span className="font-medium text-sm">
                            {subjectQuery.data?.class_name}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
                            </svg>
                            {t("chapter.topics")}:
                          </span>
                          <span className="font-medium text-sm">
                            {chapters?.length || 0}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action button */}
                      <motion.div 
                        className="mt-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          onClick={() => onAdd(id, subjectId)} 
                          className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white"
                        >
                          <Plus size={16} className="mr-1" />
                          {t("chapter.add")}
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
          <div className="col-span-9">
            <motion.div 
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-primary">
                    <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-medium bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {t("chapter.topics")}
                </h1>
              </div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button 
                  onClick={() => onAdd(id, subjectId)}
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 shadow-sm flex gap-1 items-center"
                >
                  <Plus size={18} />
                  {t("chapter.add")}
                </Button>
              </motion.div>
            </motion.div>

            {chapters && (
              chapters.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={chapters} strategy={rectSortingStrategy}>
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-5"
                    >
                      <AnimatePresence>
                        {chapters.map((chapter) => (
                          <SortableCard
                            key={chapter.id}
                            chapter={chapter}
                            classId={id}
                            setChapter={setChapter}
                            onDelete={handleDelete}
                            onView={navigateToChapter}
                          />
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  </SortableContext>
                </DndContext>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center py-16 bg-muted/10 rounded-lg border border-dashed"
                >
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.5 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    <ArrowLeft className="size-12 mx-auto mb-3 text-muted-foreground" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">{t("chapter.noChapters")}</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    {t("chapter.empty")}
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button 
                      onClick={() => onAdd(id, subjectId)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="size-4 mr-2" />
                      {t("chapter.add")}
                    </Button>
                  </motion.div>
                </motion.div>
              )
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, chapterId: null })}
        onConfirm={handleConfirmDelete}
        title={t("chapter.delete.title")}
        description={t("chapter.delete.description")}
        isLoading={deleteChapterMutation.isPending}
      />
    </>
  );
}

export default SubjectChapters;