"use server"

import { auth } from "@/auth";
import api from "@/services/api";
import {
    AbstractResourceType,
  ChapterCreateType,
  ChapterType,
  ClassCreateType,
  ClassType,
  SubjectCreateType,
  SubjectType,
  TopicCreateType,
  TopicType,
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
}={}) => {
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
    const data = await res.data ;
    return data as ClassType[];
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
    if (axios.isAxiosError(error)) {
      // Type guard for Axios errors
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    throw error;
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
    if (axios.isAxiosError(error)) {
      // Type guard for Axios errors
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    throw error;
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
    if (axios.isAxiosError(error)) {
      // Type guard for Axios errors
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    throw error;
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
    if (axios.isAxiosError(error)) {
      // Type guard for Axios errors
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    throw error;
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
    if (axios.isAxiosError(error)) {
      // Type guard for Axios errors
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    throw error;
  }
};

export const addSubject = async ({
  class_pk,
  body,
}: {
  class_pk: string|number;
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
    if (axios.isAxiosError(error)) {
      // Type guard for Axios errors
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    throw error;
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
    if (axios.isAxiosError(error)) {
      // Type guard for Axios errors
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    throw error;
  }
};

export const updateSubject = async ({
  class_pk,
  subject_pk,
  body,
}: {
  class_pk: string|number;
  subject_pk: string|number;
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
    if (axios.isAxiosError(error)) {
      // Type guard for Axios errors
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    throw error;
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
    if (axios.isAxiosError(error)) {
      // Type guard for Axios errors
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    throw error;
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
    if (axios.isAxiosError(error)) {
      // Type guard for Axios errors
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    throw error;
  }
};

export const addChapter = async ({
  class_pk,
  subject_pk,
  body,
}: {
  class_pk: string|number;
  subject_pk: string|number;
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
    if (axios.isAxiosError(error)) {
      // Type guard for Axios errors
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    throw error;
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
    if (axios.isAxiosError(error)) {
      // Type guard for Axios errors
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    throw error;
  }
};

export const updateChapter = async ({
  class_pk,
  subject_pk,
  chapter_pk,
  body,
}: {
  class_pk: string|number;
  subject_pk: string|number;
  chapter_pk: string|number;
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
    if (axios.isAxiosError(error)) {
      // Type guard for Axios errors
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    throw error;
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
    if (axios.isAxiosError(error)) {
      // Type guard for Axios errors
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    throw error;
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
    if (axios.isAxiosError(error)) {
      // Type guard for Axios errors
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    throw error;
  }
};

export const addTopic = async ({
  class_pk,
  subject_pk,
  chapter_pk,
  body,
}: {
  class_pk: string|number;
  subject_pk: string|number;
  chapter_pk: string|number;
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
    if (axios.isAxiosError(error)) {
      // Type guard for Axios errors
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    throw error;
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
    if (axios.isAxiosError(error)) {
      // Type guard for Axios errors
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    throw error;
  }
};

export const updateTopic = async ({
  class_pk,
  subject_pk,
  chapter_pk,
  topic_pk,
  body,
}: {
  class_pk: string|number;
  subject_pk: string|number;
  chapter_pk: string|number;
  topic_pk: string|number;
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
    if (axios.isAxiosError(error)) {
      // Type guard for Axios errors
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    throw error;
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
    if (axios.isAxiosError(error)) {
      // Type guard for Axios errors
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    throw error;
  }
};


// region Resources

interface ResourceParams {
    title:string,
    topic:string,
    created_at:string,
    resource_type:string,
    page:number
}

export const listResources = async ({class_pk,subject_pk,chapter_pk,topic_pk,params}:{class_pk:string,subject_pk:string,chapter_pk:string,topic_pk:string,params:ResourceParams})=>{
    try {
        const session = await auth();
        if (!session?.user) throw Error("Unauthorize user!");

        const res = await api.get(`/api/classes/${class_pk}/subjects/${subject_pk}/chapters/${chapter_pk}/topics/${topic_pk}/resources/`, {
            headers: {
                Authorization: `Bearer ${session?.user.accessToken}`,
                "Content-Type": "application/json",
            },
            params,
        });
        const data = (await res.data) as AbstractResourceType[];
        return data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Type guard for Axios errors
            if (error.response && error.response.data) {
                throw error.response.data;
            }
        }
        throw error;
    }
}
