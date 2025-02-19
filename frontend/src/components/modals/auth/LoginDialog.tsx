"use client";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
} from "@/components/ui/credenza";
import { DialogTitle } from "@/components/ui/dialog";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
import { BookOpen, LoaderCircle } from "lucide-react";
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
  const [isLoading,setIsLoading] = useState(false)

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

  const {formState:{errors}} = loginForm

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
  }, [forgotPasswordForm, loginForm, t]);

  const handleLoginSubmit = async (values: LoginFormData) => {
    try {
      setIsLoading(true)
      const res = await signIn("credentials", { ...values, redirect: false });
      console.log(res)
      if(res?.error == "CredentialsSignin"){
        loginForm.setError("root",{message:t("loginDialog.invalidCredential")})
        return;
      }
      if (res && res.ok && !res.error) {
        setIsLoading(false)
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
      <CredenzaContent className="max-w-md p-0 overflow-hidden">
        <div className="relative pt-5">
          {/* Decorative background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100/50" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200/20 rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-200/20 rounded-full filter blur-3xl" />
          </div>

          <div className="relative">
            <CredenzaHeader className="pb-0 text-center space-y-2">
              <div className="mx-auto w-full max-w-sm space-y-6">
                <div className="flex flex-col items-center space-y-4 pb-4">
                  <div className="p-3 rounded-2xl bg-blue-100/80 backdrop-blur-sm">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                  <DialogTitle className="text-2xl font-bold">
                    {isResettingPassword
                      ? t("loginDialog.resetPasswordTitle")
                      : t("loginDialog.title")}
                  </DialogTitle>
                  {!isResettingPassword && (
                    <p className="text-gray-500 text-base max-w-xs">
                      {t("loginDialog.subtitle")}
                    </p>
                  )}
                </div>
              </div>
            </CredenzaHeader>

            {isResettingPassword ? (
              <Form {...forgotPasswordForm}>
                <form
                  onSubmit={forgotPasswordForm.handleSubmit(handleForgotPasswordSubmit)}
                  className="flex flex-col gap-4 p-6"
                >
                  <FormField
                    control={forgotPasswordForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">{t("loginDialog.emailLabel")}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@example.com"
                            className="h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={forgotPasswordForm.formState.isSubmitting}
                    className="bg-default hover:bg-default/90 text-white h-11 rounded-xl font-medium"
                  >
                    {t("loginDialog.sendResetLinkButton")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSwitchToLogin}
                    disabled={forgotPasswordForm.formState.isSubmitting}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {t("loginDialog.backToLoginButton")}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
                  className="flex flex-col gap-4 p-6"
                >
                  {errors.root && (
                    <div className="w-full bg-red-50 border border-red-200 rounded-xl p-3">
                      <span className="text-red-600 text-sm font-medium">{errors.root.message}</span>
                    </div>
                  )}
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">{t("loginDialog.emailLabel")}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@example.com"
                            className="h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">{t("loginDialog.passwordLabel")}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={loginForm.formState.isSubmitting || isLoading}
                    className="bg-default hover:bg-default/90 text-white h-11 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    {isLoading && <LoaderCircle className="h-4 w-4 animate-spin"/>}
                    {t("loginDialog.loginButton")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSwitchToForgotPassword}
                    disabled={loginForm.formState.isSubmitting}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {t("loginDialog.forgotPasswordButton")}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}

export default LoginDialog;