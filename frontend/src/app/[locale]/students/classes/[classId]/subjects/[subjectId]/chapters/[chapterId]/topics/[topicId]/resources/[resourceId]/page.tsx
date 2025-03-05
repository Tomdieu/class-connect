import React from 'react';
import { listResources, getTopic } from '@/actions/courses';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PDFDisplay from '@/components/PDFDisplay';
import VideoReader from '@/components/VideoReader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, FileText, Film, PenTool } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExerciseResourceType, PDFResourceType, RevisionResourceType, VideoResourceType } from '@/types';

interface ResourceDetailPageProps {
  params: {
    classId: string;
    subjectId: string;
    chapterId: string;
    topicId: string;
    resourceId: string;
  };
}

async function ResourceDetailPage({ params }: ResourceDetailPageProps) {
  try {
    const { classId, subjectId, chapterId, topicId, resourceId } = params;
    
    // Get topic details for context
    const topic = await getTopic({
      class_pk: classId,
      subject_pk: subjectId,
      chapter_pk: chapterId,
      topic_pk: topicId,
    });
    
    if (!topic) {
      return notFound();
    }
    
    // Get all resources for this topic
    const resources = await listResources({
      class_pk: classId,
      subject_pk: subjectId,
      chapter_pk: chapterId,
      topic_pk: topicId,
    });
    
    // Find the specific resource
    const resourceItem = resources.find(r => r.id.toString() === resourceId);
    
    if (!resourceItem) {
      return notFound();
    }

    // Destructure resource data
    const { resource } = resourceItem;
    
    // Function to render resource content based on type
    const renderResourceContent = () => {
      switch (resource.resource_type) {
        case 'PDFResource':
          return (
            <div className="mt-6">
              <PDFDisplay 
                pdfUrl={(resource as PDFResourceType).pdf_url || (resource as PDFResourceType).pdf_file} 
              />
            </div>
          );
          
        case 'VideoResource':
          return (
            <div className="mt-6">
              <VideoReader 
                videoUrl={(resource as VideoResourceType).video_url || (resource as VideoResourceType).video_file} 
              />
            </div>
          );
          
        case 'ExerciseResource':
          return (
            <div className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PenTool className="h-5 w-5 mr-2" />
                    Exercise Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>{(resource as ExerciseResourceType).instructions}</p>
                  
                  {(resource as ExerciseResourceType).exercise_url && (
                    <div className="mt-4">
                      <h4>Exercise File</h4>
                      <Button asChild>
                        <a 
                          href={(resource as ExerciseResourceType).exercise_url || (resource as ExerciseResourceType).exercise_file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Download Exercise
                        </a>
                      </Button>
                    </div>
                  )}
                  
                  {(resource as ExerciseResourceType).solution_url && (
                    <div className="mt-4">
                      <h4>Solution</h4>
                      <Button variant="outline" asChild>
                        <a 
                          href={(resource as ExerciseResourceType).solution_url || (resource as ExerciseResourceType).solution_file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Solution
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
          
        case 'RevisionResource':
          return (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Revision Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: (resource as RevisionResourceType).content }}
                  />
                </CardContent>
              </Card>
            </div>
          );
          
       
          
        default:
          return (
            <div className="mt-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    This resource type is not supported in the viewer. 
                    Please contact support if you believe this is an error.
                  </p>
                </CardContent>
              </Card>
            </div>
          );
      }
    };

    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/students/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Topic Resources
          </Link>
        </Button>

        <DashboardHeader
          title={resource.title}
          description={resource.description || `Resource for ${topic.title}`}
          icon={
            resource.resource_type === 'PDFResource' ? <FileText className="h-6 w-6" /> :
            resource.resource_type === 'VideoResource' ? <Film className="h-6 w-6" /> :
            resource.resource_type === 'ExerciseResource' ? <PenTool className="h-6 w-6" /> :
            <BookOpen className="h-6 w-6" />
          }
        />
        
        {renderResourceContent()}
      </div>
    );
  } catch (error) {
    console.error("Error loading resource:", error);
    return (
      <div className="container mx-auto py-6">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>Failed to load resource. Please try again later.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href={`/students/classes/${params.classId}/subjects/${params.subjectId}/chapters/${params.chapterId}/topics/${params.topicId}`}>
            Return to Topic
          </Link>
        </Button>
      </div>
    );
  }
}

export default ResourceDetailPage;