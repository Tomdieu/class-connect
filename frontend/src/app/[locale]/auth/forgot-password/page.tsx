"use client";

import { useCurrentLocale, useI18n } from "@/locales/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  BookOpen, 
  EyeIcon,
  EyeOffIcon,
  KeyIcon,
  LoaderCircle, 
  MailIcon, 
  ShieldCheck 
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Helmet } from "react-helmet-async";
import { confirmResetPassword, sendResetPasswordEmailLink } from "@/actions/accounts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function ForgotPasswordPage() {
  const t = useI18n();
  const router = useRouter();
  const locale = useCurrentLocale();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Base URL with locale
  const baseUrl = `https://www.classconnect.cm/${locale}`;

  // Create schemas for validation
  const emailFormSchema = z.object({
    email: z
      .string()
      .min(1, { message: t("loginDialog.errors.emailRequired") })
      .email({ message: t("loginDialog.errors.emailInvalid") }),
  });

  const resetPasswordFormSchema = z.object({
    resetCode: z.string().min(1, { message: t("passwordReset.missingCode") }),
    newPassword: z
      .string()
      .min(8, { message: t("registerDialog.errors.passwordMin") }),
    confirmPassword: z.string().min(1, { message: t("registerDialog.errors.confirmPasswordRequired") }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t("registerDialog.errors.passwordsMustMatch"),
    path: ["confirmPassword"],
  });

  // Define form types
  type EmailFormValues = z.infer<typeof emailFormSchema>;
  type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

  // Email request form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: "",
    },
  });

  // Password reset form
  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      resetCode: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // JSON-LD structured data for forgot password page - localized
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("passwordReset.requestTitle"),
    description: t("passwordReset.requestDescription"),
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: locale === "fr" ? "Accueil" : "Home",
          item: `https://www.classconnect.cm/${locale}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: t("nav.login"),
          item: `${baseUrl}/auth/login`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: t("passwordReset.requestTitle"),
          item: `${baseUrl}/auth/forgot-password`,
        },
      ],
    },
  };

  // Handle request for reset link
  async function handleRequestReset(values: EmailFormValues) {
    try {
      setIsLoading(true);
      setError(null);

      await sendResetPasswordEmailLink({ email: values.email });
      setResetRequested(true);
      setSuccess(true);
      setEmail(values.email);
      toast.success(t("passwordReset.emailSent"));
      
    } catch (error) {
      console.error("Reset password error:", error);
      setError(t("passwordReset.requestError"));
      toast.error(t("passwordReset.requestError"));
    } finally {
      setIsLoading(false);
    }
  }

  // Handle password reset with code
  async function handleResetPassword(values: ResetPasswordFormValues) {
    try {
      setIsLoading(true);
      setError(null);

      await confirmResetPassword({
        body: {
          code: values.resetCode,
          new_password: values.newPassword,
          confirm_password: values.confirmPassword,
        }
      });
      
      setResetSuccess(true);
      toast.success(t("passwordReset.resetSuccess"));
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
      
    } catch (error) {
      console.error("Reset password error:", error);
      setError(t("passwordReset.resetError"));
      toast.error(t("passwordReset.resetError"));
    } finally {
      setIsLoading(false);
    }
  }

  const resendResetEmail = async () => {
    if (!email) return;
    
    try {
      setIsLoading(true);
      await sendResetPasswordEmailLink({ email });
      toast.success(t("passwordReset.emailSent"));
    } catch (error) {
      console.error("Resend error:", error);
      toast.error(t("passwordReset.requestError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-background px-4">
      <Helmet>
        <title>
          {locale === "fr"
            ? "Mot de passe oublié | ClassConnect"
            : "Forgot Password | ClassConnect"}
        </title>
        <meta name="description" content={t("passwordReset.requestDescription")} />
        <meta
          property="og:title"
          content={
            locale === "fr"
              ? "Mot de passe oublié | ClassConnect"
              : "Forgot Password | ClassConnect"
          }
        />
        <meta property="og:description" content={t("passwordReset.requestDescription")} />
        <link rel="canonical" href={`${baseUrl}/auth/forgot-password`} />
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
      </Helmet>

      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("passwordReset.backToLogin")}
            </Link>
          </Button>
        </div>

        <Card className="w-full">
          <CardHeader className="space-y-1 text-center">
            <div className="text-default text-center w-full flex items-center justify-center">
              <BookOpen className="h-7 w-7 sm:h-10 sm:w-10" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {resetRequested ? t("passwordReset.resetTitle") : t("passwordReset.requestTitle")}
            </CardTitle>
            <CardDescription>
              {resetRequested ? t("passwordReset.resetDescription") : t("passwordReset.requestDescription")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Success message after password reset */}
            {resetSuccess && (
              <Alert className="bg-primary/10 border-primary/20">
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>{t("passwordReset.resetSuccess")}</AlertTitle>
                <AlertDescription>
                  {t("passwordReset.redirecting")}
                </AlertDescription>
              </Alert>
            )}

            {/* Email request form */}
            {!resetRequested && !resetSuccess && (
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(handleRequestReset)} className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm bg-destructive/15 text-destructive rounded-md">
                      {error}
                    </div>
                  )}
                  
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("loginDialog.emailLabel")}</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              placeholder="example@email.com"
                              className="pl-10"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t("passwordReset.enterEmailInstructions")}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center">
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        {t("passwordReset.sending")}
                      </div>
                    ) : (
                      t("passwordReset.sendLink")
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {/* Code verification and password reset form */}
            {resetRequested && !resetSuccess && (
              <Form {...resetPasswordForm}>
                <form autoComplete="false" onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)} className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm bg-destructive/15 text-destructive rounded-md">
                      {error}
                    </div>
                  )}
                  
                  {success && (
                    <Alert className="bg-primary/10 border-primary/20 mb-4">
                      <AlertDescription>
                        {t("passwordReset.checkInbox")}
                      </AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={resetPasswordForm.control}
                    name="resetCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("passwordReset.codeLabel")}</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              placeholder={t("passwordReset.codePlaceholder")}
                              className="pl-10"
                              disabled={isLoading}
                              maxLength={6}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              onKeyPress={(e) => {
                                // Allow only numeric input
                                if (!/[0-9]/.test(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              {...field}
                            />
                          </FormControl>
                          <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t("passwordReset.codeInstructions")}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={resetPasswordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("passwordReset.newPassword")}</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOffIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {showPassword ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t("registerDialog.errors.passwordMin")}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={resetPasswordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("passwordReset.confirmPassword")}</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center">
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        {t("passwordReset.resetting")}
                      </div>
                    ) : (
                      t("passwordReset.resetButton")
                    )}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground mt-4">
                    <p>{t("passwordReset.didNotReceive")}</p>
                    <Button 
                      variant="link" 
                      onClick={resendResetEmail}
                      disabled={isLoading}
                      className="p-0 mt-1"
                    >
                      {isLoading ? t("passwordReset.resending") : t("passwordReset.resendLink")}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
