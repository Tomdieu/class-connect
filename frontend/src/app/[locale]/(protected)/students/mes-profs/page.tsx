"use client";

import { getMyTeachers } from '@/actions/enrollments';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useI18n } from "@/locales/client";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { getInitials } from '@/lib/utils';

function MyTeachersPage() {
  const t = useI18n();
  
  const { data: teachers, isLoading, error } = useQuery({
    queryKey: ['myTeachers'],
    queryFn: () => getMyTeachers(),
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="h-10 w-40 mb-4" />
        <Skeleton className="h-12 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="opacity-60">
              <CardHeader>
                <Skeleton className="h-12 w-12 rounded-full mb-2" />
                <Skeleton className="h-6 w-36 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-48 mb-4" />
                <Skeleton className="h-9 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/students">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('common.back')} {t('common.dashboard')}
          </Link>
        </Button>
        <DashboardHeader
          title={t('student.dashboard.myTeachers')}
          description={t('common.error')}
          icon={<Users className="h-6 w-6" />}
        />
        <Card className="mt-6">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">
              {t('common.errorDesc', { item: 'teachers' })}
            </p>
            <div className="flex justify-center">
              <Button onClick={() => window.location.reload()}>
                {t('plans.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 flex-1 w-full h-full">
      <DashboardHeader
        title={t('student.dashboard.myTeachers')}
        description="Connect with your teachers and access their courses"
        icon={<Users className="h-6 w-6" />}
        showNavigation={true}
        currentPath={t('student.dashboard.myTeachers')}
      />
      
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/students">
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('common.back')} {t('common.dashboard')}
        </Link>
      </Button>

      {teachers && teachers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {teachers.map((enrollment) => {
            const teacher = enrollment.teacher;
            return (
              <Card 
                key={enrollment.id} 
                className="hover:shadow-md transition-all"
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={teacher.avatar} alt={`${teacher.first_name} ${teacher.last_name}`} />
                    <AvatarFallback>{getInitials(`${teacher.first_name} ${teacher.last_name}`)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{teacher.first_name} {teacher.last_name}</CardTitle>
                    <CardDescription>{enrollment.subject?.name || enrollment.offer.subject?.name || "Subject"}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-4">
                    <p>Class: {enrollment.class_level?.name || enrollment.offer.class_level?.name || "Class"}</p>
                    <p>Email: {teacher.email}</p>
                    <p>Started: {new Date(enrollment.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button asChild variant="outline">
                    <Link href={`/students/teachers/${enrollment.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg mt-6">
          <h3 className="text-xl font-semibold mb-2">No Teachers Found</h3>
          <p className="text-muted-foreground mb-4">
            You don&apos;t have any teachers assigned yet.
          </p>
        </div>
      )}
    </div>
  );
}

export default MyTeachersPage;
