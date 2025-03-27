"use server";

import api from "@/services/api";
import { auth } from "@/auth";

import { UserType, UserCreateType, ChangePasswordType, UserStats } from "@/types";
import { AxiosError } from "axios";

export const getAccountInfor = async (token: string) => {
  try {
    const response = await api.get("/api/accounts/users/info/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as UserType;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const registerUser = async (data: UserCreateType) => {
  try {
    const response = await api.post("/api/accounts/users/", data);
    return response.data as UserType;
  } catch (error: any) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getUsers = async ({
  params,
}: {
  params?: Partial<UserParams>;
} = {}) => {
  // Make the entire parameter object optional with defaults
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.get(`/api/accounts/users/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
      params,
    });

    // Ensure we always return an array
    const data = (await res.data) as UserType[];
    return data.length ? data : [];
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getUser = async (id: string) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.get(`/api/accounts/users/${id}/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = (await res.data) as UserType;
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const updateUser = async ({
  id,
  body,
}: {
  id: number | string;
  body: Partial<UserCreateType>;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.patch(`/api/accounts/users/${id}/`, body, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = (await res.data) as UserType;
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const updateUserAvatar = async ({
  id,
  avatar,
}: {
  id: number | string;
  avatar: File;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const form = new FormData();
    form.append("avatar", avatar);

    const res = await api.patch(`/api/accounts/users/${id}/`, form, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "multipart/form-data",
      },
    });
    const data = (await res.data) as UserType;
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const deleteUser = async (id: number | string) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.delete(`/api/accounts/users/${id}/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const changePassword = async ({
  id,
  body,
}: {
  id: number | string;
  body: ChangePasswordType;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.post(
      `/api/accounts/users/${id}/change-password/`,
      body,
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = (await res.data) as { status: string };
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const validatePhoneNumber = async ({
  phone_number,
}: {
  phone_number: string;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.post(`/api/accounts/validate-phone/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
      data: { phone_number },
    });
    const data = (await res.data) as { valid: boolean };
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const verifyPasword = async ({ password }: { password: string }) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.post(
      `/api/accounts/verify-password/`,
      { password },
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = (await res.data) as { valid: boolean };
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

// region Email verification

export const checkMail = async ({ email }: { email: string }) => {
  try {
    const res = await api.get(`/api/accounts/check-email/${email}/`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = (await res.data) as { exists: boolean };
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const resentVerificationLink = async ({
  params,
}: {
  params: { email: string };
}) => {
  try {
    const res = await api.get(`/api/accounts/resend-verification/`, {
      headers: {
        "Content-Type": "application/json",
      },
      params,
    });
    const data = (await res.data) as { status: string };
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

// region Password Reset

export const confirmResetPassword = async ({
  body,
}: {
  body: { code: string; new_password: string; confirm_password: string };
}) => {
  try {
    const res = await api.post(`/api/accounts/password-reset-confirm/`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = (await res.data) as { status: string };
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const sendResetPasswordEmailLink = async ({
  email,
}: {
  email: string;
}) => {
  try {
    const res = await api.post(
      `/api/accounts/password-reset/`,
      { email },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = (await res.data) as { exists: boolean };
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const verifyCode = async ({ code }: { code: string }) => {
  try {
    const res = await api.post(`/api/accounts/verify-code/${code}/`, null, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = (await res.data) as { exists: boolean };
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getUserStats = async () => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorized user!");

    const res = await api.get(`/api/accounts/users/stats/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return res.data as UserStats;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw JSON.stringify(axiosError.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};
