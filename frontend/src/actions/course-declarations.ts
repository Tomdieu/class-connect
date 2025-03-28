"use server";

import api from "@/services/api";
import { auth } from "@/auth";
import { AxiosError } from "axios";
import { CourseDeclarationType } from "@/types";

export const getTeacherCourseDeclarations = async (
  params?: Partial<{
    status: "PENDING"|"ACCEPTED"|"REJECTED"|"PAID";
    declaration_date_after: string;
    declaration_date_before: string;
  }>
) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const response = await api.get("/api/course-declarations/", {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
      },
      params: { ...params, user_id: session.user.id },
    });
    return response.data as CourseDeclarationType[];
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};
