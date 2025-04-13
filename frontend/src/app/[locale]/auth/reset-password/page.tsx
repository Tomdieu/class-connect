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
  const codeFromUrl = searchParams?.get("code");
  const emailFromUrl = searchParams?.get("email");
  
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
  
  // Fix: Create base schema and schema with code separately instead of using .extend
  const baseResetPasswordSchema = z.object({
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

  // Create a completely new schema with the code field included
  const schemaWithCode = z.object({
    resetCode: z.string().min(1, { message: t("passwordReset.missingCode") }),
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

  // Use the appropriate schema based on whether we have a code in the URL
  const formSchema = codeFromUrl ? baseResetPasswordSchema : schemaWithCode;

  // Define form types - use a type union to handle both schema variants
  type ResetPasswordFormValues = z.infer<typeof baseResetPasswordSchema> | z.infer<typeof schemaWithCode>;

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
    // Access resetCode conditionally with type checking
    const code = codeFromUrl || ('resetCode' in values ? values.resetCode : '');
    
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
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container max-w-md mx-auto py-10 px-4">
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
              {t("passwordReset.resetTitle")}
            </CardTitle>
            <CardDescription>{t("passwordReset.resetDescription")}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 relative z-10">
            {/* Show loading state while verifying code */}
            {isVerifying && (
              <div className="flex items-center justify-center py-6">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">{t('common.loading')}</span>
              </div>
            )}
            
            {/* Show error if code is missing */}
            {!isVerifying && !verificationComplete && !codeFromUrl && !resetSuccess && (
              <Alert variant="destructive" className="mb-4 border border-destructive/30">
                <AlertTitle className="font-semibold">{t("passwordReset.invalidCode")}</AlertTitle>
                <AlertDescription>
                  {t("passwordReset.missingCodeInstructions")}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Show success message after password reset */}
            {resetSuccess && (
              <Alert className="bg-primary/10 border-primary/20">
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle className="font-semibold">{t("passwordReset.resetSuccess")}</AlertTitle>
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

                  {/* Only show code field if not provided in URL */}
                  {!codeFromUrl && (
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
                  )}

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

                  {!codeFromUrl && (
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
                  )}
                </form>
              </Form>
            )}
          </CardContent>

          <CardFooter className="flex justify-center relative z-10">
            <div className="text-center text-sm">
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                {t("passwordReset.backToLogin")}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
