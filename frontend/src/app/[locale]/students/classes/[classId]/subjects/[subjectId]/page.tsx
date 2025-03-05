import { listChapters } from '@/actions/courses';
import { getClassSubject, getUserClass } from '@/actions/user-classes';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ChapterAccordion from '@/components/students/ChapterAccordion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react';

interface SubjectDetailPageProps {
  params: {
    classId: string;
    subjectId: string;
  };
}

async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  try {
    const classId = parseInt(params.classId);
    const subjectId = parseInt(params.subjectId);
    
    // Get class info
    const classInfo = await getUserClass(classId);
    
    // Get subjects for this class
    const subjects = await getClassSubject({ params: { class_id: classId } });
    const subject = subjects.find(s => s.id === subjectId);
    
    if (!subject || !classInfo) {
      return notFound();
    }
    
    // Get chapters for this subject
    const chapters = await listChapters({
      class_pk: classId.toString(),
      subject_pk: subjectId.toString(),
    });

    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/students/classes/${classId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Subjects
          </Link>
        </Button>

        <DashboardHeader
          title={subject.name}
          description={subject.description || `${classInfo.class_level.name} - ${subject.name}`}
          icon={<Book className="h-6 w-6" />}
        />

        {chapters && chapters.length > 0 ? (
          <div className="mt-6 space-y-4">
            <ChapterAccordion 
              chapters={chapters}
              classId={classId}
              subjectId={subjectId}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No chapters available</h3>
            <p className="text-muted-foreground">
              There are no chapters added to this subject yet.
            </p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading subject details:", error);
    return (
      <div className="container mx-auto py-6">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>Failed to load subject details. Please try again later.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href={`/students/classes/${params.classId}`}>Return to Class</Link>
        </Button>
      </div>
    );
  }
}

export default SubjectDetailPage;
