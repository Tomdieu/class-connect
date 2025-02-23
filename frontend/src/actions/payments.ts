"use server";

import api from "@/services/api";
import { auth } from "@/auth";
import axios from "axios";
import {
  PaginationType,
  Payments,
  Subscription,
  SubscriptionDetail,
  SubscriptionPlan,
  TransactionFilterParams,
  TransactionListResponse,
} from "@/types";

interface SubscriptionError {
  error: string;
  active?: boolean;
}

// region Payments

export const getPayments = async () => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get("/api/payments/", {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    return response.data as Payments[];
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const subscribeToPlan = async ({
  plan,
  success_url,
  failure_url,
  phone_number,
  payment_method,
}: {
  plan: "basic" | "standard" | "premium";
  success_url: string;
  failure_url: string;
  phone_number: string;
  payment_method: "MTN" | "ORANGE";
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorized user!");

    const response = await api.post(
      `/api/plans/${plan}/payment-link/`,
      {
        success_url,
        failure_url,
        phone_number: `237${phone_number}`,
        payment_method,
      },
      {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      }
    );

    return response.data as { payment_link: string };
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

// region subscription plan

export const getSubscriptionPlan = async () => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get("/api/plans/", {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    return response.data as SubscriptionPlan[];
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const addSubscriptionPlan = async (plan: SubscriptionPlan) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    if (!session.user.is_superuser) throw Error("Unauthorize user!");
    const response = await api.post("/api/plans/", plan, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    return response.data as SubscriptionPlan;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const updateSubscriptionPlan = async (
  id: number,
  plan: Partial<SubscriptionPlan>
) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    if (!session.user.is_superuser) throw Error("Unauthorize user!");
    const response = await api.patch(`/api/plans/${id}/`, plan, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    return response.data as SubscriptionPlan;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const deleteSubscriptionPlan = async (id: number) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    if (!session.user.is_superuser) throw Error("Unauthorize user!");
    const response = await api.delete(`/api/plans/${id}/`, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    return response.data as SubscriptionPlan;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

// region subscriptions

export const listSubscriptions = async () => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get("/api/subscriptions/", {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    return response.data as SubscriptionDetail[];
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getSubscription = async (id: number) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get(`/api/subscriptions/${id}/`, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    return response.data as Subscription;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getCurrentPlan = async () => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get("/api/current-plan/", {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    return response.data as {subscription?:SubscriptionDetail,has_active_subscription:boolean};
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getUserPlan = async (accessToken:string) => {
  try {
    const response = await api.get("/api/current-plan/", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data as {subscription?:SubscriptionDetail,has_active_subscription:boolean};
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

export const getSubscriptionHistory = async () => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get(`/api/subscription-history/`, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    return response.data as PaginationType<SubscriptionDetail>;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};

// region Transactions

export const listTransactions = async ({
  params,
}: {
  params?: TransactionFilterParams;
}) => {
  try {
    const session = await auth();
    if (!session?.user) throw Error("Unauthorize user!");
    const response = await api.get("/api/transactions/", {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      params,
    });
    return response.data as TransactionListResponse;
  } catch (error) {
    // Extract error details from the Axios error response
    if (error.response?.data) {
      throw JSON.stringify(error.response.data);
    }
    throw JSON.stringify({ message: "An unexpected error occurred" });
  }
};
