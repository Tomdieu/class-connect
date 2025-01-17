"use client";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
} from "@/components/ui/credenza";
import {
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
import { BookOpen } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
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

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

type LoginSchemaType = z.infer<typeof loginSchema>;
type ForgetEmailSchemaType = z.infer<typeof forgotPasswordSchema>;

function LoginDialog() {
  const { isLoginOpen, closeDialog } = useAuthDialog();
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const t = useI18n();

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    mode:"onSubmit"
  });

  const forgetPasswordForm = useForm<ForgetEmailSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
     mode:"onSubmit"
  });

  const handleLoginSubmit = (values: LoginSchemaType) => {};

  const handleForgotPasswordSubmit = () => {};

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
          <Form {...forgetPasswordForm}>
            <form
              onSubmit={form.handleSubmit(handleForgotPasswordSubmit)}
              className="flex flex-col gap-2 px-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("loginDialog.emailLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">{t("loginDialog.sendResetLinkButton")}</Button>
              <Button
                type="button"
                variant={"link"}
                onClick={() => setIsResettingPassword(false)}
              >
                {t("loginDialog.backToLoginButton")}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleLoginSubmit)}
              className="flex flex-col gap-2 px-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("loginDialog.emailLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("loginDialog.passwordLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">{t("loginDialog.loginButton")}</Button>
              <Button
                type="button"
                variant={"link"}
                onClick={() => setIsResettingPassword(true)}
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
