"use server";
import { auth } from "@/auth";
import api from "@/services/api";
import { SubjectType, UserClassCreateType, UserClassType } from "@/types";
import { AxiosError } from "axios";

// region User Classes

export const listUserClasses = async () => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get("/api/user-classes/", {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as UserClassType[];
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const createUserClass = async (data: UserClassCreateType) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.post("/api/user-classes/", data, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as UserClassType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getUserClass = async (id: number) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get(`/api/user-classes/${id}/`, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as UserClassType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const updateUserClass = async (
  id: number,
  data: UserClassCreateType
) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.put(`/api/user-classes/${id}/`, data, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as UserClassType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const deleteUserClass = async (id: number) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    await api.delete(`/api/user-classes/${id}/`, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getMyClass = async () => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorized user!");

    const res = await api.get(`/api/user-classes/my-class/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = (await res.data) as UserClassType[];
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getClassSubject = async ({
  params,
}: {
  params: { class_id: number };
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get(`/api/user-classes/class-subjects/`, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        "Content-Type": "application/json",
      },
      params: params
    });
    return response.data as SubjectType[];
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export async function getStudentsByClass(classId: string, schoolYearId?: number) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    // Format school year as "YYYY-YYYY" instead of just the ID
    let params = {};
    if (schoolYearId) {
      const endYear = schoolYearId + 1;
      const formattedSchoolYear = `${schoolYearId}-${endYear}`;
      params = { school_year: formattedSchoolYear };
    }

    const res = await api.get(`/api/classes/${classId}/students/`, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      params
    });

    return res.data as UserClassType[];
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
}

// endregion User Classes


export const getStudentsByClassId = async (params?: { class_level?: string | number, school_year?: string | number, page?: number,no_assign_teacher?:boolean }) => {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const res = await api.get(`/api/user-classes/students-by-class/`, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      params: params
    });

    return res.data as UserClassType[];
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });

  }
}