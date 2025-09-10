"use server";

import api from "@/services/api";
import { auth } from "@/auth";
import { AxiosError } from "axios";
import { DailyVisitorType } from "@/types";


// Create type for visitor data we send (excluding readonly and id fields)
export interface VisitorTrackingData {
  visitor_id: string;
  ip_address: string;
  user_agent: string;
  referrer?: string | null;
  path: string;
  browser_language?: string | null;
  screen_width?: number | null;
  screen_height?: number | null;
}

export const trackUserVisit = async (data: VisitorTrackingData) => {
    try {
        const session = await auth();
        let headers = {};
        
        // Only add authorization header if user is authenticated
        if (session?.user?.accessToken) {
            headers = {
                Authorization: `Bearer ${session.user.accessToken}`
            };
        }

        const response = await api.post("/api/visitors/", data, { headers });
        return response.data;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
};