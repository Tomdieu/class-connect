"use client";

import React from 'react';
import { TopicType } from '@/types';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from "@/locales/client";

interface TopicListProps {
  topics: TopicType[];
  classId: number;
  subjectId: number;
  chapterId: number;
}

const TopicList: React.FC<TopicListProps> = ({ topics, classId, subjectId, chapterId }) => {
  const t = useI18n();
  
  // Sort topics by order
  const sortedTopics = [...topics].sort((a, b) => a.order - b.order);
  
  if (sortedTopics.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">{t('student.chapter.noTopics')}</p>
    );
  }
  
  return (
    <div className="space-y-2 mt-2">
      {sortedTopics.map(topic => (
        <Link
          key={topic.id}
          href={`/students/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topic.id}`}
          className="flex items-center p-3 border rounded-md hover:bg-muted/50 transition-colors"
        >
          <FileText className="h-4 w-4 mr-2 text-primary" />
          <div>
            <p className="font-medium">{topic.title}</p>
            {topic.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{topic.description}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default TopicList;
