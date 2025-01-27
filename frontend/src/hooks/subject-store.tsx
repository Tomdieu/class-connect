import { SubjectType } from '@/types';
import {create} from 'zustand';

type SubjectStore = {
    subject?:SubjectType,
    classId?:number,
    isOpen:boolean,
    onAdd:(classId:number) => void,
    setSubject:(subject:SubjectType) => void,
    onOpen:() => void,
    onClose:() => void,
}

export const useSubjectStore = create<SubjectStore>((set) => ({
    subject:undefined,
    isOpen:false,
    classId:undefined,
    setSubject:(subject) => set({subject:subject,isOpen:true}),
    onOpen:() => set({isOpen:true}),
    onClose:() => set({isOpen:false,subject:undefined,classId:undefined}),
    onAdd:(classId) => set({isOpen:true,classId:classId}),
}));