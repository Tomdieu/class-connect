"use client";
import { getSubject, listChapters, updateChapter } from "@/actions/courses";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Eye,
  GripVertical,
  Loader,
  Pencil,
  Trash2,
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


function SortableCard({
    chapter,
    classId,
    setChapter,
  }: {
    chapter: ChapterType;
    classId: string | number;
    setChapter: (chapter: ChapterType, classId: string | number) => void;
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
  
    return (
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          "relative",
          isDragging && "opacity-50 cursor-grabbing",
          !isDragging && "cursor-grab"
        )}
      >
        <div
          {...attributes}
          {...listeners}
          className="absolute top-3 right-3 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardHeader>
          <CardTitle>{chapter.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{chapter.description}</CardDescription>
        </CardContent>
        <CardFooter>
          <div className="flex justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="outline" className="mr-2">
                    <Eye size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span>View</span>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setChapter(chapter, classId)}
                    size="icon"
                    className="mr-2"
                  >
                    <Pencil size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span>Edit</span>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="destructive">
                    <Trash2 size={20} />
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
    );
  }

function SubjectChapters() {
  const { id, subjectId } = useParams<{ id: string; subjectId: string }>();
  const { setChapter, onAdd } = useChapterStore();
  const [chapters, setChapters] = useState<ChapterType[]>([]);

  const queryClient = useQueryClient();

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
      // Refetch the chapters list after a successful update
      queryClient.invalidateQueries({
        queryKey: ["class", id, "subjects", subjectId, "chapters"],
      });
    },
  });

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
              href={`/admin/classes/${id}/subjects/${subjectId}/`}
            >
              <BackButton />
            </Link>
          </div>
          <h1 className="text-3xl font-medium">Subject</h1>
          <div>
            {subjectQuery.data && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-medium">
                  {subjectQuery.data?.name}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {subjectQuery.data?.description}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-9">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-medium">Chapters</h1>
            <Button onClick={() => onAdd(id, subjectId)}>
              Ajouter un chapitre
            </Button>
          </div>

          {chapters && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={chapters} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                  {chapters.map((chapter) => (
                    <SortableCard
                      key={chapter.id}
                      chapter={chapter}
                      classId={id}
                      setChapter={setChapter}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubjectChapters;

// "use client";
// import { getSubject, listChapters } from "@/actions/courses";
// import { useQuery } from "@tanstack/react-query";
// import { useParams } from "next/navigation";
// import React, { useEffect, useState } from "react";
// import {
//   ArrowLeft,
//   Eye,
//   GripVertical,
//   Loader,
//   Pencil,
//   Trash2,
// } from "lucide-react";
// import {
//   DndContext,
//   closestCenter,
//   KeyboardSensor,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   DragEndEvent,
// } from "@dnd-kit/core";
// import {
//   arrayMove,
//   SortableContext,
//   sortableKeyboardCoordinates,
//   useSortable,
//   rectSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import BackButton from "@/components/BackButton";
// import { useChapterStore } from "@/hooks/chapter-store";
// import { cn } from "@/lib/utils";
// import { ChapterType } from "@/types";

// // Sortable Card Component
// function SortableCard({
//   chapter,
//   classId,
//   setChapter,
// }: {
//   chapter: ChapterType;
//   classId: string | number;
//   setChapter: (chapter: ChapterType, classId: string | number) => void;
// }) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: chapter.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   return (
//     <Card
//       ref={setNodeRef}
//       style={style}
//       className={cn(
//         "relative",
//         isDragging && "opacity-50 cursor-grabbing",
//         !isDragging && "cursor-grab"
//       )}
//     >
//       <div
//         {...attributes}
//         {...listeners}
//         className="absolute top-3 right-3 cursor-grab active:cursor-grabbing"
//       >
//         <GripVertical className="h-5 w-5 text-muted-foreground" />
//       </div>
//       <CardHeader>
//         <CardTitle>{chapter.title}</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <CardDescription>{chapter.description}</CardDescription>
//       </CardContent>
//       <CardFooter>
//         <div className="flex justify-end">
//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button size="icon" variant="outline" className="mr-2">
//                   <Eye size={20} />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <span>View</span>
//               </TooltipContent>
//             </Tooltip>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   onClick={() => setChapter(chapter, classId)}
//                   size="icon"
//                   className="mr-2"
//                 >
//                   <Pencil size={20} />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <span>Edit</span>
//               </TooltipContent>
//             </Tooltip>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button size="icon" variant="destructive">
//                   <Trash2 size={20} />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <span>Delete</span>
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//         </div>
//       </CardFooter>
//     </Card>
//   );
// }

// function SubjectChapters() {
//   const { id, subjectId } = useParams<{ id: string; subjectId: string }>();
//   const { setChapter, onAdd } = useChapterStore();
//   const [chapters, setChapters] = useState<ChapterType[]>([]);

//   const subjectQuery = useQuery({
//     queryKey: ["class", id, "subjects", subjectId],
//     queryFn: () => getSubject({ class_pk: id, subject_pk: subjectId }),
//   });

//   const { data, isError, error, isLoading } = useQuery({
//     queryKey: ["class", id, "subjects", subjectId, "chapters"],
//     queryFn: () => listChapters({ class_pk: id, subject_pk: subjectId }),
//   });

//   useEffect(() => {
//     if (data) {
//       setChapters(data);
//     }
//   }, [data]);

//   const sensors = useSensors(
//     useSensor(PointerSensor),
//     useSensor(KeyboardSensor, {
//       coordinateGetter: sortableKeyboardCoordinates,
//     })
//   );

//   function handleDragEnd(event: DragEndEvent) {
//     const { active, over } = event;

//     if (active.id !== over?.id) {
//       setChapters((items) => {
//         const oldIndex = items.findIndex((item) => item.id === active.id);
//         const newIndex = items.findIndex((item) => item.id === over?.id);

//         // Here you would typically also make an API call to update the order in the backend
//         return arrayMove(items, oldIndex, newIndex);
//       });
//     }
//   }

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
//               href={`/admin/classes/${id}/subjects/${subjectId}/`}
//             >
//               <BackButton />
//             </Link>
//           </div>
//           <h1 className="text-3xl font-medium">Subject</h1>
//           <div>
//             {subjectQuery.data && (
//               <div className="flex flex-col gap-4">
//                 <h2 className="text-lg font-medium">
//                   {subjectQuery.data?.name}
//                 </h2>
//                 <p className="text-muted-foreground text-sm">
//                   {subjectQuery.data?.description}
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//         <div className="col-span-9">
//           <div className="flex items-center justify-between mb-6">
//             <h1 className="text-3xl font-medium">Chapters</h1>
//             <Button onClick={() => onAdd(id, subjectId)}>
//               Ajouter un chapitre
//             </Button>
//           </div>

//           {chapters && (
//             <DndContext
//               sensors={sensors}
//               collisionDetection={closestCenter}
//               onDragEnd={handleDragEnd}
//             >
//               <SortableContext items={chapters} strategy={rectSortingStrategy}>
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
//                   {chapters.map((chapter) => (
//                     <SortableCard
//                       key={chapter.id}
//                       chapter={chapter}
//                       classId={id}
//                       setChapter={setChapter}
//                     />
//                   ))}
//                 </div>
//               </SortableContext>
//             </DndContext>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SubjectChapters;

// "use client";
// import { getSubject, listChapters } from "@/actions/courses";
// import { useQuery } from "@tanstack/react-query";
// import { useParams } from "next/navigation";
// import React from "react";
// import { ArrowLeft, Eye, Loader, Pencil, Trash2 } from "lucide-react";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import BackButton from "@/components/BackButton";
// import { useChapterStore } from "@/hooks/chapter-store";

// function SubjectChapters() {
//   const { id, subjectId } = useParams<{ id: string; subjectId: string }>();
//   const { setChapter, onAdd } = useChapterStore();
//   const subjectQuery = useQuery({
//     queryKey: ["class", id, "subjects", subjectId],
//     queryFn: () => getSubject({ class_pk: id, subject_pk: subjectId }),
//   });
//   const { data, isError, error, isLoading } = useQuery({
//     queryKey: ["class", id, "subjects", subjectId, "chapters"],
//     queryFn: () => listChapters({ class_pk: id, subject_pk: subjectId }),
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
//           <strong className="font-bold">{t("error")}: </strong>
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
//               href={`/admin/classes/${id}/subjects/${subjectId}/`}
//             >
//               <BackButton />
//             </Link>
//           </div>
//           <h1 className="text-3xl font-medium">Subject</h1>
//           <div>
//             {subjectQuery.data && (
//               <div className="flex flex-col gap-4">
//                 <h2 className="text-lg font-medium">
//                   {subjectQuery.data?.name}
//                 </h2>
//                 <p className="text-muted-foreground text-sm">
//                   {subjectQuery.data?.description}
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//         <div className="col-span-9">
//           <div className="flex items-center justify-between">
//             <h1 className="text-3xl font-medium">Chapters</h1>
//             <Button onClick={() => onAdd(id, subjectId)}>
//               Ajouter un chapitre
//             </Button>
//           </div>

//           {data && (
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
//               {data?.map((chapter) => (
//                 <Card key={chapter.id}>
//                   <CardHeader>
//                     <CardTitle>{chapter.title}</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <CardDescription>{chapter.description}</CardDescription>
//                   </CardContent>
//                   <CardFooter>
//                     <div className="flex justify-end">
//                       <TooltipProvider>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <Button size="icon" variant={"outline"} className="mr-2">
//                               <Eye size={20} />
//                             </Button>
//                           </TooltipTrigger>
//                           <TooltipContent>
//                             <span>View</span>
//                           </TooltipContent>
//                         </Tooltip>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <Button onClick={()=>setChapter(chapter,id)} size="icon" className="mr-2">
//                               <Pencil size={20} />
//                             </Button>
//                           </TooltipTrigger>
//                           <TooltipContent>
//                             <span>Edit</span>
//                           </TooltipContent>
//                         </Tooltip>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <Button size="icon" variant={"destructive"}>
//                               <Trash2 size={20} />
//                             </Button>
//                           </TooltipTrigger>
//                           <TooltipContent>
//                             <span>Delete</span>
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>
//                     </div>
//                   </CardFooter>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SubjectChapters;
