import { create } from "zustand";
import { AbstractResourceType, ResourceType } from "@/types";

type ResourceStore = {
  isOpen: boolean;
  resourceType?: AbstractResourceType["resource_type"];
  topicId?: number;
  resource?: ResourceType;
  onOpen: (topicId: number) => void;
  setResourceType: (type: AbstractResourceType["resource_type"]) => void;
  onClose: () => void;
  setResource: (resource: ResourceType) => void;
};

export const useResourceStore = create<ResourceStore>((set) => ({
  isOpen: false,
  resourceType: undefined,
  topicId: undefined,
  resource: undefined,
  onOpen: (topicId) => set({ isOpen: true, topicId }),
  setResourceType: (resourceType) => set({ resourceType }),
  onClose: () =>
    set({
      isOpen: false,
      resourceType: undefined,
      topicId: undefined,
      resource: undefined,
    }),
  setResource: (resource) => set({ resource, isOpen: true }),
}));