"use server";

import api from "@/services/api";
import { auth } from "@/auth";
import axios from "axios";

export const getPayments = async () => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get("/api/payments/");
    return response.data;
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
