"use server";

import api from "@/services/api";
import { auth } from "@/auth";
import { AxiosError } from "axios";
import { ContactCreateType, ContactFilterType, ContactReplyType, ContactType,ContactReplyFilterType } from "@/types";

// region Contacts

export const getContacts = async (params?: ContactFilterType) => {
    try {
        const session = await auth();
        if (!session?.user) throw Error("Unauthorize user!");
        const response = await api.get("/api/contacts/", {
            params,
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        });
        return response.data as ContactType[];
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

export const getContactById = async (id: number) => {
    try {
        const session = await auth();
        if (!session?.user) throw Error("Unauthorize user!");
        const response = await api.get(`/api/contacts/${id}/`, {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        });
        return response.data as ContactType;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

export const addContact = async (contactData: ContactCreateType) => {
    try {
        const session = await auth();
        const headers: Record<string, string> = {};

        // Add authorization header only if user is logged in
        if (session?.user?.accessToken) {
            headers.Authorization = `Bearer ${session.user.accessToken}`;
        }

        const response = await api.post("/api/contacts/", contactData, {
            headers
        });
        return response.data as ContactType
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

export const deleteContact = async (id: number) => {
    try {
        const session = await auth();
        if (!session?.user) throw Error("Unauthorize user!");
        const response = await api.delete(`/api/contacts/${id}/`, {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        });
        return response.data;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}


export const replyToContact = async (id: number, message: string) => {
    try {
        const session = await auth();
        if (!session?.user) throw Error("Unauthorize user!");
        const response = await api.post(`/api/contacts/${id}/reply/`, { message }, {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
                "Content-Type": "application/json",
            },
        });
        return response.data as ContactReplyType
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}


// region Contacts Replies

export const getContactsReplies = async (params?: ContactReplyFilterType) => {
    try {
        const session = await auth();
        if (!session?.user) throw Error("Unauthorize user!");
        const response = await api.get("/api/contact-replies/", {
            params,
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        });
        return response.data as ContactReplyType[];
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

export const getContactReply = async (id: number) => {
    try {
        const session = await auth();
        if (!session?.user) throw Error("Unauthorize user!");
        const response = await api.get(`/api/contact-replies/${id}/`, {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        });
        return response.data as ContactReplyType;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

export const updateContactReply = async (id: number, message: string) => {
    try {
        const session = await auth();
        if (!session?.user) throw Error("Unauthorize user!");
        const response = await api.put(`/api/contact-replies/${id}/`, { message }, {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
                "Content-Type": "application/json",
            },
        });
        return response.data as ContactReplyType;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}

export const deleteContactReply = async (id: number) => {
    try {
        const session = await auth();
        if (!session?.user) throw Error("Unauthorize user!");
        const response = await api.delete(`/api/contact-replies/${id}/`, {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        });
        return response.data;
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
            throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
    }
}