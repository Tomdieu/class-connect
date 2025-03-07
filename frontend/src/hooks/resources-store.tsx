"use client"

import {create} from "zustand";

interface ResourceStoreData {
  classId: string;
  subjectId: string;
  chapterId: string;
  topicId: string;
}

interface ResourceEditData extends ResourceStoreData {
  resource: any;
}

interface ResourceStore {
  isOpen: boolean;
  classId?: string | number;
  subjectId?: string | number;
  chapterId?: string | number;
  topicId?: string | number;
  resource?: any;
  onOpen: (data: ResourceStoreData) => void;
  onClose: () => void;
  onEdit: (data: ResourceEditData) => void;
}

export const usePDFStore = create<ResourceStore>((set) => ({
  isOpen: false,
  onOpen: (data) => set({ isOpen: true, ...data }),
  onClose: () => set({ isOpen: false, classId: undefined, subjectId: undefined, chapterId: undefined, topicId: undefined, resource: undefined }),
  onEdit: (data) => set({ isOpen: true, ...data }),
}));

export const useVideoStore = create<ResourceStore>((set) => ({
  isOpen: false,
  onOpen: (data) => set({ isOpen: true, ...data }),
  onClose: () => set({ isOpen: false, classId: undefined, subjectId: undefined, chapterId: undefined, topicId: undefined, resource: undefined }),
  onEdit: (data) => set({ isOpen: true, ...data }),
}));

export const useQuizStore = create<ResourceStore>((set) => ({
  isOpen: false,
  onOpen: (data) => set({ isOpen: true, ...data }),
  onClose: () => set({ isOpen: false, classId: undefined, subjectId: undefined, chapterId: undefined, topicId: undefined, resource: undefined }),
  onEdit: (data) => set({ isOpen: true, ...data }),
}));

export const useExerciseStore = create<ResourceStore>((set) => ({
  isOpen: false,
  onOpen: (data) => set({ isOpen: true, ...data }),
  onClose: () => set({ isOpen: false, classId: undefined, subjectId: undefined, chapterId: undefined, topicId: undefined, resource: undefined }),
  onEdit: (data) => set({ isOpen: true, ...data }),
}));

export const useRevisionStore = create<ResourceStore>((set) => ({
  isOpen: false,
  onOpen: (data) => set({ isOpen: true, ...data }),
  onClose: () => set({ isOpen: false, classId: undefined, subjectId: undefined, chapterId: undefined, topicId: undefined, resource: undefined }),
  onEdit: (data) => set({ isOpen: true, ...data }),
}));