import { create } from 'zustand'

interface ViewPDFStore {
  isOpen: boolean
  pdfUrl: string | null
  setIsOpen: (isOpen: boolean) => void
  setPdfUrl: (url: string | null) => void
}

export const useViewPDFStore = create<ViewPDFStore>((set) => ({
  isOpen: false,
  pdfUrl: null,
  setIsOpen: (isOpen) => set({ isOpen }),
  setPdfUrl: (url) => set({ 
    pdfUrl: url,
    isOpen: url !== null 
  }),
}))