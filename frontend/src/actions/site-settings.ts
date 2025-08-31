"use server";

import api from "@/services/api";
import { auth } from "@/auth";

import { AxiosError } from "axios";
import { SiteSettings } from "@/types";


export const getSiteSettings = async () => {
    try {
        const session = await auth();
        if (!session?.user) throw Error("Unauthorize user!");
        const response = await api.get<SiteSettings>("/api/settings/", {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        });
        return response.data as SiteSettings;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}


export const updateSiteSettings = async (body: Partial<SiteSettings>) => {
    try {
        const session = await auth();
        if (!session?.user) throw Error("Unauthorize user!");
        const response = await api.patch<SiteSettings>("/api/settings/", body, {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
                "Content-Type": "application/json",

            },
        });
        return response.data as SiteSettings;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}
