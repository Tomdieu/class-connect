"use server";

import api from "@/services/api";
import { auth } from "@/auth";
import { AxiosError } from "axios";
import { OnlineCourseCreateType, OnlineCourseType } from "@/types";

type Params = {
  instructor: string; //user id
  status: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";
  start_time: number;
  duration_minutes: number;
};

export const listOnlineCourses = async (params?: Partial<Params>) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const response = await api.get("/api/online-courses/", {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
      params,
    });
    return response.data as OnlineCourseType[];
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getOnlineCourseFromId = async (id: string) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const response = await api.get(`/api/online-courses/${id}/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as OnlineCourseType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getOnlineCourseFromByCode = async (code: string) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const response = await api.get(`/api/online-courses/code/${code}/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as OnlineCourseType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const createOnlineCourse = async (course: OnlineCourseCreateType) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const response = await api.post("/api/online-courses/", course, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as OnlineCourseType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const deleteOnlineCourse = async (courseId: string) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const response = await api.delete(`/api/online-courses/${courseId}/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as OnlineCourseType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const addAttendeeToOnlineCourse = async (
  courseId: string,
  user_ids: string[]
) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const response = await api.post(
      `/api/online-courses/${courseId}/add-attendees/`,
      { user_ids },
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data as OnlineCourseType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const removeAttendeeFromOnlineCourse = async (
  courseId: string,
  user_ids: string[]
) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const response = await api.post(
      `/api/online-courses/${courseId}/remove-attendees/`,
      { user_ids },
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data as OnlineCourseType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};
