import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  ClassType,
  SubjectType,
  ChapterType,
  TopicType,
  AbstractResourceType,
  VideoResourceType,
  Section
} from '@/types';

type NavigationLevel = 'classes' | 'subjects' | 'chapters' | 'topics' | 'resources';

interface ResourceNavigationState {
  // Navigation state
  currentLevel: NavigationLevel;
  currentClass: ClassType | null;
  currentSubject: SubjectType | null;
  currentChapter: ChapterType | null;
  currentTopic: TopicType | null;
  activeTab: Section;
  
  // Data storage
  subjects: SubjectType[];
  chapters: ChapterType[];
  topics: TopicType[];
  resources: AbstractResourceType[];
  videoResources: VideoResourceType[];
  
  // Actions
  setCurrentLevel: (level: NavigationLevel) => void;
  setCurrentClass: (classItem: ClassType | null) => void;
  setCurrentSubject: (subject: SubjectType | null) => void;
  setCurrentChapter: (chapter: ChapterType | null) => void;
  setCurrentTopic: (topic: TopicType | null) => void;
  setActiveTab: (tab: Section) => void;
  
  setSubjects: (subjects: SubjectType[]) => void;
  setChapters: (chapters: ChapterType[]) => void;
  setTopics: (topics: TopicType[]) => void;
  setResources: (resources: AbstractResourceType[]) => void;
  setVideoResources: (videoResources: VideoResourceType[]) => void;
  
  // Reset state
  resetState: () => void;
}

export const useResourceNavigationStore = create<ResourceNavigationState>()(
  persist(
    (set) => ({
      // Initial state
      currentLevel: 'classes',
      currentClass: null,
      currentSubject: null,
      currentChapter: null,
      currentTopic: null,
      activeTab: 'FRANCOPHONE',
      
      subjects: [],
      chapters: [],
      topics: [],
      resources: [],
      videoResources: [],
      
      // Actions
      setCurrentLevel: (level) => set({ currentLevel: level }),
      setCurrentClass: (classItem) => set({ currentClass: classItem }),
      setCurrentSubject: (subject) => set({ currentSubject: subject }),
      setCurrentChapter: (chapter) => set({ currentChapter: chapter }),
      setCurrentTopic: (topic) => set({ currentTopic: topic }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      setSubjects: (subjects) => set({ subjects }),
      setChapters: (chapters) => set({ chapters }),
      setTopics: (topics) => set({ topics }),
      setResources: (resources) => set({ resources }),
      setVideoResources: (videoResources) => set({ videoResources }),
      
      // Reset the entire state
      resetState: () => set({
        currentLevel: 'classes',
        currentClass: null,
        currentSubject: null,
        currentChapter: null,
        currentTopic: null,
        subjects: [],
        chapters: [],
        topics: [],
        resources: [],
        videoResources: [],
      }),
    }),
    {
      name: 'resource-navigation-storage', // unique name for localStorage
    }
  )
);
