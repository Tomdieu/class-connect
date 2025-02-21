"use server"
import { auth } from "@/auth";
import api from "@/services/api";
import { Stats } from "@/types";
import axios from "axios";

export const getStats = async () => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get("/api/stats/", {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    return response.data as Stats;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Type guard for Axios errors
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    throw error;
  }
};
