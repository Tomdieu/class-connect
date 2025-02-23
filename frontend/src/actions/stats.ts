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
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};
