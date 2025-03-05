import { getMyClass } from '@/actions/user-classes'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, BookOpen, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

async function StudentHomePage() {
  const myClasses = await getMyClass()
  
  return (
    <div className="container mx-auto py-6">
      <DashboardHeader 
        title="Student Dashboard" 
        description="Welcome to your learning portal. Access your classes and learning materials here."
        icon={<GraduationCap className="h-6 w-6" />}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-primary" />
              My Classes
            </CardTitle>
            <CardDescription>
              Access your enrolled classes and subjects
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
                <p className="text-muted-foreground">No classes enrolled yet.</p>
                <Button variant="outline" className="mt-2" asChild>
                  <Link href="/students/enroll">Enroll in a Class</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent learning progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-4">
              Your recent learning activities will appear here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Access frequently used resources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/students/classes">
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Classes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default StudentHomePage