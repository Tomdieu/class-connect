"use client";

import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { listTopics } from "@/actions/courses";
import { ChapterType } from "@/types";
import Link from "next/link";
import { ArrowRight, Book, File } from "lucide-react";
import { useI18n } from "@/locales/client";
import { useQuery } from "@tanstack/react-query";

interface ChapterAccordionProps {
  chapters: ChapterType[];
  classId: number;
  subjectId: number;
}

export default function ChapterAccordion({ chapters, classId, subjectId }: ChapterAccordionProps) {
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  
  // Prefetch topics for the first chapter only once on mount
  useEffect(() => {
    if (chapters && chapters.length > 0) {
      const firstChapterId = chapters[0].id;
      setExpandedChapters([`item-${firstChapterId}`]);
    }
  }, [chapters]);

  return (
    <Accordion
      type="multiple"
      value={expandedChapters}
      onValueChange={setExpandedChapters}
      className="w-full"
    >
      {chapters.map((chapter) => (
        <AccordionItem 
          key={chapter.id} 
          value={`item-${chapter.id}`}
        >
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-start">
              <Book className="mr-2 h-5 w-5 mt-0.5 text-primary" />
              <div className="text-left">
                <div className="font-medium">{chapter.title}</div>
                {chapter.description && (
                  <p className="text-sm text-muted-foreground mt-1">{chapter.description}</p>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {expandedChapters.includes(`item-${chapter.id}`) && (
              <ChapterTopics 
                chapterId={chapter.id}
                classId={classId}
                subjectId={subjectId}
              />
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

// Separate component to handle topics data fetching
function ChapterTopics({ chapterId, classId, subjectId }: { chapterId: number, classId: number, subjectId: number }) {
  const t = useI18n();
  
  const { data: topics, isLoading } = useQuery({
    queryKey: ['topics', classId, subjectId, chapterId],
    queryFn: () => listTopics({
      class_pk: classId.toString(),
      subject_pk: subjectId.toString(),
      chapter_pk: chapterId.toString(),
    }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    retry: 1, // Limit retries to prevent excessive requests
  });
  
  if (isLoading) {
    return <div className="py-2 pl-9 text-sm text-muted-foreground">{t('common.loading')}</div>;
  }
  
  if (!topics || topics.length === 0) {
    return (
      <div className="py-2 pl-9 text-sm text-muted-foreground">
        {t('student.chapter.noTopics')}
      </div>
    );
  }
  
  return (
    <div className="space-y-2 pl-9">
      {topics.map((topic) => (
        <Link
          key={topic.id}
          href={`/students/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topic.id}`}
          className="flex items-center justify-between p-2 rounded-md hover:bg-muted group"
        >
          <div className="flex items-center gap-2">
            <File className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{topic.title}</span>
          </div>
          <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      ))}
    </div>
  );
}
