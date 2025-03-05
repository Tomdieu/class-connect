import { getClassSubject } from '@/actions/user-classes';
import { getUserClass } from '@/actions/user-classes';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SubjectCard from '@/components/students/SubjectCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react';

interface ClassSubjectsPageProps {
  params: {
    classId: string;
  };
}

async function ClassSubjectsPage({ params }: ClassSubjectsPageProps) {
  try {
    const classId = parseInt(params.classId);
    const classInfo = await getUserClass(classId);
    const subjects = await getClassSubject({ params: { class_id: classId } });

    if (!classInfo) {
      return notFound();
    }

    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/students">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </Button>

        <DashboardHeader
          title={classInfo.class_level.name}
          description={`Explore your subjects for ${classInfo.class_level.name}`}
          icon={<BookOpen className="h-6 w-6" />}
        />

        {subjects && subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {subjects.map((subject) => (
              <SubjectCard 
                key={subject.id} 
                subject={subject}
                classId={classId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No subjects available</h3>
            <p className="text-muted-foreground">
              There are no subjects assigned to this class yet.
            </p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading class subjects:", error);
    return (
      <div className="container mx-auto py-6">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>Failed to load subjects. Please try again later.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/students">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }
}

export default ClassSubjectsPage;
