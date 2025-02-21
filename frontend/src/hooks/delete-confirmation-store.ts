import { create } from 'zustand';

interface DeleteConfirmationStore {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onOpen: (params: { title: string; description: string; onConfirm: () => void }) => void;
  close: () => void;
}

export const useDeleteConfirmationStore = create<DeleteConfirmationStore>((set) => ({
  isOpen: false,
  title: '',
  description: '',
  onConfirm: () => {},
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  onOpen: ({ title, description, onConfirm }) => 
    set({ isOpen: true, title, description, onConfirm }),
  close: () => set({ 
    isOpen: false, 
    title: '', 
    description: '', 
    onConfirm: () => {},
    isLoading: false 
  }),
}));
