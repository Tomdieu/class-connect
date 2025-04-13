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
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container max-w-md mx-auto py-10 px-4">
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

        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10">
            <Link href="/auth/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("passwordReset.backToLogin")}
            </Link>
          </Button>
        </div>

        <Card className="shadow-lg border-primary/20 overflow-hidden bg-card/95 backdrop-blur">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/30 rounded-bl-full z-0 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-primary/20 rounded-tr-full z-0 opacity-20"></div>

          <CardHeader className="space-y-1 text-center relative z-10">
            <div className="text-center w-full flex items-center justify-center mb-2">
              <div className="rounded-full bg-primary/10 p-3">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {resetRequested ? t("passwordReset.resetTitle") : t("passwordReset.requestTitle")}
            </CardTitle>
            <CardDescription>
              {resetRequested ? t("passwordReset.resetDescription") : t("passwordReset.requestDescription")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 relative z-10">
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
                    <div className="p-4 text-sm bg-destructive/15 text-destructive rounded-md border border-destructive/30 shadow-sm">
                      {error}
                    </div>
                  )}
                  
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                          </svg>
                          {t("loginDialog.emailLabel")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="example@email.com"
                            className="bg-background"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("passwordReset.enterEmailInstructions")}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full mt-2 bg-primary hover:bg-primary/90 transition-colors" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center">
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        {t("passwordReset.sending")}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <MailIcon className="mr-2 h-4 w-4" />
                        {t("passwordReset.sendLink")}
                      </div>
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {/* Code verification and password reset form */}
            {resetRequested && !resetSuccess && (
              <Form {...resetPasswordForm}>
                <form autoComplete="off" onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)} className="space-y-4">
                  {error && (
                    <div className="p-4 text-sm bg-destructive/15 text-destructive rounded-md border border-destructive/30 shadow-sm">
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
                        <FormLabel className="flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                          {t("passwordReset.codeLabel")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("passwordReset.codePlaceholder")}
                            className="bg-background"
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
                        <p className="text-xs text-muted-foreground mt-1">
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
                        <div className="flex items-center justify-between">
                          <FormLabel className="flex items-center gap-1">
                            <KeyIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            {t("passwordReset.newPassword")}
                          </FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto text-xs text-primary hover:text-primary/80 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOffIcon className="h-3.5 w-3.5 mr-1" />
                            ) : (
                              <EyeIcon className="h-3.5 w-3.5 mr-1" />
                            )}
                            {showPassword ? "Hide" : "Show"}
                          </Button>
                        </div>
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="bg-background"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
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
                        <FormLabel className="flex items-center gap-1">
                          <KeyIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          {t("passwordReset.confirmPassword")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="bg-background"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full mt-2 bg-primary hover:bg-primary/90 transition-colors" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        {t("passwordReset.resetting")}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        {t("passwordReset.resetButton")}
                      </div>
                    )}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground mt-4">
                    <p>{t("passwordReset.didNotReceive")}</p>
                    <Button 
                      variant="link" 
                      onClick={resendResetEmail}
                      disabled={isLoading}
                      className="p-0 mt-1 text-primary hover:text-primary/90"
                    >
                      {isLoading ? t("passwordReset.resending") : t("passwordReset.resendLink")}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>

          {!resetRequested && !resetSuccess && (
            <CardFooter className="flex justify-center relative z-10">
              <div className="text-center text-sm">
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  {t("passwordReset.backToLogin")}
                </Link>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
