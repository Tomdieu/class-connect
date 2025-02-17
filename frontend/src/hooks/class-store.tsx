import { ClassType } from '@/types';
import { create } from 'zustand';

type ClassStore = {
    class?: ClassType,
    isOpen: boolean,
    onAdd: () => void,
    setClass: (classData: ClassType) => void,
    onOpen: () => void,
    onClose: () => void,
}

export const useClassStore = create<ClassStore>((set) => ({
    class: undefined,
    isOpen: false,
    setClass: (classData) => set({ class: classData, isOpen: true }),
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false, class: undefined }),
    onAdd: () => set({ isOpen: true}),
}));