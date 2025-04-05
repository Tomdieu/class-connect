"use server";
import { auth } from "@/auth";
import api from "@/services/api";
import {
  ForumCreateType,
  ForumType,
  SeenType,
  ReactionType,
  ReactionCountType,
  ReactionType,
  CommentType,
  PostType,
  Message,
  SeenType,
  PostNotificationType,
  ForumNotification,
  CreatePostRequestType,
  UpdatePostRequestType,
  CreateReactionRequestType,
  CreateSeenRequestType,
  UpdateNotificationRequestType,
  ForumListResponseType,
  PostListResponseType,
  NotificationListResponseType,
  PaginatedResponse,
  Reaction,
} from "@/types";
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

// region Forum Posts

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
    return response.data as PaginatedResponse<PostType>;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

// export const createForumMessage = async (
//   forumId: string | number,
//   data: CreatePostRequestType
// ) => {
//   try {
//     const session = await auth();
//     if (!session?.user) throw Error("Unauthorize user!");
//     const form = new FormData();
//     form.append("forum", forumId.toString());
//     form.append("content", data.content);

//     // Check if this message is a reply to another message
//     if (data.parent) {
//       // Make sure we're sending the correct parent ID
//       // If parent is an object, extract its ID, otherwise use the value directly
//       const parentId =
//         typeof data.parent === "object" && data.parent !== null
//           ? data.parent
//           : data.parent.toString();
//       form.append("parent_id", parentId);
//     }

//     if (data.file) {
//       form.append("file", data.file);
//     }
//     if (data.image) {
//       form.append("image", data.image);
//     }

//     const response = await api.post(`/api/forums/${forumId}/messages/`, form, {
//       headers: {
//         Authorization: `Bearer ${session?.user.accessToken}`,
//       },
//     });
//     return response.data as PostType;
//   } catch (error: unknown) {
//     const axiosError = error as AxiosError;
//     if (axiosError.response?.data) {
//       console.log(axiosError.response.data);
//       throw JSON.stringify(axiosError.response.data);
//     }
//     throw JSON.stringify({ message: "An unexpected error occurred" });
//   }
// };

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
  data: UpdatePostRequestType
) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const form = new FormData();
    form.append("forum", forumId);
    if (data.content) {
      form.append("content", data.content);
    }
    if (data.image) {
      form.append("image", data.image);
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
    return response.data as PostType;
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
      { post: messageId },
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

export const listUsersWhoSawMessage = async (
  forumId: string,
  messageId: string
) => {
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
};

// region Post

type PostParams = {
  search: string;
  page: number;
  page_size: number;
  forum: string;
  sender: string; // user id
};

export const getPosts = async (params?: Partial<PostParams>) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get(`/api/posts/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
      params,
    });
    return response.data as PaginatedResponse<PostType>;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const createPost = async (data: CreatePostRequestType) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorized user!");

    // Create FormData object instead of JSON
    const formData = new FormData();

    // Append text fields
    formData.append("forum", data.forum.toString());
    formData.append("content", data.content);

    // Append parent if it exists
    if (data.parent !== undefined && data.parent !== null) {
      formData.append("parent", data.parent.toString());
    }

    // Append file if it exists
    if (data.file) {
      formData.append("file", data.file);
    }

    // Append image if it exists
    if (data.image) {
      formData.append("image", data.image);
    }

    const response = await api.post(`/api/posts/`, formData, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        // Don't set Content-Type here, it will be automatically set with the correct boundary
        // when using FormData
      },
    });

    return response.data as PostType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const updatePost = async (
  postId: number,
  data: UpdatePostRequestType
) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorized user!");

    // Create FormData object
    const formData = new FormData();

    // Only append fields that are defined
    if (data.content !== undefined) {
      formData.append("content", data.content);
    }

    // Handle file field - if null is explicitly passed, we're removing the file
    if (data.file === null) {
      formData.append("file", ""); // Send empty string to clear the file
    } else if (data.file) {
      formData.append("file", data.file);
    }

    // Handle image field - if null is explicitly passed, we're removing the image
    if (data.image === null) {
      formData.append("image", ""); // Send empty string to clear the image
    } else if (data.image) {
      formData.append("image", data.image);
    }

    const response = await api.patch(`/api/posts/${postId}/`, formData, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        // Don't set Content-Type when using FormData
      },
    });

    return response.data as PostType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

/**
 * Fetch comments for a specific post
 * @param postId ID of the post to fetch comments for
 * @param page Optional page number for pagination
 * @param limit Optional limit of comments per page
 */
export const getPostComments = async (
  postId: number,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorized user!");

    const response = await api.get(`/api/posts/${postId}/comments/`, {
      params: {
        page,
        limit,
      },
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
      },
    });

    // The API returns a PaginatedResponse<PostType> structure
    return response.data as PaginatedResponse<PostType>;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const addPostComments = async (
  postId: number,
  data: CreatePostRequestType
) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorized user!");
    console.log({postId,data})

    // Create FormData object
    const formData = new FormData();

    // Only append fields that are defined
    if (data.content !== undefined) {
      formData.append("content", data.content);
    }

    // No need to append parent as the backend handles this
    // The postId parameter is used in the URL, and the backend will use it as the parent post

    // Handle file field - if null is explicitly passed, we're removing the file
    if (data.file === null) {
      formData.append("file", ""); // Send empty string to clear the file
    } else if (data.file) {
      formData.append("file", data.file);
    }

    // Handle image field - if null is explicitly passed, we're removing the image
    if (data.image === null) {
      formData.append("image", ""); // Send empty string to clear the image
    } else if (data.image) {
      formData.append("image", data.image);
    }

    const response = await api.post(
      `/api/posts/${postId}/comment/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          // Don't set Content-Type when using FormData
        },
      }
    );

    return response.data as PostType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

/**
 * Add a reaction to a post
 * @param postId ID of the post to react to
 * @param reactionType Type of reaction (LIKE, LOVE, etc.)
 */
export const addReaction = async (
  postId: number,
  reactionType: ReactionType
) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorized user!");

    const data: CreateReactionRequestType = {
      post: postId,
      user_id: String(session.user.id), // Assuming the session contains user ID
      reaction_type: reactionType,
    };

    const response = await api.post(`/api/posts/${postId}/react/`, data, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data as Reaction;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

/**
 * Remove a reaction from a post
 * @param reactionId ID of the reaction to remove
 */
export const removeReaction = async (postId: number) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorized user!");

    await api.delete(`/api/posts/${postId}/unreact/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
      },
    });

    return true;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

/**
 * Mark a post as viewed by the current user
 * @param postId ID of the post to mark as viewed
 */
export const markPostAsViewed = async (postId: number) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorized user!");

    const response = await api.post(`/api/posts/${postId}/view/`, null, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
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
};

export const deletePost = async (postId: number) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorized user!");

    const response = await api.delete(`/api/posts/${postId}/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
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
};

// region Feed

type FeedParams = {
  page: number;
  page_size: number;
};

export const getFeeds = async (params?: Partial<FeedParams>) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get(`/api/feed/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
      params,
    });
    return response.data as PaginatedResponse<PostType>;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getTrendingFeeds = async (params?: Partial<FeedParams>) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get(`/api/feed/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
      params,
    });
    return response.data as PaginatedResponse<PostType>;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getFeedById = async (id: number) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get(`/api/feed/${id}/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as PostType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

// region Forum notifications

export const getForumNotifications = async () => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get(`/api/fnotifications/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as ForumNotification[];
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};


export const getForumNotificationById = async (id:number) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get(`/api/fnotifications/${id}/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as ForumNotification;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};


export const markNotificationAsRead = async (id:number) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get(`/api/fnotifications/${id}/mark_read/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as ForumNotification;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get(`/api/fnotifications/mark_all_read/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as ForumNotification[];
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
}