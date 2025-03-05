import { getMyClass } from '@/actions/user-classes';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

async function BrowseClassesPage() {
  const myClasses = await getMyClass();
  
  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/students">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </Button>

      <DashboardHeader
        title="My Classes"
        description="Browse all your enrolled classes and access learning materials"
        icon={<BookOpen className="h-6 w-6" />}
      />
      
      {myClasses && myClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {myClasses.map((classItem) => (
            <Card 
              key={classItem.id} 
              className="hover:shadow-md transition-all"
            >
              <CardHeader>
                <CardTitle>{classItem.class_level.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  School Year: {classItem.school_year.formatted_year}
                </p>
                <Button asChild>
                  <Link href={`/students/classes/${classItem.id}`}>
                    View Subjects
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg mt-6">
          <h3 className="text-xl font-semibold mb-2">No classes found</h3>
          <p className="text-muted-foreground mb-4">
            You are not enrolled in any classes yet.
          </p>
          <Button asChild>
            <Link href="/students/enroll">Enroll in a Class</Link>
          </Button>
        </div>
      )}
    </div> 
  );
}

export default BrowseClassesPage;
