"use server";
import { auth } from "@/auth";
import api from "@/services/api";
import { UserAvailabilityType } from "@/types";
import { AxiosError } from "axios";

export const getUserAvailabilty = async () => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get("/api/user-availability/", {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as UserAvailabilityType[];
  } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.data) {
        throw JSON.stringify(axiosError.response.data);
      }
      throw JSON.stringify({ message: "An unexpected error occurred" });
    }
};

export const updateUserAvailability = async (id: number,data:{is_available:boolean}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.patch(`/api/user-availability/${id}/`, data,{
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as UserAvailabilityType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getMyAvailability = async () => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get("/api/user-availability/my_availability/", {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as UserAvailabilityType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getAvailabilityOfUser = async ({
  params,
}: {
  params: { user_id: string };
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get(
      "/api/user-availability/user-availability/",
      {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
          "Content-Type": "application/json",
        },
        params,
      }
    );
    return response.data as UserAvailabilityType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const updateAvailabilityTimeSlot = async ({
  id,
  data,
}: {
  id: number;
  data: { slot_id: number; is_available: boolean };
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.patch(
      `/api/user-availability/${id}/update-time-slot/`,
      data,
      {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data as {status:string};
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};
