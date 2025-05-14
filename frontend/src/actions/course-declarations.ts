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


export const getCourseDeclarationsOfTeacher = async (
  params?: Partial<{
    status: "PENDING"|"ACCEPTED"|"REJECTED"|"PAID";
    declaration_date_after: string;
    declaration_date_before: string;
    user_id: string;
  }>
) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const response = await api.get("/api/course-declarations/", {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
      },
      params: { ...params, user_id:params?.user_id },
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

export const updateCourseDeclarationStatus = async (
  declarationId: number,
  newStatus: "PENDING"|"ACCEPTED"|"REJECTED"
) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorized user!");

    // First check if the declaration has been paid or is already rejected
    const response = await api.get(`/api/course-declarations/${declarationId}/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
      }
    });
    
    const declaration = response.data as CourseDeclarationType;
    
    // If the declaration has a proof of payment, don't allow status changes
    if (declaration.proof_of_payment) {
      throw Error("Cannot modify status of a paid declaration");
    }
    
    // If the declaration is already rejected, don't allow status changes
    if (declaration.status === "REJECTED") {
      throw Error("Cannot modify status of a rejected declaration");
    }
    
    // If not paid or rejected, proceed with the status update
    const updateResponse = await api.patch(`/api/course-declarations/${declarationId}/`, 
      { status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        }
      }
    );
    
    return updateResponse.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};
