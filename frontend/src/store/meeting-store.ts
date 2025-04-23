import { create } from 'zustand';
import { OnlineCourseCreateType, OnlineCourseStatus, OnlineCourseType } from '@/types';
import { 
  createOnlineCourse,
  deleteOnlineCourse, 
  listOnlineCourses 
} from '@/actions/online-courses';

interface MeetingState {
  meetings: OnlineCourseType[];
  loading: boolean;
  error: string | null;
  isCreating: boolean;
  createDialogOpen: boolean;
  statusFilter: OnlineCourseStatus | "ALL";
  searchQuery: string;
  
  setCreateDialogOpen: (open: boolean) => void;
  setStatusFilter: (status: OnlineCourseStatus | "ALL") => void;
  setSearchQuery: (query: string) => void;
  fetchMeetings: (params?: any) => Promise<void>;
  createMeeting: (meeting: Omit<OnlineCourseCreateType, "id">) => Promise<OnlineCourseType | null>;
  deleteMeeting: (id: string) => Promise<boolean>;
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  meetings: [],
  loading: false,
  error: null,
  isCreating: false,
  createDialogOpen: false,
  statusFilter: "ALL",
  searchQuery: "",
  
  setCreateDialogOpen: (open) => set({ createDialogOpen: open }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  fetchMeetings: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await listOnlineCourses(params);
      set({ meetings: data, loading: false });
      return;
    } catch (error) {
      console.error(error);
      set({ error: "Failed to load meetings", loading: false });
    }
  },
  
  createMeeting: async (meetingData) => {
    set({ isCreating: true });
    try {
      // Backend assigns the ID, so we pass 0 as a placeholder
      const meeting = { ...meetingData, id: 0 } as OnlineCourseCreateType;
      const newMeeting = await createOnlineCourse(meeting);
      
      // Add the new meeting to the store
      set((state) => ({ 
        meetings: [newMeeting, ...state.meetings],
        isCreating: false,
        createDialogOpen: false 
      }));
      return newMeeting;
    } catch (error) {
      console.error(error);
      set({ error: "Failed to create meeting", isCreating: false });
      return null;
    }
  },
  
  deleteMeeting: async (id) => {
    try {
      await deleteOnlineCourse(id);
      set((state) => ({ 
        meetings: state.meetings.filter(meeting => meeting.id.toString() !== id) 
      }));
      return true;
    } catch (error) {
      console.error(error);
      set({ error: "Failed to delete meeting" });
      return false;
    }
  }
}));
