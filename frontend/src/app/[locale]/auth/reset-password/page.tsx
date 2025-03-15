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
  ShieldCheck 
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Helmet } from "react-helmet-async";
import { confirmResetPassword, sendResetPasswordEmailLink, verifyCode } from "@/actions/accounts";
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

export default function ResetPasswordPage() {
  const t = useI18n();
  const router = useRouter();
  const locale = useCurrentLocale();
  const searchParams = useSearchParams();
  
  // Get the code and email from URL query parameters
  const codeFromUrl = searchParams.get("code");
  const emailFromUrl = searchParams.get("email");
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(!!codeFromUrl);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [email, setEmail] = useState(emailFromUrl || "");
  
  // Base URL with locale
  const baseUrl = `https://www.classconnect.cm/${locale}`;
  
  // Create schema for password reset
  const resetPasswordSchema = z.object({
    newPassword: z
      .string()
      .min(8, { message: t("registerDialog.errors.passwordMin") }),
    confirmPassword: z
      .string()
      .min(1, { message: t("registerDialog.errors.confirmPasswordRequired") }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t("registerDialog.errors.passwordsMustMatch"),
    path: ["confirmPassword"],
  });

  // If we don't have a code from URL, also require the code field
  const schemaWithCode = resetPasswordSchema.extend({
    resetCode: z.string().min(1, { message: t("passwordReset.missingCode") }),
  });

  // Use the appropriate schema based on whether we have a code in the URL
  const formSchema = codeFromUrl ? resetPasswordSchema : schemaWithCode;

  // Define form types
  type ResetPasswordFormValues = z.infer<typeof formSchema>;

  // Initialize the form
  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
      ...(codeFromUrl ? {} : { resetCode: "" }),
    },
  });

  // JSON-LD structured data for reset password page - localized
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("passwordReset.resetTitle"),
    description: t("passwordReset.resetDescription"),
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
          name: t("passwordReset.resetTitle"),
          item: `${baseUrl}/auth/reset-password`,
        },
      ],
    },
  };
  
  // Verify the code when the page loads if code is provided in URL
  useEffect(() => {
    if (!codeFromUrl) {
      setIsVerifying(false);
      return;
    }
    
    const verifyResetCode = async () => {
      try {
        const response = await verifyCode({ code: codeFromUrl });
        if (response.exists) {
          setVerificationComplete(true);
        } else {
          setError(t("passwordReset.invalidCode"));
        }
      } catch (error) {
        console.error("Code verification error:", error);
        setError(t("passwordReset.invalidCode"));
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyResetCode();
  }, [codeFromUrl, t]);

  // Handle password reset
  async function handleResetPassword(values: ResetPasswordFormValues) {
    const code = codeFromUrl || (values as any).resetCode;
    
    if (!code) {
      setError(t("passwordReset.missingCode"));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Verify the code first if it wasn't already verified via URL
      if (!codeFromUrl && !verificationComplete) {
        try {
          const verifyResponse = await verifyCode({ code });
          if (!verifyResponse.exists) {
            setError(t("passwordReset.invalidCode"));
            setIsLoading(false);
            return;
          }
          setVerificationComplete(true);
        } catch (error) {
          console.error("Code verification error:", error);
          setError(t("passwordReset.invalidCode"));
          setIsLoading(false);
          return;
        }
      }

      await confirmResetPassword({
        body: {
          code,
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

  // Function to resend the reset email
  const resendResetEmail = async () => {
    if (!email) {
      setError(t("loginDialog.errors.emailRequired"));
      return;
    }
    
    try {
      setIsLoading(true);
      await sendResetPasswordEmailLink({ email });
      setSuccess(true);
      toast.success(t("passwordReset.emailSent"));
    } catch (error) {
      console.error("Resend error:", error);
      toast.error(t("passwordReset.requestError"));
      setError(t("passwordReset.requestError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-background px-4">
      <Helmet>
        <title>
          {locale === "fr"
            ? "Réinitialiser le mot de passe | ClassConnect"
            : "Reset Password | ClassConnect"}
        </title>
        <meta name="description" content={t("passwordReset.resetDescription")} />
        <meta
          property="og:title"
          content={
            locale === "fr"
              ? "Réinitialiser le mot de passe | ClassConnect"
              : "Reset Password | ClassConnect"
          }
        />
        <meta property="og:description" content={t("passwordReset.resetDescription")} />
        <link rel="canonical" href={`${baseUrl}/auth/reset-password`} />
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
              {t("passwordReset.resetTitle")}
            </CardTitle>
            <CardDescription>{t("passwordReset.resetDescription")}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Show loading state while verifying code */}
            {isVerifying && (
              <div className="flex items-center justify-center py-6">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            
            {/* Show error if code is missing */}
            {!isVerifying && !verificationComplete && !codeFromUrl && !resetSuccess && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>{t("passwordReset.invalidCode")}</AlertTitle>
                <AlertDescription>
                  {t("passwordReset.missingCodeInstructions")}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Show success message after password reset */}
            {resetSuccess && (
              <Alert className="bg-primary/10 border-primary/20">
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>{t("passwordReset.resetSuccess")}</AlertTitle>
                <AlertDescription>
                  {t("passwordReset.redirecting")}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Show the password reset form */}
            {!isVerifying && (codeFromUrl || !resetSuccess) && (
              <Form {...resetPasswordForm}>
                <form autoComplete="off" onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)} className="space-y-4">
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

                  {/* Only show code field if not provided in URL */}
                  {!codeFromUrl && (
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
                  )}

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

                  {!codeFromUrl && (
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
                  )}
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
