"use client";

import { getMyClass } from '@/actions/user-classes'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, BookOpen, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { useI18n } from "@/locales/client"
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'

function StudentHomePage() {
  const t = useI18n();
  
  const { data: myClasses, isLoading, error } = useQuery({
    queryKey: ['myClasses'],
    queryFn: () => getMyClass(),
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="h-12 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="opacity-60">
              <CardHeader>
                <Skeleton className="h-6 w-36 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
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
        <DashboardHeader 
          title={t('student.dashboard.title')}
          description={t('common.error')}
          icon={<GraduationCap className="h-6 w-6" />}
        />
        <Card className="mt-6">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center mb-4">
              {t('common.errorDesc', { item: 'classes' })}
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
    <div className="container mx-auto py-6">
      <DashboardHeader 
        title={t('student.dashboard.title')}
        description={t('student.dashboard.welcome')}
        icon={<GraduationCap className="h-6 w-6" />}
      />
      
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
    </div>
  )
}

export default StudentHomePage