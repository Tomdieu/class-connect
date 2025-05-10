import { create } from 'zustand';
import { getCurrentPlan } from '@/actions/payments';

interface SubscriptionState {
  hasActiveSubscription: boolean | null;
  currentPlan: any | null;
  isLoading: boolean;
  error: Error | null;
  initialized: boolean; // Add initialization tracking
  fetchSubscription: () => Promise<void>;
  setInitialized: () => void; // Add method to mark as initialized
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  hasActiveSubscription: null,
  currentPlan: null,
  isLoading: true,
  error: null,
  initialized: false, // Track if the store has been initialized
  
  fetchSubscription: async () => {
    // If already initialized, don't fetch again on initial render
    if (!get().initialized) return;
    
    set({ isLoading: true });
    try {
      const plan = await getCurrentPlan();
      set({ 
        hasActiveSubscription: !!plan, 
        currentPlan: plan, 
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({ 
        error: error as Error, 
        isLoading: false,
        hasActiveSubscription: false, 
        currentPlan: null
      });
    }
  },
  
  // Method to mark store as initialized
  setInitialized: () => set({ initialized: true }),
}));
