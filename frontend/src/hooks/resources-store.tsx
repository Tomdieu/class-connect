"use client"

import { create } from "zustand";

// Base Store Type
type BaseResourceStore = {
    isOpen: boolean;
    topicId?: number | string;
    chapterId?: string | number;
    subjectId?: string | number;
    classId?: string | number;
};

// Quiz Store
type QuizStore = BaseResourceStore & {
    onOpen: (params: {
        classId: string | number,
        subjectId: string | number,
        chapterId: string | number,
        topicId: number | string
    }) => void;
    onClose: () => void;
};

export const useQuizStore = create<QuizStore>((set) => ({
    isOpen: false,
    topicId: undefined,
    chapterId: undefined,
    classId: undefined,
    subjectId: undefined,
    onOpen: ({ classId, subjectId, chapterId, topicId }) => 
        set({ isOpen: true, classId, subjectId, chapterId, topicId }),
    onClose: () => set({ isOpen: false, topicId: undefined, classId: undefined, subjectId: undefined, chapterId: undefined })
}));

// PDF Store
type PDFStore = BaseResourceStore & {
    onOpen: (params: {
        classId: string | number,
        subjectId: string | number,
        chapterId: string | number,
        topicId: number | string
    }) => void;
    onClose: () => void;
};

export const usePDFStore = create<PDFStore>((set) => ({
    isOpen: false,
    topicId: undefined,
    chapterId: undefined,
    classId: undefined,
    subjectId: undefined,
    onOpen: ({ classId, subjectId, chapterId, topicId }) => 
        set({ isOpen: true, classId, subjectId, chapterId, topicId }),
    onClose: () => set({ isOpen: false, topicId: undefined, classId: undefined, subjectId: undefined, chapterId: undefined })
}));

// Exercise Store
type ExerciseStore = BaseResourceStore & {
    onOpen: (params: {
        classId: string | number,
        subjectId: string | number,
        chapterId: string | number,
        topicId: number | string
    }) => void;
    onClose: () => void;
};

export const useExerciseStore = create<ExerciseStore>((set) => ({
    isOpen: false,
    topicId: undefined,
    chapterId: undefined,
    classId: undefined,
    subjectId: undefined,
    onOpen: ({ classId, subjectId, chapterId, topicId }) => 
        set({ isOpen: true, classId, subjectId, chapterId, topicId }),
    onClose: () => set({ isOpen: false, topicId: undefined, classId: undefined, subjectId: undefined, chapterId: undefined })
}));

// Revision Store
type RevisionStore = BaseResourceStore & {
    onOpen: (params: {
        classId: string | number,
        subjectId: string | number,
        chapterId: string | number,
        topicId: number | string
    }) => void;
    onClose: () => void;
};

export const useRevisionStore = create<RevisionStore>((set) => ({
    isOpen: false,
    topicId: undefined,
    chapterId: undefined,
    classId: undefined,
    subjectId: undefined,
    onOpen: ({ classId, subjectId, chapterId, topicId }) => 
        set({ isOpen: true, classId, subjectId, chapterId, topicId }),
    onClose: () => set({ isOpen: false, topicId: undefined, classId: undefined, subjectId: undefined, chapterId: undefined })
}));