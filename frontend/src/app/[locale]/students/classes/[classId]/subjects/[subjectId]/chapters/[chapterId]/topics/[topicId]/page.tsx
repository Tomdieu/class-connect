import { getTopic, listResources } from '@/actions/courses';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ResourceList from '@/components/students/ResourceList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react';

interface TopicDetailPageProps {
  params: {
    classId: string;
    subjectId: string;
    chapterId: string;
    topicId: string;
  };
}

async function TopicDetailPage({ params }: TopicDetailPageProps) {
  try {
    const { classId, subjectId, chapterId, topicId } = params;
    
    // Get topic details
    const topic = await getTopic({
      class_pk: classId,
      subject_pk: subjectId,
      chapter_pk: chapterId,
      topic_pk: topicId,
    });
    
    if (!topic) {
      return notFound();
    }
    
    // Get resources for this topic
    const resources = await listResources({
      class_pk: classId,
      subject_pk: subjectId,
      chapter_pk: chapterId,
      topic_pk: topicId,
    });

    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/students/classes/${classId}/subjects/${subjectId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Chapters
          </Link>
        </Button>

        <DashboardHeader
          title={topic.title}
          description={topic.description || "Access learning materials for this topic"}
          icon={<BookOpen className="h-6 w-6" />}
        />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Learning Resources</CardTitle>
            <CardDescription>
              Access videos, documents, and exercises for this topic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResourceList 
              resources={resources}
              classId={parseInt(classId)}
              subjectId={parseInt(subjectId)}
              chapterId={parseInt(chapterId)}
              topicId={parseInt(topicId)}
            />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Error loading topic details:", error);
    return (
      <div className="container mx-auto py-6">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>Failed to load topic details. Please try again later.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href={`/students/classes/${params.classId}/subjects/${params.subjectId}`}>
            Return to Subject
          </Link>
        </Button>
      </div>
    );
  }
}

export default TopicDetailPage;
