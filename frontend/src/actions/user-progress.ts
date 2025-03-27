"use server";

import { auth } from "@/auth";
import api from "@/services/api";
import { UserProgressType } from "@/types";
import { AxiosError } from "axios";

interface UpdateProgressParams {
  resource_id: number;
  topic_id: number;
  progress_percentage: number;
  completed: boolean;
  current_page?: number;
  total_pages?: number;
  current_time?: number;
  total_duration?: number;
}

export const getUserProgress = async (resourceId: number) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorized user!");
    
    const res = await api.get(`/api/progress/${resourceId}/`, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    
    return res.data as UserProgressType;
  } catch (error: unknown) {
    // If 404, user hasn't viewed this resource yet, which is fine
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return null;
    }
    
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const updateUserProgress = async (params: UpdateProgressParams) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorized user!");
    
    const { resource_id, ...progressData } = params;
    
    const res = await api.post(`/api/progress/${resource_id}/`, progressData, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    
    return res.data as UserProgressType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};
