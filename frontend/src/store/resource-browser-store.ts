import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ClassDetail } from "@/types";

interface ResourceBrowserState {
  selectedClass: ClassDetail | null;
  activeTab: "EN" | "FR";
  setSelectedClass: (classItem: ClassDetail | null) => void;
  setActiveTab: (tab: "EN" | "FR") => void;
}

export const useResourceBrowserStore = create<ResourceBrowserState>()(
  persist(
    (set) => ({
      selectedClass: null,
      activeTab: "EN",
      setSelectedClass: (classItem) => set({ selectedClass: classItem }),
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: "resource-browser-store", // Key for localStorage
    }
  )
);
