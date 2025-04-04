"use server";

import api from "@/services/api";
import { auth } from "@/auth";
import { AxiosError } from "axios";
import { Action } from "sonner";
import { ActivityLogType } from "@/types";


type Params = {
    user:string; //user id
}

export const listActivities  =async (params?:Params) =>{
    try {
        const session = await auth();
        if (!session?.user) throw Error("Unauthorize user!");

        const response = await api.get("/api/accounts/activity-logs/", {
            headers: {
                Authorization: `Bearer ${session?.user.accessToken}`,
                "Content-Type": "application/json",
            },
            params
        });
        return response.data as ActivityLogType[];
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

export const getActivityFromId = async (id: string) => {
    try {
        const session = await auth();
        if (!session?.user) throw Error("Unauthorize user!");

        const response = await api.get(`/api/accounts/activity-logs/${id}/`, {
            headers: {
                Authorization: `Bearer ${session?.user.accessToken}`,
                "Content-Type": "application/json",
            },
        });
        return response.data as ActivityLogType;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}