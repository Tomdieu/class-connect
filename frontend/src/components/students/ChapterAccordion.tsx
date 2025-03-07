import React from 'react';
import { listTopics } from '@/actions/courses';
import { ChapterType } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import TopicList from './TopicList';
import { Badge } from '@/components/ui/badge';

interface ChapterAccordionProps {
  chapters: ChapterType[];
  classId: number;
  subjectId: number;
}

const ChapterAccordion: React.FC<ChapterAccordionProps> = async ({ chapters, classId, subjectId }) => {
  // Sort chapters by order
  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);
  
  // Create an array of promises to get topics for each chapter
  const topicsPromises = sortedChapters.map(chapter => 
    listTopics({
      class_pk: classId.toString(),
      subject_pk: subjectId.toString(),
      chapter_pk: chapter.id.toString(),
    })
  );
  
  // Wait for all promises to resolve
  const chapterTopics = await Promise.all(topicsPromises);
  
  return (
    <Card className="border rounded-lg shadow-sm overflow-hidden">
      <Accordion type="single" collapsible className="w-full">
        {sortedChapters.map((chapter, index) => {
          const topicCount = chapterTopics[index]?.length || 0;
          
          return (
            <AccordionItem key={chapter.id} value={`chapter-${chapter.id}`} className="border-b last:border-b-0">
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/20 data-[state=open]:bg-muted/20">
                <div className="flex flex-col items-start text-left">
                  <div className="flex items-center">
                    <h3 className="font-medium text-base">
                      Chapter : {chapter.title}
                    </h3>
                    <Badge variant="outline" className="ml-2">
                      {topicCount} topic{topicCount !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {chapter.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">{chapter.description}</p>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 pt-1">
                <TopicList 
                  topics={chapterTopics[index] || []}
                  classId={classId}
                  subjectId={subjectId}
                  chapterId={chapter.id}
                />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </Card>
  );
};

export default ChapterAccordion;
