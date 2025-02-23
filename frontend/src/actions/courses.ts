"use server";

import { auth } from "@/auth";
import api from "@/services/api";
import {
  AbstractResourceType,
  ChapterCreateType,
  ChapterType,
  ClassCreateType,
  ClassType,
  ExerciseResourceCreateType,
  ExerciseResourceType,
  PDFResourceCreateType,
  ResourceType,
  RevisionResourceCreateType,
  SchoolStructure,
  SubjectCreateType,
  SubjectType,
  TopicCreateType,
  TopicType,
  VideoResourceCreateType,
  VideoResourceType,
} from "@/types";
import axios from "axios";

// region Classes

interface ClassFilterParams {
  name?: string;
  level?: string;
}

export const listClasses = async ({
  params,
}: {
  params?: ClassFilterParams;
} = {}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.get(`/api/classes/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
      params,
    });
    const data = await res.data;
    return data as ClassType[];
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getformatedClasses = async () => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const res = await api.get(`/api/classes/formatted_classes/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.data;
    return data as SchoolStructure;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getClass = async (id: string) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.get(`/api/classes/${id}/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = (await res.data) as ClassType;
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const addClass = async ({ body }: { body: ClassCreateType }) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.post(`/api/classes/`, body, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = (await res.data) as ClassType;
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const updateClass = async ({
  id,
  body,
}: {
  id: number;
  body: Partial<ClassCreateType>;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.patch(`/api/classes/${id}/`, body, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = (await res.data) as ClassType;
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const deleteClass = async (id: number) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.delete(`/api/classes/${id}/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.data;
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

// region Subjects

interface SubjectFilterParams {
  name: string;
  class_level: string;
  created_at: string;
  page: string;
}

export const listSubjects = async ({
  class_pk,
  params,
}: {
  class_pk: string;
  params?: Partial<SubjectFilterParams>;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.get(`/api/classes/${class_pk}/subjects/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
      params,
    });
    const data = (await res.data) as SubjectType[];
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const addSubject = async ({
  class_pk,
  body,
}: {
  class_pk: string | number;
  body: SubjectCreateType;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.post(`/api/classes/${class_pk}/subjects/`, body, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = (await res.data) as SubjectType;
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getSubject = async ({
  class_pk,
  subject_pk,
}: {
  class_pk: string;
  subject_pk: string;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.get(
      `/api/classes/${class_pk}/subjects/${subject_pk}/`,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = (await res.data) as SubjectType;
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const updateSubject = async ({
  class_pk,
  subject_pk,
  body,
}: {
  class_pk: string | number;
  subject_pk: string | number;
  body: Partial<SubjectType>;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.patch(
      `/api/classes/${class_pk}/subjects/${subject_pk}/`,
      body,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = (await res.data) as SubjectType;
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const deleteSubject = async ({
  class_pk,
  subject_pk,
}: {
  class_pk: string;
  subject_pk: string;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.delete(
      `/api/classes/${class_pk}/subjects/${subject_pk}/`,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.data;
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

// region Chapter

interface ChaptersParams {
  title: string;
  subject: string;
  created_at: string;
  page: number;
}

export const listChapters = async ({
  class_pk,
  subject_pk,
  params,
}: {
  class_pk: string;
  subject_pk: string;
  params?: Partial<ChaptersParams>;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.get(
      `/api/classes/${class_pk}/subjects/${subject_pk}/chapters/`,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
        params,
      }
    );
    const data = (await res.data) as ChapterType[];
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const addChapter = async ({
  class_pk,
  subject_pk,
  body,
}: {
  class_pk: string | number;
  subject_pk: string | number;
  body: ChapterCreateType;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.post(
      `/api/classes/${class_pk}/subjects/${subject_pk}/chapters/`,
      body,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = (await res.data) as ChapterType;
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getChapter = async ({
  class_pk,
  subject_pk,
  chapter_pk,
}: {
  class_pk: string;
  subject_pk: string;
  chapter_pk: string;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.get(
      `/api/classes/${class_pk}/subjects/${subject_pk}/chapters/${chapter_pk}/`,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = (await res.data) as ChapterType;
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const updateChapter = async ({
  class_pk,
  subject_pk,
  chapter_pk,
  body,
}: {
  class_pk: string | number;
  subject_pk: string | number;
  chapter_pk: string | number;
  body: Partial<ChapterType>;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.patch(
      `/api/classes/${class_pk}/subjects/${subject_pk}/chapters/${chapter_pk}/`,
      body,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = (await res.data) as ChapterType;
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const deleteChapter = async ({
  class_pk,
  subject_pk,
  chapter_pk,
}: {
  class_pk: string;
  subject_pk: string;
  chapter_pk: string;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.delete(
      `/api/classes/${class_pk}/subjects/${subject_pk}/chapters/${chapter_pk}/`,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.data;
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

// region Topic

interface TopicParams {
  title: string;
  chapter: string;
  created_at: string;
  page: number;
}

export const listTopics = async ({
  chapter_pk,
  subject_pk,
  class_pk,
  params,
}: {
  class_pk: string;
  subject_pk: string;
  chapter_pk: string;
  params?: TopicParams;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.get(
      `/api/classes/${class_pk}/subjects/${subject_pk}/chapters/${chapter_pk}/topics/`,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
        params,
      }
    );
    const data = (await res.data) as TopicType[];
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const addTopic = async ({
  class_pk,
  subject_pk,
  chapter_pk,
  body,
}: {
  class_pk: string | number;
  subject_pk: string | number;
  chapter_pk: string | number;
  body: TopicCreateType;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.post(
      `/api/classes/${class_pk}/subjects/${subject_pk}/chapters/${chapter_pk}/topics/`,
      body,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = (await res.data) as TopicType;
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getTopic = async ({
  class_pk,
  subject_pk,
  chapter_pk,
  topic_pk,
}: {
  class_pk: string;
  subject_pk: string;
  chapter_pk: string;
  topic_pk: string;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.get(
      `/api/classes/${class_pk}/subjects/${subject_pk}/chapters/${chapter_pk}/topics/${topic_pk}/`,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = (await res.data) as TopicType;
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const updateTopic = async ({
  class_pk,
  subject_pk,
  chapter_pk,
  topic_pk,
  body,
}: {
  class_pk: string | number;
  subject_pk: string | number;
  chapter_pk: string | number;
  topic_pk: string | number;
  body: Partial<TopicCreateType>;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.patch(
      `/api/classes/${class_pk}/subjects/${subject_pk}/chapters/${chapter_pk}/topics/${topic_pk}/`,
      body,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = (await res.data) as TopicType;
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const deleteTopic = async ({
  class_pk,
  subject_pk,
  chapter_pk,
  topic_pk,
}: {
  class_pk: string;
  subject_pk: string;
  chapter_pk: string;
  topic_pk: string;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.delete(
      `/api/classes/${class_pk}/subjects/${subject_pk}/chapters/${chapter_pk}/topics/${topic_pk}/`,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.data;
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

// region Resources

interface ResourceParams {
  title: string;
  topic: string;
  created_at: string;
  resource_type: string;
  page: number;
}

export const listResources = async ({
  class_pk,
  subject_pk,
  chapter_pk,
  topic_pk,
  params,
}: {
  class_pk: string;
  subject_pk: string;
  chapter_pk: string;
  topic_pk: string;
  params?: ResourceParams;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.get(
      `/api/classes/${class_pk}/subjects/${subject_pk}/chapters/${chapter_pk}/topics/${topic_pk}/resources/`,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
        params,
      }
    );
    const data = (await res.data) as ResourceType[];
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};


export const deleteResource = async ({
  class_pk,
  subject_pk,
  chapter_pk,
  topic_pk,
  resource_pk,
}: {
  class_pk: string;
  subject_pk: string;
  chapter_pk: string;
  topic_pk: string;
  resource_pk: string;
})=>{
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.delete(
      `/api/classes/${class_pk}/subjects/${subject_pk}/chapters/${chapter_pk}/topics/${topic_pk}/resources/${resource_pk}/`,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.data;
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    throw error;
  }
}

export const addPdfResource = async ({
  class_pk,
  subject_pk,
  chapter_pk,
  topic_pk,
  resource,
}: {
  class_pk: string | number;
  subject_pk: string | number;
  chapter_pk: string | number;
  topic_pk: string | number;
  resource: PDFResourceCreateType;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const formData = new FormData();
    formData.append("topic", `${topic_pk}`);
    formData.append("title", resource.title);
    formData.append("description", resource.description || "");
    formData.append("pdf_file", resource.pdf_file);

    const res = await api.post(
      `/api/classes/${class_pk}/subjects/${subject_pk}/chapters/${chapter_pk}/topics/${topic_pk}/pdfs/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      }
    );
    const data = (await res.data) as AbstractResourceType;
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const addVideoResource = async ({
  class_pk,
  subject_pk,
  chapter_pk,
  topic_pk,
  resource,
}: {
  class_pk: string | number;
  subject_pk: string | number;
  chapter_pk: string | number;
  topic_pk: string | number;
  resource: VideoResourceCreateType;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const formData = new FormData();
    formData.append("topic", `${topic_pk}`);
    formData.append("title", resource.title);
    formData.append("description", resource.description || "");
    formData.append("video_file", resource.video_file);

    console.log(formData.values());

    const res = await api.post(
      `/api/classes/${class_pk}/subjects/${subject_pk}/chapters/${chapter_pk}/topics/${topic_pk}/videos/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      }
    );
    const data = (await res.data) as AbstractResourceType;
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const addExerciseResource = async ({
  class_pk,
  subject_pk,
  chapter_pk,
  topic_pk,
  resource,
}: {
  class_pk: string | number;
  subject_pk: string | number;
  chapter_pk: string | number;
  topic_pk: string | number;
  resource: ExerciseResourceCreateType;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const formData = new FormData();
    formData.append("topic", `${topic_pk}`);
    formData.append("title", resource.title);
    formData.append("description", resource.description || "");
    formData.append("instructions", resource.instructions);
    formData.append("exercise_file", resource.exercise_file);
    if (resource.solution_file) {
      formData.append("solution_file", resource.solution_file);
    }

    const res = await api.post(
      `/api/classes/${class_pk}/subjects/${subject_pk}/chapters/${chapter_pk}/topics/${topic_pk}/exercises/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      }
    );
    const data = (await res.data) as AbstractResourceType;
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const addRevisionResource = async ({
  class_pk,
  subject_pk,
  chapter_pk,
  topic_pk,
  resource,
}: {
  class_pk: string | number;
  subject_pk: string | number;
  chapter_pk: string | number;
  topic_pk: string | number;
  resource: RevisionResourceCreateType;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const formData = new FormData();
    formData.append("topic", `${topic_pk}`);
    formData.append("title", resource.title);
    formData.append("description", resource.description || "");
    formData.append("content", resource.content);

    const res = await api.post(
      `/api/classes/${class_pk}/subjects/${subject_pk}/chapters/${chapter_pk}/topics/${topic_pk}/revisions/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      }
    );
    const data = (await res.data) as AbstractResourceType;
    return data;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};
