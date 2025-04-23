"use client";

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  listSubjects, 
  listChapters, 
  listTopics, 
  listResources,
  getClassRessources,
  getClassVideoResources
} from '@/actions/courses';
import { 
  ClassType, 
  EducationLevel,  
  Section,
  SubjectType,
  ChapterType,
  TopicType,
  AbstractResourceType,
  VideoResourceType
} from '@/types';
import {EDUCATION_LEVELS,SECTIONS} from "@/constants"
import { ChevronRight, ArrowLeft, FileText, Video, ScrollText, BookOpen, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useResourceNavigationStore } from '@/store/resource-navigation-store';

interface ResourceBrowserProps {
  initialClasses: ClassType[];
}

type NavigationLevel = 'classes' | 'subjects' | 'chapters' | 'topics' | 'resources';

const ResourceBrowser: React.FC<ResourceBrowserProps> = ({ initialClasses }) => {
  const router = useRouter();
  const [classes] = useState<ClassType[]>(initialClasses);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get state from persistent store
  const { 
    currentLevel, setCurrentLevel,
    currentClass, setCurrentClass,
    currentSubject, setCurrentSubject,
    currentChapter, setCurrentChapter,
    currentTopic, setCurrentTopic,
    activeTab, setActiveTab,
    subjects, setSubjects,
    chapters, setChapters,
    topics, setTopics,
    resources, setResources,
    videoResources, setVideoResources,
  } = useResourceNavigationStore();
  
  // Effect to restore navigation state on page load
  useEffect(() => {
    // If we have a current class but no subjects, refetch the subjects
    const restoreData = async () => {
      if (currentClass && subjects.length === 0 && currentLevel !== 'classes') {
        setIsLoading(true);
        try {
          const fetchedSubjects = await listSubjects({ 
            class_pk: currentClass.id.toString() 
          });
          setSubjects(fetchedSubjects);
          
          // Reload class resources if needed
          if (currentLevel === 'subjects') {
            const [classResources, classVideoResources] = await Promise.all([
              getClassRessources(currentClass.id.toString()),
              getClassVideoResources(currentClass.id.toString())
            ]);
            
            setResources(classResources);
            setVideoResources(classVideoResources);
          }
          
          // Reload chapters if needed
          if (currentSubject && (currentLevel === 'chapters' || currentLevel === 'topics' || currentLevel === 'resources') && chapters.length === 0) {
            const fetchedChapters = await listChapters({
              class_pk: currentClass.id.toString(),
              subject_pk: currentSubject.id.toString()
            });
            setChapters(fetchedChapters);
          }
          
          // Reload topics if needed
          if (currentChapter && (currentLevel === 'topics' || currentLevel === 'resources') && topics.length === 0) {
            const fetchedTopics = await listTopics({
              class_pk: currentClass.id.toString(),
              subject_pk: currentSubject!.id.toString(),
              chapter_pk: currentChapter.id.toString()
            });
            setTopics(fetchedTopics);
          }
          
          // Reload resources if needed
          if (currentTopic && currentLevel === 'resources' && resources.length === 0) {
            const fetchedResources = await listResources({
              class_pk: currentClass.id.toString(),
              subject_pk: currentSubject!.id.toString(),
              chapter_pk: currentChapter!.id.toString(),
              topic_pk: currentTopic.id.toString()
            });
            
            const extractedResources = fetchedResources.map(item => item.resource);
            setResources(extractedResources);
          }
        } catch (error) {
          console.error("Error restoring navigation state:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    restoreData();
  }, [currentClass, currentSubject, currentChapter, currentTopic, currentLevel, subjects.length, setSubjects, chapters.length, topics.length, resources.length, setResources, setVideoResources, setChapters, setTopics]);
  
  // Group classes by section
  const classesGroupedBySection: Record<Section, ClassType[]> = {
    FRANCOPHONE: [],
    ANGLOPHONE: []
  };
  
  classes.forEach(classItem => {
    classesGroupedBySection[classItem.section].push(classItem);
  });

  // Get resource icon based on type
  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'PDFResource':
        return <FileText className="h-5 w-5 text-primary" />;
      case 'VideoResource':
        return <Video className="h-5 w-5 text-blue-500" />;
      case 'ExerciseResource':
        return <ScrollText className="h-5 w-5 text-green-500" />;
      case 'RevisionResource':
        return <BookOpen className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // Handle resource navigation to detail page
  const handleViewResource = (resource: AbstractResourceType | VideoResourceType) => {
    router.push(`/dashboard/resources/${resource.id}`);
  };

  const handleClassClick = async (classItem: ClassType) => {
    setIsLoading(true);
    try {
      const fetchedSubjects = await listSubjects({ 
        class_pk: classItem.id.toString() 
      });
      setSubjects(fetchedSubjects);
      setCurrentClass(classItem);
      setCurrentLevel('subjects');
      
      // Also fetch resources directly attached to the class
      const [classResources, classVideoResources] = await Promise.all([
        getClassRessources(classItem.id.toString()),
        getClassVideoResources(classItem.id.toString())
      ]);
      
      setResources(classResources);
      setVideoResources(classVideoResources);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectClick = async (subject: SubjectType) => {
    if (!currentClass) return;
    
    setIsLoading(true);
    try {
      const fetchedChapters = await listChapters({
        class_pk: currentClass.id.toString(),
        subject_pk: subject.id.toString()
      });
      setChapters(fetchedChapters);
      setCurrentSubject(subject);
      setCurrentLevel('chapters');
    } catch (error) {
      console.error("Error fetching chapters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChapterClick = async (chapter: ChapterType) => {
    if (!currentClass || !currentSubject) return;
    
    setIsLoading(true);
    try {
      const fetchedTopics = await listTopics({
        class_pk: currentClass.id.toString(),
        subject_pk: currentSubject.id.toString(),
        chapter_pk: chapter.id.toString()
      });
      setTopics(fetchedTopics);
      setCurrentChapter(chapter);
      setCurrentLevel('topics');
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicClick = async (topic: TopicType) => {
    if (!currentClass || !currentSubject || !currentChapter) return;
    
    setIsLoading(true);
    try {
      const fetchedResources = await listResources({
        class_pk: currentClass.id.toString(),
        subject_pk: currentSubject.id.toString(),
        chapter_pk: currentChapter.id.toString(),
        topic_pk: topic.id.toString()
      });
      
      // Handle the resource response structure
      const extractedResources = fetchedResources.map(item => item.resource);
      setResources(extractedResources);
      setCurrentTopic(topic);
      setCurrentLevel('resources');
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateBack = () => {
    switch (currentLevel) {
      case 'subjects':
        setCurrentLevel('classes');
        setCurrentClass(null);
        break;
      case 'chapters':
        setCurrentLevel('subjects');
        setCurrentSubject(null);
        break;
      case 'topics':
        setCurrentLevel('chapters');
        setCurrentChapter(null);
        break;
      case 'resources':
        setCurrentLevel('topics');
        setCurrentTopic(null);
        break;
    }
  };
  
  // Create breadcrumb navigation
  const renderBreadcrumbs = () => {
    if (currentLevel === 'classes') return null;
    
    return (
      <div className="flex flex-wrap items-center mb-6 text-sm bg-card/95 backdrop-blur p-3 rounded-lg border border-primary/20 shadow-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={navigateBack}
          className="mr-2 hover:bg-primary/10 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <div className="flex flex-wrap items-center">
          {currentLevel !== 'classes' && (
            <>
              <span className="text-muted-foreground cursor-pointer hover:text-primary" onClick={() => setCurrentLevel('classes')}>
                Classes
              </span>
              <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
            </>
          )}
          
          {currentLevel !== 'classes' && currentClass && (
            <>
              <span className="text-muted-foreground cursor-pointer hover:text-primary" onClick={() => {
                setCurrentLevel('subjects');
                setCurrentSubject(null);
                setCurrentChapter(null);
                setCurrentTopic(null);
              }}>
                {currentClass.name}
              </span>
              {currentLevel !== 'subjects' && <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />}
            </>
          )}
          
          {currentLevel !== 'classes' && currentLevel !== 'subjects' && currentSubject && (
            <>
              <span className="text-muted-foreground cursor-pointer hover:text-primary" onClick={() => {
                setCurrentLevel('chapters');
                setCurrentChapter(null);
                setCurrentTopic(null);
              }}>
                {currentSubject.name}
              </span>
              {currentLevel !== 'chapters' && <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />}
            </>
          )}
          
          {currentLevel !== 'classes' && currentLevel !== 'subjects' && currentLevel !== 'chapters' && currentChapter && (
            <>
              <span className="text-muted-foreground cursor-pointer hover:text-primary" onClick={() => {
                setCurrentLevel('topics');
                setCurrentTopic(null);
              }}>
                {currentChapter.title}
              </span>
              {currentLevel !== 'topics' && <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />}
            </>
          )}
          
          {currentLevel === 'resources' && currentTopic && (
            <span className="font-medium text-primary">{currentTopic.title}</span>
          )}
        </div>
      </div>
    );
  };

  // Render classes grouped by section and education level
  const renderClasses = () => {
    return (
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as Section)} 
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 mb-4 bg-card/95 backdrop-blur border border-primary/20">
          {SECTIONS.map(section => (
            <TabsTrigger 
              key={section} 
              value={section}
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              {section}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {SECTIONS.map(section => (
          <TabsContent key={section} value={section}>
            <div className="space-y-6">
              {EDUCATION_LEVELS.map(level => {
                const levelClasses = classesGroupedBySection[section as "FRANCOPHONE" | "ANGLOPHONE"].filter(cls => cls.level === level);
                
                if (levelClasses.length === 0) return null;
                
                return (
                  <div key={level} className="relative">
                    <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-primary/20 rounded-tr-full z-0 opacity-20 hidden lg:block"></div>
                    <h2 className="text-xl font-semibold mb-3 text-primary">{level}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {levelClasses.map(classItem => (
                        <Card 
                          key={classItem.id} 
                          className="hover:shadow-md transition-all cursor-pointer bg-card/95 backdrop-blur border-primary/20 relative overflow-hidden"
                          onClick={() => handleClassClick(classItem)}
                        >
                          <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-lg"></div>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-primary">{classItem.name}</CardTitle>
                            <CardDescription>
                              {classItem.speciality && `Speciality: ${classItem.speciality}`}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              {classItem.description || 'No description available'}
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                              View Subjects
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    );
  };

  // Render subjects of a class
  const renderSubjects = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4 text-primary">
          Subjects in {currentClass?.name}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(subject => (
            <Card 
              key={subject.id} 
              className="hover:shadow-md transition-all cursor-pointer bg-card/95 backdrop-blur border-primary/20 relative overflow-hidden"
              onClick={() => handleSubjectClick(subject)}
            >
              <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-lg"></div>
              <CardHeader>
                <CardTitle className="text-primary">{subject.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {subject.description || 'No description available'}
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                  View Chapters
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {resources.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">Class Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map(resource => (
                <Card 
                  key={resource.id}
                  className="hover:shadow-md transition-all cursor-pointer bg-card/95 backdrop-blur border-primary/20 relative overflow-hidden"
                  onClick={() => handleViewResource(resource)}
                >
                  <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-lg"></div>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource.resource_type)}
                      <CardTitle className="text-primary">{resource.title}</CardTitle>
                    </div>
                    <CardDescription>
                      {resource.resource_type?.replace('Resource', '')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {resource.description || 'No description available'}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/10">
                      {resource.resource_type === 'VideoResource' ? 'Watch Video' : 'View Resource'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {videoResources.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">Class Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videoResources.map(video => (
                <Card 
                  key={video.id}
                  className="hover:shadow-md transition-all cursor-pointer bg-card/95 backdrop-blur border-primary/20 relative overflow-hidden"
                  onClick={() => handleViewResource(video)}
                >
                  <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-lg"></div>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-primary">{video.title}</CardTitle>
                    </div>
                    <CardDescription>Video</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {video.description || 'No description available'}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/10">
                      Watch Video
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render chapters of a subject
  const renderChapters = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4 text-primary">
          Chapters in {currentSubject?.name}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapters.map(chapter => (
            <Card 
              key={chapter.id} 
              className="hover:shadow-md transition-all cursor-pointer bg-card/95 backdrop-blur border-primary/20 relative overflow-hidden"
              onClick={() => handleChapterClick(chapter)}
            >
              <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-lg"></div>
              <CardHeader>
                <CardTitle className="text-primary">{chapter.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {chapter.description || 'No description available'}
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                  View Topics
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Render topics of a chapter
  const renderTopics = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4 text-primary">
          Topics in {currentChapter?.title}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map(topic => (
            <Card 
              key={topic.id} 
              className="hover:shadow-md transition-all cursor-pointer bg-card/95 backdrop-blur border-primary/20 relative overflow-hidden"
              onClick={() => handleTopicClick(topic)}
            >
              <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-lg"></div>
              <CardHeader>
                <CardTitle className="text-primary">{topic.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {topic.description || 'No description available'}
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                  View Resources
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Render resources of a topic
  const renderResources = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4 text-primary">
          Resources for {currentTopic?.title}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(resource => (
            <Card 
              key={resource.id}
              className="hover:shadow-md transition-all cursor-pointer bg-card/95 backdrop-blur border-primary/20 relative overflow-hidden"
              onClick={() => handleViewResource(resource)}
            >
              <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-lg"></div>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {getResourceIcon(resource.resource_type)}
                  <CardTitle className="text-primary">{resource.title}</CardTitle>
                </div>
                <CardDescription>
                  {resource.resource_type.replace('Resource', '')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {resource.description || 'No description available'}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/10">
                  {resource.resource_type === 'VideoResource' ? 'Watch Video' : 'View Resource'}
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          {resources.length === 0 && (
            <div className="col-span-3 text-center py-8 bg-card/95 backdrop-blur rounded-lg border border-primary/20 p-8">
              <div className="mx-auto mb-4 rounded-full bg-primary/10 p-3 w-16 h-16 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-primary">No Resources Found</h3>
              <p className="text-muted-foreground">No resources are available for this topic</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render the appropriate UI based on current navigation level
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64 bg-card/95 backdrop-blur rounded-lg border border-primary/20 shadow-md">
          <LoaderCircle className="animate-spin h-8 w-8 mr-2 text-primary" />
          <span className="text-lg text-primary">Loading resources...</span>
        </div>
      );
    }

    switch (currentLevel) {
      case 'classes':
        return renderClasses();
      case 'subjects':
        return renderSubjects();
      case 'chapters':
        return renderChapters();
      case 'topics':
        return renderTopics();
      case 'resources':
        return renderResources();
      default:
        return renderClasses();
    }
  };

  return (
    <div className="relative">
      <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-primary/20 rounded-tr-full z-0 opacity-20 hidden lg:block"></div>
      {renderBreadcrumbs()}
      {renderContent()}
    </div>
  );
};

export default ResourceBrowser;
