"use server";
import { auth } from "@/auth";
import api from "@/services/api";
import {
  ActionStatus,
  CourseDeclarationType,
  PaginationType,
  SchoolYearType,
  TeacherStudentEnrollmentType,
} from "@/types";
import { AxiosError } from "axios";

export const listSchoolYear = async () => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get("/api/school-year/", {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    return response.data as SchoolYearType[];
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

type EnrollmentParams = {
  teacher: string;
  offer: number;
  has_class_end: boolean;
  created_at: string;
  school_year: string;
};

export const listEnrollments = async (params?: Partial<EnrollmentParams>) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get("/api/enrollments/", {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      params,
    });
    return response.data as PaginationType<TeacherStudentEnrollmentType>;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getMyStudents = async () => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get("/api/enrollments/my-students/", {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    return response.data as TeacherStudentEnrollmentType[];
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getMyTeachers = async () => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get("/api/enrollments/my-teachers/", {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    return response.data as TeacherStudentEnrollmentType[];
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getErollment = async (id: number) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get(`/api/enrollments/${id}/`, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    return response.data as TeacherStudentEnrollmentType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const updateEnrollment = async ({
  id,
  data,
}: {
  id: number;
  data: Partial<TeacherStudentEnrollmentType>;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.patch(`/api/enrollments/${id}/`, data, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    return response.data as TeacherStudentEnrollmentType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const completeEnrollment = async (id: number) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.post(`/api/enrollments/${id}/`, null, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    return response.data as TeacherStudentEnrollmentType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

// region Course Declarations

export const listEnrollmentDeclarations = async (id: number) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get(`/api/enrollments/${id}/declarations/`, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
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

export const createEnrollmentDeclaration = async ({enrollmentId,data}:{enrollmentId:number,data:{duration:number,declaration_date:string}})=>{
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.post(`/api/enrollments/${enrollmentId}/declarations/`,{...data,teacher_student_enrollment_id:enrollmentId}, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    return response.data as CourseDeclarationType[];
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
}

export const getEnrollmentDeclaration = async (
  id: number,
  declarationId: number
) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get(
      `/api/enrollments/${id}/declarations/${declarationId}/`,
      {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      }
    );
    return response.data as CourseDeclarationType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};


export const updateEnrollmentDeclaration = async ({id,declarationId,data}:{id:number,declarationId:number,data:Partial<CourseDeclarationCreateType>})=>{
  try{
    const session = await auth();
    if(!session?.user) throw Error("Unauthorize user!");
    const response = await api.patch(`/api/enrollments/${id}/declarations/${declarationId}/`,data,{
      headers:{
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    return response.data as CourseDeclarationType;
  }catch(error:unknown){
    const axiosError = error as AxiosError;
    if(axiosError.response?.data){
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({message:"An unexpected error occurred"});
  }
}

export const deleteEnrollmentDeclaration = async (id:number,declarationId:number)=>{
  try{
    const session = await auth();
    if(!session?.user) throw Error("Unauthorize user!");
    const response = await api.delete(`/api/enrollments/${id}/declarations/${declarationId}/`,{
      headers:{
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    return response.data as CourseDeclarationType;
  }catch(error:unknown){
    const axiosError = error as AxiosError;
    if(axiosError.response?.data){
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({message:"An unexpected error occurred"});
  }
}

export const updateEnrollmentDeclarationStatus = async (id:number,declarationId:number,data:{status:Omit<ActionStatus, "CANCELLED">})=>{
  try{
    const session = await auth();
    if(!session?.user) throw Error("Unauthorize user!");
    const response = await api.patch(`/api/enrollments/${id}/declarations/${declarationId}/status/`,data,{
      headers:{
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    return response.data as CourseDeclarationType;
  }catch(error:unknown){
    const axiosError = error as AxiosError;
    if(axiosError.response?.data){
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({message:"An unexpected error occurred"});
  }
}