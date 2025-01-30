"use client";
import { getChapter, getTopic, listTopics, updateTopic, deleteTopic } from "@/actions/courses";
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
  Trash2
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

interface SortableTopicProps {
  topic: TopicType;
  onEdit: (topic: TopicType) => void;
  onDelete: (topicId: number) => void;
  onView: (topicId: number) => void;
}

function SortableTopic({ topic, onEdit, onDelete, onView }: SortableTopicProps) {
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Topic</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this topic? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(topic.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
  const { id, subjectId, chapterId } = useParams<{
    id: string;
    subjectId: string;
    chapterId: string;
  }>();
  const { onAdd, setTopic } = useTopicStore();
  const [topics, setTopics] = useState<TopicType[]>([]);
  const queryClient = useQueryClient();

  const { isLoading, data: chapterData, isError, error } = useQuery({
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
      classId:id,
      chapterId:chapterId
    });
  };

  const handleDelete = (topicId: number) => {
    // deleteTopicMutation.mutate(topicId);
  };

  const handleView = (topicId: number) => {
    router.push(`/admin/classes/${id}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}`);
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
    <div className="container py-10 flex flex-col gap-5">
      <div className="grid 2xl:grid-cols-12 gap-5">
        <div className="col-span-3">
          <div>
            <Link
              className="flex items-center gap-1"
              href={`/admin/classes/${id}/subjects/${subjectId}/chapters`}
            >
              <BackButton />
            </Link>
          </div>
          <h1 className="text-3xl font-medium">Chapter</h1>
          <div>
            {chapterData && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-medium">{chapterData?.title}</h2>
                <p className="text-muted-foreground text-sm">
                  {chapterData?.description}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-9">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-medium">Topics</h1>
            <Button
              onClick={() =>
                onAdd({
                  chapterId,
                  subjectId,
                  classId: id,
                })
              }
            >
              Ajouter une lecon
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
                      onDelete={()=>handleDelete(topic.id)}
                      onView={()=>handleView(topic.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChapterDetail;

// "use client";
// import { getChapter, getTopic, listTopics } from "@/actions/courses";
// import BackButton from "@/components/BackButton";
// import { Button } from "@/components/ui/button";
// import { useTopicStore } from "@/hooks/topic-store";
// import { useQuery } from "@tanstack/react-query";
// import { Loader } from "lucide-react";
// import Link from "next/link";
// import { useParams } from "next/navigation";
// import React from "react";

// function ChapterDetail() {
//   const { id, subjectId, chapterId } = useParams<{
//     id: string;
//     subjectId: string;
//     chapterId: string;
//   }>();
//   const { onAdd } = useTopicStore();
//   const { isLoading, data, isError, error } = useQuery({
//     queryKey: ["class", id, "subjects", subjectId, "chapters", chapterId],
//     queryFn: () =>
//       getChapter({
//         class_pk: id,
//         subject_pk: subjectId,
//         chapter_pk: chapterId,
//       }),
//   });

//   const topicQuery = useQuery({
//     queryKey: [
//       "class",
//       id,
//       "subjects",
//       subjectId,
//       "chapters",
//       chapterId,
//       "topics",
//     ],
//     queryFn: () =>
//       listTopics({
//         class_pk: id,
//         subject_pk: subjectId,
//         chapter_pk: chapterId,
//       }),
//   });

//   if (isLoading) {
//     return (
//       <div className="container flex justify-center items-center h-screen">
//         <Loader className="animate-spin size-8" />
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="container flex justify-center items-center h-screen">
//         <div
//           className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
//           role="alert"
//         >
//           <strong className="font-bold">Error: </strong>
//           <span className="block sm:inline">{error.message}</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container py-10 flex flex-col gap-5">
//       <div className="grid 2xl:grid-cols-12 gap-5">
//         <div className="col-span-3">
//           <div>
//             <Link
//               className="flex items-center gap-1"
//               href={`/admin/classes/${id}/subjects/${subjectId}/chapters`}
//             >
//               <BackButton />
//             </Link>
//           </div>
//           <h1 className="text-3xl font-medium">Chapter</h1>
//           <div>
//             {data && (
//               <div className="flex flex-col gap-4">
//                 <h2 className="text-lg font-medium">{data?.title}</h2>
//                 <p className="text-muted-foreground text-sm">
//                   {data?.description}
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//         <div className="col-span-9">
//           <div className="flex items-center justify-between mb-6">
//             <h1 className="text-3xl font-medium">Topics</h1>
//             <Button
//               onClick={() =>
//                 onAdd({
//                   chapterId,
//                   subjectId,
//                   classId: id,
//                 })
//               }
//             >
//               Ajouter une lecon
//             </Button>
//           </div>
//           <div className="flex flex-col gap-4 w-full">
//             {topicQuery?.data?.map((topic,index)=>(
//                 <div key={index} className="w-full p-3 rounded-sm shadow-lg">
//                     <h1>{topic.title}</h1>
//                     <p>{topic.description}</p>
//                 </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ChapterDetail;
