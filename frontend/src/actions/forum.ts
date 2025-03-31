"use server";
import { auth } from "@/auth";
import api from "@/services/api";
import { ForumCreateType, ForumType, MessageCreateType, MessagesType, SeenType } from "@/types";
import { AxiosError } from "axios";

// region Public chat

export const getPublicChat = async () => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get("/api/public-chat/", {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as ForumType[];
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

// region Forums

export const listForums = async () => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get("/api/forums/", {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as ForumType[];
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const createForum = async (forum: ForumCreateType) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.post("/api/forums/", forum, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as ForumType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getForum = async (forumId: string) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get(`/api/forums/${forumId}/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as ForumType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const updateForum = async (forum: ForumType) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.patch(`/api/forums/${forum.id}/`, forum, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as ForumType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const deleteForum = async (forumId: string) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.delete(`/api/forums/${forumId}/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as ForumType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

// region Forum mesage

export const listForumMessages = async (forumId: string) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get(`/api/forums/${forumId}/messages/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as MessagesType[];
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const createForumMessage = async (
  forumId: string | number,
  data: MessageCreateType
) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const form = new FormData();
    form.append("forum", forumId.toString());
    form.append("content", data.content);
    
    // Check if this message is a reply to another message
    if (data.parent) {
      // Make sure we're sending the correct parent ID
      // If parent is an object, extract its ID, otherwise use the value directly
      const parentId = typeof data.parent === 'object' && data.parent !== null 
                      ? data.parent.id.toString() 
                      : data.parent.toString();
      form.append("parent_id", parentId);
    }

    if (data.file) {
      form.append("file", data.file);
    }

    const response = await api.post(`/api/forums/${forumId}/messages/`, form, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
      },
    });
    return response.data as MessagesType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
        console.log(axiosError.response.data)
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const deleteForumMessage = async (
  forumId: string,
  messageId: string
) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.delete(
      `/api/forums/${forumId}/messages/${messageId}/`,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const updateForumMessage = async (
  forumId: string,
  messageId: string,
  data: MessageCreateType
) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const form = new FormData();
    form.append("forum", forumId);
    form.append("content", data.content);
    
    // Similar improvement for handling parent ID in updates
    if (data.parent) {
      // Make sure we're sending the correct parent ID
      const parentId = typeof data.parent === 'object' && data.parent !== null 
                      ? data.parent.id.toString() 
                      : data.parent.toString();
      form.append("parent_id", parentId);
    }
    
    if (data.file) {
      form.append("file", data.file);
    }

    const response = await api.patch(
      `/api/forums/${forumId}/messages/${messageId}/`,
      form,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      }
    );
    return response.data as MessagesType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const markMessageSeenByUser = async (
  forumId: string,
  messageId: string
) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.post(
      `/api/forums/${forumId}/messages/${messageId}/seen/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data as SeenType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};


export const listUsersWhoSawMessage = async (forumId:string,messageId:string)=>{
    try {
        const session = await auth();
        if (!session?.user) throw Error("Unauthorize user!");
        const response = await api.get(
          `/api/forums/${forumId}/messages/${messageId}/seen/`,
          {
            headers: {
              Authorization: `Bearer ${session?.user.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        return response.data as SeenType[];
      } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
          throw JSON.stringify(axiosError.response.data);
        }
        throw JSON.stringify({ message: "An unexpected error occurred" });
      } 
}