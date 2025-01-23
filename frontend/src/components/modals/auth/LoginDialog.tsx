"use client";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
} from "@/components/ui/credenza";
import { DialogTitle } from "@/components/ui/dialog";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
import { BookOpen } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useI18n } from "@/locales/client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function LoginDialog() {
  const { isLoginOpen, closeDialog } = useAuthDialog();
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const t = useI18n();
  const router = useRouter();

  // Create login schema with translations
  const createLoginSchema = (t: (key: string) => string) =>
    z.object({
      email: z
        .string()
        .min(1, { message: t("loginDialog.errors.emailRequired") })
        .email({ message: t("loginDialog.errors.emailInvalid") }),
      password: z
        .string()
        .min(1, { message: t("loginDialog.errors.passwordRequired") }),
    });

  // Create forgot password schema with translations
  const createForgotPasswordSchema = (t: (key: string) => string) =>
    z.object({
      email: z
        .string()
        .min(1, { message: t("loginDialog.errors.emailRequired") })
        .email({ message: t("loginDialog.errors.emailInvalid") }),
    });

  // Types for our form data
  type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;
  type ForgotPasswordFormData = z.infer<
    ReturnType<typeof createForgotPasswordSchema>
  >;

  // Initialize login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(createLoginSchema(t as keyof typeof t)),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Initialize forgot password form
  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(createForgotPasswordSchema(t as keyof typeof t)),
    mode: "onSubmit",
    defaultValues: {
      email: "",
    },
  });

  // Update form validation whenever language changes
  useEffect(() => {
    loginForm.clearErrors();
    forgotPasswordForm.clearErrors();
    // Re-validate with new translations if fields are dirty
    if (loginForm.formState.isDirty) {
      loginForm.trigger();
    }
    if (forgotPasswordForm.formState.isDirty) {
      forgotPasswordForm.trigger();
    }
  }, [t]);

  const handleLoginSubmit = async (values: LoginFormData) => {
    try {
      const res = await signIn("credentials", { ...values, redirect: false });
      console.log(res)
      if (res && res.ok && !res.error) {
        closeDialog(false)
        router.refresh();
        toast("Login successfull");
        if (res.url) {
          const url = new URL(res.url);
          const callbackUrl = url.searchParams.get("callbackUrl");
          if (callbackUrl) {
            const decodedCallbackUrl = decodeURIComponent(callbackUrl);

            router.push(decodedCallbackUrl);
          } else {
            router.push("/dashboard");
          }
        }
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleForgotPasswordSubmit = async (values: ForgotPasswordFormData) => {
    try {
      // Handle forgot password logic here
      console.log("Forgot password submit:", values);
    } catch (error) {
      console.error("Forgot password error:", error);
    }
  };

  // Reset forms when switching between login and forgot password
  const handleSwitchToForgotPassword = () => {
    loginForm.reset();
    setIsResettingPassword(true);
  };

  const handleSwitchToLogin = () => {
    forgotPasswordForm.reset();
    setIsResettingPassword(false);
  };

  return (
    <Credenza open={isLoginOpen} onOpenChange={closeDialog}>
      <CredenzaContent className="max-w-sm">
        <CredenzaHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 rounded-full bg-blue-100">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              {isResettingPassword
                ? t("loginDialog.resetPasswordTitle")
                : t("loginDialog.title")}
            </DialogTitle>
            {!isResettingPassword && (
              <p className="text-sm text-gray-500 text-center">
                {t("loginDialog.subtitle")}
              </p>
            )}
          </div>
        </CredenzaHeader>

        {isResettingPassword ? (
          <Form {...forgotPasswordForm}>
            <form
              onSubmit={forgotPasswordForm.handleSubmit(
                handleForgotPasswordSubmit
              )}
              className="flex flex-col gap-2 px-4"
            >
              <FormField
                control={forgotPasswordForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("loginDialog.emailLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={forgotPasswordForm.formState.isSubmitting}
              >
                {t("loginDialog.sendResetLinkButton")}
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={handleSwitchToLogin}
                disabled={forgotPasswordForm.formState.isSubmitting}
              >
                {t("loginDialog.backToLoginButton")}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
              className="flex flex-col gap-2 px-4"
            >
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("loginDialog.emailLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("loginDialog.passwordLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loginForm.formState.isSubmitting}>
                {t("loginDialog.loginButton")}
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={handleSwitchToForgotPassword}
                disabled={loginForm.formState.isSubmitting}
              >
                {t("loginDialog.forgotPasswordButton")}
              </Button>
            </form>
          </Form>
        )}
      </CredenzaContent>
    </Credenza>
  );
}

export default LoginDialog;