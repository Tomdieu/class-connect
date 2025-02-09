import { SubscriptionPlan } from '@/types';
import { create } from 'zustand';

type PlanStore = {
    plan?: SubscriptionPlan;
    isOpen: boolean;
    onAdd: () => void;
    setPlan: (plan: SubscriptionPlan) => void;
    onOpen: () => void;
    onClose: () => void;
};

export const usePlanStore = create<PlanStore>((set) => ({
    plan: undefined,
    isOpen: false,
    setPlan: (plan: SubscriptionPlan) => set({ plan, isOpen: true }),
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false, plan: undefined }),
    onAdd: () => set({ isOpen: true }),
}));
