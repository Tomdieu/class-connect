"use client";
import { getChapter, getTopic, listTopics } from "@/actions/courses";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { useTopicStore } from "@/hooks/topic-store";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

function ChapterDetail() {
  const { id, subjectId, chapterId } = useParams<{
    id: string;
    subjectId: string;
    chapterId: string;
  }>();
  const { onAdd } = useTopicStore();
  const { isLoading, data, isError, error } = useQuery({
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
            {data && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-medium">{data?.title}</h2>
                <p className="text-muted-foreground text-sm">
                  {data?.description}
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
            {topicQuery?.data?.map((topic,index)=>(
                <div key={index} className="w-full p-3 rounded-sm shadow-lg">
                    <h1>{topic.title}</h1>
                    <p>{topic.description}</p>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChapterDetail;
