import { SubjectType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface SubjectCardProps {
  subject: SubjectType;
  classId: number;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, classId }) => {
  return (
    <Card className="hover:shadow-md transition-all overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
        <CardTitle className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-primary" />
          {subject.name}
        </CardTitle>
        <CardDescription>
          {subject.description || 'Explore chapters and learning materials'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Link
          href={`/students/classes/${classId}/subjects/${subject.id}`}
          className="flex items-center justify-between text-sm font-medium text-primary hover:underline"
        >
          <span>View chapters and topics</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
};

export default SubjectCard;
