import { create } from 'zustand';
import { getCurrentPlan } from '@/actions/payments';
import { SubscriptionDetail } from '@/types';

interface SubscriptionState {
  isLoading: boolean;
  hasActiveSubscription: boolean;
  subscription: SubscriptionDetail | null;
  fetchSubscription: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => {
  const fetchSubscription = async () => {
    try {
      const data = await getCurrentPlan();
      set({
        subscription: data.subscription || null,
        hasActiveSubscription: data.has_active_subscription,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch subscription", error);
      set({ hasActiveSubscription: false, subscription: null, isLoading: false });
    }
  };

  // Fetch the initial subscription data
  fetchSubscription();

  // Set up polling only in the browser and add cleanup
  if (typeof window !== "undefined") {
    const interval = setInterval(fetchSubscription, 30000);
    window.addEventListener("beforeunload", () => clearInterval(interval));
  }

  return {
    isLoading: true,
    hasActiveSubscription: false,
    subscription: null,
    fetchSubscription,
  };
});
