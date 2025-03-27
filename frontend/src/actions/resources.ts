"use server";
import { auth } from "@/auth";
import api from "@/services/api";
import { AbstractResourceType, PDFResourceType, VideoResourceType, ExerciseResourceType, RevisionResourceType } from "@/types";
import { AxiosError } from "axios";

export const getResourceFromId = async (resourceId: string) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorized user!");
    
    const response = await api.get(`/api/resources/${resourceId}/`, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    
    // The API response may be nested with a 'resource' field
    const data = response.data;
    
    // Check if the response has a 'resource' field
    const resourceData = data.resource || data;
    
    // Return the appropriate type based on the resource_type
    switch (resourceData.resource_type) {
      case 'PDFResource':
        return resourceData as PDFResourceType;
      case 'VideoResource':
        return resourceData as VideoResourceType;
      case 'ExerciseResource':
        return resourceData as ExerciseResourceType;
      case 'RevisionResource':
        return resourceData as RevisionResourceType;
      default:
        return resourceData as AbstractResourceType;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};
