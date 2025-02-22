"use server";

import api from "@/services/api";
import { auth } from "@/auth";

import {
  UserType,
  UserCreateType,
  PaginationType,
  ChangePasswordType,
} from "@/types";
import axios from "axios";

export const getAccountInfor = async (token: string) => {
  try {
    const response = await api.get("/api/accounts/users/info/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as UserType;
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

export const registerUser = async (data: UserCreateType) => {
  try {
    const response = await api.get("/api/accounts/users/", {
      method: "POST",
      data: JSON.stringify(data),
    });
    return response.data as UserType;
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

export const getUsers = async ({
  params
}: {
  params?: UserParams;
} = {}) => {  // Make the entire parameter object optional with defaults
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

export const getUser = async (id: number) => {
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

export const updateUser = async ({
  id,
  body,
}: {
  id: number | string;
  body: UserCreateType;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.patch(`/api/accounts/users/${id}/`,body, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = (await res.data) as UserType;
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

export const deleteUser = async (id: number) => {
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

    const res = await api.post(`/api/accounts/users/${id}/change-password/`,body, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      }
    });
    const data = (await res.data) as { status: string };
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

export const validatePhoneNumber = async ({
  phone_number,
}: {
  phone_number: string;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.post(`/accounts/validate-phone/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
      data: { phone_number },
    });
    const data = (await res.data) as { valid: boolean };
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

export const verifyPasword = async ({ password }: { password: string }) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.post(
      `/accounts/verify-password/`,
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

// region Email verification

export const checkMail = async ({ email }: { email: string }) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.get(`/accounts/check-email/${email}/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = (await res.data) as { exists: boolean };
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


export const resentVerificationLink = async ({
  params,
}: {
  params: { email: string };
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.get(`/accounts/resend-verification/`, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
      params,
    });
    const data = (await res.data) as { status: string };
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

// region Password Reset

export const confirmResetPassword = async ({
  body,
}: {
  body: { code: string; new_password: string; confirm_password: string };
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.post(`/accounts/password-reset-confirm/`, body, {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = (await res.data) as { status: string };
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


export const sendResetPasswordEmailLinl = async ({
  email,
}: {
  email: string;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");

    const res = await api.post(
      `/accounts/password-reset/`,
      { email },
      {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = (await res.data) as { exists: boolean };
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

export const verifyCode = async ({code}:{code:string}) => {
  
}