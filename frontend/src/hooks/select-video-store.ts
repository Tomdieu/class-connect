import { create } from 'zustand';
import {VideoResourceType} from "@/types";

interface SelectVideoStore {
    video?: VideoResourceType;
    isOpen: boolean;
    setVideoUrl: (video:VideoResourceType) => void;
    onClose: () => void;
}

export const useSelectVideoStore = create<SelectVideoStore>((set) => ({
    video: undefined,
    isOpen: false,
    setVideoUrl: (video) => set({ video, isOpen: true }),
    onClose: () => set({ video: undefined, isOpen: false }),
}));