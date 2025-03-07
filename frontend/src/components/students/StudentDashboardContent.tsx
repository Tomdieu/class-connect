"use client";

import { UserClassType } from '@/types';
import { useI18n } from "@/locales/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getMyClass } from '@/actions/user-classes';

interface StudentDashboardContentProps {
  initialClasses: UserClassType[];
}

export function StudentDashboardContent({ initialClasses }: StudentDashboardContentProps) {
  const t = useI18n();
  
  // Use Tanstack Query for potentially refreshing data
  const { data: myClasses } = useQuery({
    queryKey: ['studentClasses'],
    queryFn: getMyClass,
    initialData: initialClasses,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-primary" />
            {t('student.dashboard.myClasses')}
          </CardTitle>
          <CardDescription>
            {t('student.dashboard.myClassesDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myClasses && myClasses.length > 0 ? (
            <div className="space-y-2">
              {myClasses.map((classItem) => (
                <Link 
                  href={`/students/classes/${classItem.id}`} 
                  key={classItem.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span>{classItem.class_level.name}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">{t('student.dashboard.noClasses')}</p>
              <Button variant="outline" className="mt-2" asChild>
                <Link href="/students/enroll">{t('student.dashboard.enroll')}</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('student.dashboard.recentActivity')}</CardTitle>
          <CardDescription>{t('student.dashboard.recentActivityDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            {t('student.dashboard.emptyActivity')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('student.dashboard.quickAccess')}</CardTitle>
          <CardDescription>{t('student.dashboard.quickAccessDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/students/classes">
              <BookOpen className="h-4 w-4 mr-2" />
              {t('student.dashboard.browseClasses')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
