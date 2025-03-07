import React from 'react';
import { ResourceType } from '@/types';
import { Card } from '@/components/ui/card';
import { Book, FileText, Film, PenTool } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface ResourceListProps {
  resources: ResourceType[];
  classId: number;
  subjectId: number;
  chapterId: number;
  topicId: number;
}

const ResourceList: React.FC<ResourceListProps> = ({ resources, classId, subjectId, chapterId, topicId }) => {
  if (!resources || resources.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No learning resources available for this topic.</p>
      </div>
    );
  }

  // Organize resources by type
  const pdfResources = resources.filter(r => r.resource.resource_type === 'PDFResource');
  const videoResources = resources.filter(r => r.resource.resource_type === 'VideoResource');
  const exerciseResources = resources.filter(r => r.resource.resource_type === 'ExerciseResource');
  const revisionResources = resources.filter(r => r.resource.resource_type === 'RevisionResource');
  const quizResources = resources.filter(r => r.resource.resource_type === 'QuizResource');

  // Helper function to get the appropriate icon for the resource type
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'PDFResource':
        return <FileText className="h-5 w-5" />;
      case 'VideoResource':
        return <Film className="h-5 w-5" />;
      case 'ExerciseResource':
        return <PenTool className="h-5 w-5" />;
      case 'RevisionResource':
        return <Book className="h-5 w-5" />;
      case 'QuizResource':
        return <Book className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // Function to get resource type label
  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case 'PDFResource':
        return 'PDF';
      case 'VideoResource':
        return 'Video';
      case 'ExerciseResource':
        return 'Exercise';
      case 'RevisionResource':
        return 'Revision';
      case 'QuizResource':
        return 'Quiz';
      default:
        return 'Resource';
    }
  };

  // The URL to the specific resource
  const getResourceUrl = (resourceId: number) => {
    return `/students/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}/resources/${resourceId}`;
  };

  // Resource item component
  const ResourceItem = ({ resource }: { resource: ResourceType }) => {
    const resourceType = resource.resource.resource_type;
    const typeLabel = getResourceTypeLabel(resourceType);
    const icon = getResourceIcon(resourceType);
    
    // Determine badge color based on resource type
    let badgeVariant: "default" | "secondary" | "outline" | "destructive" = "secondary";
    switch (resourceType) {
      case 'VideoResource':
        badgeVariant = "default";
        break;
      case 'ExerciseResource':
        badgeVariant = "destructive";
        break;
      case 'RevisionResource':
      case 'QuizResource':
        badgeVariant = "outline";
        break;
      default:
        badgeVariant = "secondary";
    }

    return (
      <Link href={getResourceUrl(resource.id)} className="block">
        <Card className="hover:shadow-md transition-all overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3 bg-primary/10 p-2 rounded-full">
                {icon}
              </div>
              <div>
                <h4 className="font-medium">{resource.resource.title}</h4>
                {resource.resource.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {resource.resource.description}
                  </p>
                )}
              </div>
            </div>
            <Badge variant={badgeVariant}>{typeLabel}</Badge>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="all">All Resources ({resources.length})</TabsTrigger>
        {pdfResources.length > 0 && <TabsTrigger value="pdf">PDFs ({pdfResources.length})</TabsTrigger>}
        {videoResources.length > 0 && <TabsTrigger value="video">Videos ({videoResources.length})</TabsTrigger>}
        {exerciseResources.length > 0 && <TabsTrigger value="exercise">Exercises ({exerciseResources.length})</TabsTrigger>}
        {revisionResources.length > 0 && <TabsTrigger value="revision">Revisions ({revisionResources.length})</TabsTrigger>}
        {quizResources.length > 0 && <TabsTrigger value="quiz">Quizzes ({quizResources.length})</TabsTrigger>}
      </TabsList>

      <TabsContent value="all" className="space-y-3">
        {resources.map(resource => (
          <ResourceItem key={resource.id} resource={resource} />
        ))}
      </TabsContent>
      
      <TabsContent value="pdf" className="space-y-3">
        {pdfResources.map(resource => (
          <ResourceItem key={resource.id} resource={resource} />
        ))}
      </TabsContent>

      <TabsContent value="video" className="space-y-3">
        {videoResources.map(resource => (
          <ResourceItem key={resource.id} resource={resource} />
        ))}
      </TabsContent>

      <TabsContent value="exercise" className="space-y-3">
        {exerciseResources.map(resource => (
          <ResourceItem key={resource.id} resource={resource} />
        ))}
      </TabsContent>

      <TabsContent value="revision" className="space-y-3">
        {revisionResources.map(resource => (
          <ResourceItem key={resource.id} resource={resource} />
        ))}
      </TabsContent>

      <TabsContent value="quiz" className="space-y-3">
        {quizResources.map(resource => (
          <ResourceItem key={resource.id} resource={resource} />
        ))}
      </TabsContent>
    </Tabs>
  );
};

export default ResourceList;
