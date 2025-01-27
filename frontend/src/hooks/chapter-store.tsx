import { ChapterType } from '@/types';
import {create} from 'zustand';

type ChapterStore = {
    chapter?:ChapterType,
    classId?:number|string,
    subjectId?:number|string,
    isOpen:boolean,
    onAdd:(classId:string,subjectId:string) => void,
    setChapter:(chapter:ChapterType,classId:number|string) => void,
    onOpen:() => void,
    onClose:() => void,
}

export const useChapterStore = create<ChapterStore>((set) => ({
    chapter:undefined,
    isOpen:false,
    classId:undefined,
    subjectId:undefined,
    setChapter:(chapter,classId) => set({chapter:chapter,isOpen:true,classId}),
    onOpen:() => set({isOpen:true}),
    onClose:() => set({isOpen:false,chapter:undefined,classId:undefined}),
    onAdd:(classId,subjectId) => set({isOpen:true,classId:classId,subjectId:subjectId}),
}));