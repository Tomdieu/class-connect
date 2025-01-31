import { TopicType } from "@/types";
import { create } from "zustand";

type TopicStore = {
  topic?: TopicType;
  isOpen: boolean;
  chapterId?: string | number;
  subjectId?: string | number;
  classId?: string | number;
  onAdd: ({
    chapterId,
    classId,
    subjectId,
  }: {
    classId: string | number;
    subjectId: string | number;
    chapterId: string | number;
  }) => void;
  setTopic: ({
    classId,
    subjectId,
    topic,
  }: {
    topic: TopicType;
    classId: string | number;
    subjectId: string | number;
    chapterId: string | number;
  }) => void;
  onClose: () => void;
};

export const useTopicStore = create<TopicStore>((set) => ({
  topic: undefined,
  isOpen: false,
  chapterId: undefined,
  subjectId: undefined,
  classId: undefined,
  onAdd: ({ chapterId, classId, subjectId }) =>
    set({ isOpen: true, chapterId, classId, subjectId }),
  setTopic: ({ classId, subjectId, topic,chapterId }) =>
    set({ topic: topic, isOpen: true, classId, subjectId,chapterId }),
  onClose: () =>
    set({
      isOpen: false,
      topic: undefined,
      chapterId: undefined,
      subjectId: undefined,
      classId: undefined,
    }),
}));
