"use client";

import { useI18n, useCurrentLocale } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputPhone } from "@/components/ui/input-phone";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BookOpen, Calendar, Mail, User, Lock, School, Building, MapPin, Phone, ChevronLeft, ChevronRight, Loader2, AlertCircle, Briefcase } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { registerUser } from "@/actions/accounts";
import { getformatedClasses } from "@/actions/courses";
import { Helmet } from 'react-helmet-async';
import { useMutation, useQuery } from "@tanstack/react-query";
import { ClassDetail, ClassStructure, EducationLevelDetail, UserCreateType } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ShineBorder } from "@/components/ui/shine-border";

// Constants from RegisterDialog
const EDUCATION_LEVELS = [
  "COLLEGE",
  "LYCEE",
  "UNIVERSITY",
  "PROFESSIONAL",
] as const;

// Define account types
const ACCOUNT_TYPES = ["STUDENT", "PROFESSIONAL"] as const;
type AccountType = typeof ACCOUNT_TYPES[number];

export default function RegisterPage() {
  const t = useI18n();
  const router = useRouter();
  const locale = useCurrentLocale();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl");
  const [additionalFieldsTab, setAdditionalFieldsTab] = useState<string>("college");

  // Add state for account type
  const [accountType, setAccountType] = useState<AccountType>("STUDENT");

  // For date of birth with separate inputs and date state variable for the form
  const [date, setDate] = useState<Date | undefined>(
    new Date(new Date().setFullYear(new Date().getFullYear() - 20))
  );

  const [birthYear, setBirthYear] = useState<string>((new Date().getFullYear() - 20).toString());
  const [birthMonth, setBirthMonth] = useState<string>("01");
  const [birthDay, setBirthDay] = useState<string>("01");

  // Generate years from 1940 to current year - 13 years (minimum age)
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1940 + 1 - 13 },
    (_, i) => (currentYear - 13 - i).toString()
  );

  // Generate months (1-12) with localized month names
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthNumber = (i + 1).toString().padStart(2, '0');
    return {
      value: monthNumber,
      label: locale === 'fr'
        ? t(`months.${monthNumber}` as keyof typeof t) || getMonthName(i, 'fr-FR')
        : t(`months.${monthNumber}` as keyof typeof t) || getMonthName(i, 'en-US')
    };
  });

  // Helper function to get localized month names as fallback
  function getMonthName(monthIndex: number, localeString: string): string {
    const date = new Date(2000, monthIndex, 1);
    return date.toLocaleString(localeString, { month: 'long' });
  }

  // Generate days based on selected month and year
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const [daysInMonth, setDaysInMonth] = useState<string[]>([]);

  // Create form schema with translations - inside the component so t is available
  // This needs to be defined *before* useForm
  const createRegisterSchema = (accountType: AccountType) => z.object({
    first_name: z.string().min(2, t('registerDialog.errors.firstNameMin')),
    last_name: z.string().min(2, t('registerDialog.errors.lastNameMin')),
    phone_number: z.string().min(9, t('registerDialog.errors.phoneInvalid')),
    date_of_birth: z.date({
      required_error: t('registerDialog.errors.dateRequired')
    }),
    email: z.string().email(t('registerDialog.errors.emailInvalid')),
    town: z.string().min(2, t('registerDialog.errors.townMin')),
    quarter: z.string().min(2, t('registerDialog.errors.quarterMin')),
    password: z
      .string()
      .min(8, t('registerDialog.errors.passwordMin')),
    confirm_password: z.string().min(1, t('registerDialog.errors.confirmPasswordRequired')),
    // Class selection
    class_enrolled: accountType === "STUDENT" ? z.number({
      required_error: t('registerDialog.errors.classRequired'),
      invalid_type_error: t('registerDialog.errors.classRequired')
    }).int().positive() : z.number().optional(), // Make required for student, optional for professional
    // Professional fields
    enterprise_name: accountType === "PROFESSIONAL" ? z.string().min(1, t('registerDialog.errors.enterpriseRequired')) : z.string().optional(),
    platform_usage_reason: accountType === "PROFESSIONAL" ? z.string().min(10, t('registerDialog.errors.reasonRequired')) : z.string().optional(),
  }).refine(data => data.password === data.confirm_password, {
    message: t('registerDialog.errors.passwordsMustMatch'),
    path: ['confirm_password'],
  }).refine(data => {
    // Validate age is at least 10
    const today = new Date();
    const birthDate = new Date(data.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 10;
  }, {
    message: t('registerDialog.errors.dateMinAge'),
    path: ['date_of_birth'],
  });

  // Initialize with initial account type
  const RegisterSchema = createRegisterSchema(accountType);

  // Base URL with locale
  const baseUrl = `https://www.classconnect.cm/${locale}`;

  // JSON-LD structured data for registration page - localized
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t('register.title'),
    description: t('register.description'),
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
          name: t('register.title'),
          item: `${baseUrl}/auth/register`,
        },
      ],
    },
    mainEntity: {
      "@type": "RegisterAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/auth/register`,
        actionPlatform: [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform",
        ],
      },
      potentialAction: {
        "@type": "CreateAction",
        name: t('registerDialog.createAccount'),
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/auth/register`,
        },
      },
    },
  };

  // Initialize form with default values
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone_number: "",
      date_of_birth: date,
      email: "",
      town: "",
      quarter: "",
      password: "",
      confirm_password: "",
      class_enrolled: undefined,
      enterprise_name: "",
      platform_usage_reason: ""
    },
  });

  // Add this function to debug form state
  const debugFormState = () => {
    console.log("Form state:", {
      isValid: form.formState.isValid,
      isDirty: form.formState.isDirty,
      errors: form.formState.errors,
      values: form.getValues(),
    });

    // Show all validation errors in toast for visibility
    if (Object.keys(form.formState.errors).length > 0) {
      const errorMessages = Object.entries(form.formState.errors)
        .map(([field, error]) => `${field}: ${error.message}`)
        .join('\n');

      toast.error("Validation errors:", {
        description: errorMessages,
        duration: 5000
      });
    }
  };

  // For class selection UI
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedEducationLevel, setSelectedEducationLevel] = useState<string | null>(null);
  const [selectedLevelClass, setSelectedLevelClass] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassDetail | null>(null);

  // Fetch classes data
  const { data: classesData, isLoading: isClassesLoading, error: classesError, refetch: refetchClasses } = useQuery({
    queryKey: ["formatted-classes"],
    queryFn: () => getformatedClasses(),
    retry: 3,
    retryDelay: 1000,
    enabled: accountType === "STUDENT", // Only fetch when account type is STUDENT
  });

  // Log errors for debugging
  useEffect(() => {
    if (classesError) {
      console.error("Error fetching classes:", classesError);
    }
  }, [classesError]);

  // Reset downstream selections when a higher-level selection changes
  useEffect(() => {
    if (selectedSection === null) {
      setSelectedEducationLevel(null);
      setSelectedLevelClass(null);
      setSelectedClass(null);
    }
  }, [selectedSection]);

  useEffect(() => {
    if (selectedEducationLevel === null) {
      setSelectedLevelClass(null);
      setSelectedClass(null);
    }
  }, [selectedEducationLevel]);

  useEffect(() => {
    if (selectedLevelClass === null) {
      setSelectedClass(null);
    }
  }, [selectedLevelClass]);

  // Update days in month when month or year changes
  useEffect(() => {
    if (birthYear && birthMonth) {
      const year = parseInt(birthYear, 10);
      const month = parseInt(birthMonth, 10);
      const days = getDaysInMonth(year, month);
      setDaysInMonth(
        Array.from({ length: days }, (_, i) => (i + 1).toString().padStart(2, '0'))
      );

      // Adjust day if current selected day exceeds max days in new month
      if (parseInt(birthDay, 10) > days) {
        setBirthDay(days.toString().padStart(2, '0'));
      }
    }
  }, [birthYear, birthMonth]);

  // Update date when individual parts change
  useEffect(() => {
    if (birthYear && birthMonth && birthDay) {
      const year = parseInt(birthYear, 10);
      const month = parseInt(birthMonth, 10) - 1; // JavaScript months are 0-based
      const day = parseInt(birthDay, 10);
      const newDate = new Date(year, month, day);
      setDate(newDate);
      // Also update the form field directly
      form.setValue("date_of_birth", newDate, { shouldValidate: true });
    }
  }, [birthYear, birthMonth, birthDay, form]);

  // Update form validation when account type changes
  useEffect(() => {
    // Re-create the schema based on current account type
    const newSchema = createRegisterSchema(accountType);

    // Reset form with new validation schema
    form.reset({
      ...form.getValues(),
      class_enrolled: accountType === "STUDENT" ? form.getValues().class_enrolled : undefined,
      enterprise_name: accountType === "PROFESSIONAL" ? form.getValues().enterprise_name : "",
      platform_usage_reason: accountType === "PROFESSIONAL" ? form.getValues().platform_usage_reason : "",
    }, {
      keepValues: true,
      // resolver: zodResolver(newSchema),
    });

    // Also reset conditional field validations
    if (accountType === "PROFESSIONAL") {
      form.clearErrors(["class_enrolled"]);
    } else {
      form.clearErrors(["enterprise_name", "platform_usage_reason"]);
    }
  }, [accountType, t]);

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: (data: UserCreateType) => registerUser(data),
    onSuccess: () => {
      toast.success(t("registerDialog.successToast"), {
        description: t("registerDialog.successToastDescription")
      });
      router.push(`/${locale}/auth/login`);
    },
    onError: (error) => {
      console.error("Registration error:", error);
      let errorMessage = t("registerDialog.errorToast");

      // Attempt to parse error message if it's a stringified JSON
      if (typeof error === 'string') {
        try {
          const parsedError = JSON.parse(error);
          if (parsedError.message) {
            errorMessage = parsedError.message;
          } else if (parsedError.error) { // Check for common error key too
            errorMessage = parsedError.error;
          }
        } catch (e) {
          // Ignore parsing errors, use default message
          console.error("Failed to parse error message string:", e);
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(t("registerDialog.errorToast"), {
        description: errorMessage
      });
    }
  });

  // Handle form submission with additional debugging
  async function onSubmit(values: z.infer<typeof RegisterSchema>) {
    try {
      console.log("Form submission started with values:", values);
      debugFormState();

      // Check for student account type with missing class
      if (accountType === "STUDENT" && values.class_enrolled === undefined) {
        console.error("Class enrolled is undefined for student account type");
        toast.error(t("registerDialog.errors.classRequired"), {
          description: t("registerDialog.errors.pleaseSelectClass")
        });
        form.setError("class_enrolled", {
          type: "manual",
          message: t("registerDialog.errors.classRequired")
        });
        return;
      }

      const userData: UserCreateType = {
        first_name: values.first_name,
        last_name: values.last_name,
        phone_number: values.phone_number,
        date_of_birth: values.date_of_birth.toISOString().split('T')[0],
        email: values.email,
        town: values.town,
        quarter: values.quarter,
        password: values.password,
        // Add user_type based on selected account type
        user_type: accountType === "STUDENT" ? "STUDENT" : "PROFESSIONAL",
      };

      // Add type-specific fields
      if (accountType === "STUDENT") {
        userData.class_enrolled = values.class_enrolled;
      } else if (accountType === "PROFESSIONAL") {
        userData.enterprise_name = values.enterprise_name;
        userData.platform_usage_reason = values.platform_usage_reason;
      }

      console.log("Sending user data:", userData);
      registerMutation.mutate(userData);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(t("common.error"), {
        description: typeof error === 'string' ? error :
          error instanceof Error ? error.message :
            t("registerDialog.errorToast")
      });
    }
  }

  // Handle class selection
  const handleClassSelection = (classDetail: ClassDetail) => {
    setSelectedClass(classDetail);
    // Update form value and trigger validation
    form.setValue("class_enrolled", classDetail.id, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
    console.log("Selected class:", classDetail.id);
  };

  // Render class selection UI based on available data
  const renderClassSelectionUI = () => {
    if (isClassesLoading) {
      return (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      );
    }

    if (classesError) {
      return (
        <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20 text-destructive">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">{t("common.errorOccurred")}</h3>
          </div>
          <p className="text-sm">{t("registerDialog.classLoadError")}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchClasses()}
            className="mt-2"
          >
            {t("common.retry")}
          </Button>
        </div>
      );
    }

    if (!classesData || Object.keys(classesData).length === 0) {
      return (
        <div className="p-4 bg-muted/30 rounded-lg text-center">
          <p className="text-muted-foreground">{t("registerDialog.noClassesAvailable")}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchClasses()}
            className="mt-2"
          >
            {t("common.reload")}
          </Button>
        </div>
      );
    }

    const sectionKeys = Object.keys(classesData);

    return (
      <div className="space-y-4">
        {/* Section Selection */}
        <div>
          <FormLabel>{t("registerDialog.selectSection")}</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
            {sectionKeys.map((sectionKey) => (
              <Button
                key={sectionKey}
                type="button"
                variant={selectedSection === sectionKey ? "default" : "outline"}
                className="justify-start text-left"
                onClick={() => {
                  setSelectedSection(sectionKey);
                  setSelectedEducationLevel(null); // Reset downstream
                  setSelectedLevelClass(null); // Reset downstream
                  setSelectedClass(null); // Reset downstream
                  form.setValue("class_enrolled", undefined); // Reset form value
                }}
              >
                {classesData[sectionKey].label || sectionKey}
              </Button>
            ))}
          </div>
        </div>

        {/* Education Level Selection (if section is selected) */}
        {selectedSection && classesData[selectedSection]?.levels && (
          <div>
            <FormLabel>{t("registerDialog.selectLevel")}</FormLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
              {Object.entries(classesData[selectedSection].levels).map(([levelKey, level]) => (
                <Button
                  key={levelKey}
                  type="button"
                  variant={selectedEducationLevel === levelKey ? "default" : "outline"}
                  className="justify-start text-left"
                  onClick={() => {
                    setSelectedEducationLevel(levelKey);
                    setSelectedLevelClass(null); // Reset downstream
                    setSelectedClass(null); // Reset downstream
                    form.setValue("class_enrolled", undefined); // Reset form value
                  }}
                >
                  {level.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Class Group Selection (if education level is selected) */}
        {selectedSection && selectedEducationLevel && classesData[selectedSection]?.levels?.[selectedEducationLevel]?.groups && (
          <div>
            <FormLabel>{t("registerDialog.selectClassType")}</FormLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {Object.entries(classesData[selectedSection].levels[selectedEducationLevel].groups).map(([groupKey, classes]) => (
                <Button
                  key={groupKey}
                  type="button"
                  variant={selectedLevelClass === groupKey ? "default" : "outline"}
                  className="justify-start text-left"
                  onClick={() => {
                    setSelectedLevelClass(groupKey);
                    setSelectedClass(null); // Reset downstream
                    form.setValue("class_enrolled", undefined); // Reset form value
                  }}
                >
                  {groupKey === "classes" ? t("registerDialog.generalClasses") : groupKey}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Class Selection (if class type is selected) */}
        {selectedSection && selectedEducationLevel && selectedLevelClass && classesData[selectedSection]?.levels?.[selectedEducationLevel]?.groups?.[selectedLevelClass] && (
          <div>
            <FormLabel>{t("registerDialog.selectClass")}</FormLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-1">
              {classesData[selectedSection].levels[selectedEducationLevel].groups[selectedLevelClass].map((classDetail) => (
                <Button
                  key={classDetail.id}
                  type="button"
                  variant={selectedClass?.id === classDetail.id ? "default" : "outline"}
                  className={cn(
                    "justify-between text-left",
                    selectedClass?.id === classDetail.id ? "ring-2 ring-primary/50" : ""
                  )}
                  onClick={() => handleClassSelection(classDetail)}
                >
                  <span>{classDetail.definition_display}</span>
                </Button>
              ))}
            </div>
            {/* Explicitly show class_enrolled message if it exists */}
            <FormField
              control={form.control}
              name="class_enrolled"
              render={({ field }) => (
                <FormItem>
                  {/* Hidden FormControl as the UI is handled by buttons above */}
                  <FormControl className="hidden">
                    <Input type="hidden" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage className="mt-2" />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    );
  };

  // Professional fields component
  const renderProfessionalFields = () => {
    return (
      <div className="space-y-6 mt-4">
        <FormField
          control={form.control}
          name="enterprise_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("registerDialog.enterpriseName")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder={t("registerDialog.enterprisePlaceholder")}
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="platform_usage_reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("registerDialog.platformUsageReason")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("registerDialog.reasonPlaceholder")}
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>{t('register.title')} | ClassConnect</title>
        <meta name="description" content={t('register.description')} />
        <meta property="og:title" content={`${t('register.title')} | ClassConnect`} />
        <meta property="og:description" content={t('register.description')} />
        <meta property="og:url" content={`${baseUrl}/auth/register`} />
        <link rel="canonical" href={`${baseUrl}/auth/register`} />
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
      </Helmet>

      <div className="container max-w-5xl mx-auto py-8 px-4">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href={`/${locale}/auth/login`}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t('register.backToLogin')}
          </Link>
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            {t('register.title')}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            {t('register.description')}
          </p>
        </div>

        <Card className="w-full max-w-4xl mx-auto border border-primary/10 bg-card/90 backdrop-blur shadow-xl">
          <ShineBorder shineColor={"blue"} />
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">{t('register.formTitle')}</CardTitle>
            <CardDescription>{t('register.formDescription')}</CardDescription>
          </CardHeader>

          <CardContent className="pb-2">
            <Form {...form}>
              <form
                onSubmit={(e) => {
                  console.log("Form submit event triggered");
                  form.handleSubmit(onSubmit)(e);
                }}
                className="space-y-6"
              >
                {/* Account Type Selection */}
                <div className="w-full">
                  <h3 className="text-sm font-medium mb-2">{t('registerDialog.accountType')}</h3>
                  <Tabs defaultValue="STUDENT" onValueChange={(value) => setAccountType(value as AccountType)}>
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger
                        value="STUDENT"
                        className={accountType === "STUDENT" ? "bg-primary text-primary-foreground" : ""}
                      >
                        <School className="mr-2 h-4 w-4" />
                        {t('registerDialog.student')}
                      </TabsTrigger>
                      <TabsTrigger
                        value="PROFESSIONAL"
                        className={accountType === "PROFESSIONAL" ? "bg-primary text-primary-foreground" : ""}
                      >
                        <Briefcase className="mr-2 h-4 w-4" />
                        {t('registerDialog.professional')}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('registerDialog.firstName')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder={t('registerDialog.firstNamePlaceholder')}
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('registerDialog.lastName')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder={t('registerDialog.lastNamePlaceholder')}
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('registerDialog.email')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="example@email.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="town"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('registerDialog.town')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder={t('registerDialog.townPlaceholder')}
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quarter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('registerDialog.quarter')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder={t('registerDialog.quarterPlaceholder')}
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('registerDialog.phoneNumber')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <InputPhone defaultCountry="CM" international countryCallingCodeEditable={false} placeholder="6XXXXXXXX" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>{t('registerDialog.dateOfBirth')}</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "PPP", {
                                    locale: locale === 'fr' ? fr : enUS
                                  })
                                ) : (
                                  <span>{t('registerDialog.pickDate')}</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <div className="flex items-center justify-between px-4 py-2">
                              {/* Year Dropdown */}
                              <Select
                                value={birthYear}
                                onValueChange={(value) => setBirthYear(value)}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                  {years.map((year) => (
                                    <SelectItem key={year} value={year}>
                                      {year}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              {/* Month Dropdown */}
                              <Select
                                value={birthMonth}
                                onValueChange={(value) => setBirthMonth(value)}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                  {months.map((month) => (
                                    <SelectItem key={month.value} value={month.value}>
                                      {month.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Calendar Component */}
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                if (date) {
                                  setBirthYear(date.getFullYear().toString());
                                  setBirthMonth((date.getMonth() + 1).toString().padStart(2, '0'));
                                  setBirthDay(date.getDate().toString().padStart(2, '0'));
                                }
                              }}
                              month={new Date(parseInt(birthYear), parseInt(birthMonth) - 1)}
                              onMonthChange={(month) => {
                                setBirthYear(month.getFullYear().toString());
                                setBirthMonth((month.getMonth() + 1).toString().padStart(2, '0'));
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('registerDialog.password')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder={t('registerDialog.passwordPlaceholder')}
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('registerDialog.confirmPassword')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder={t('registerDialog.confirmPasswordPlaceholder')}
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Show class selection UI or professional fields */}
                {accountType === "STUDENT" ? (
                  <div className="border rounded-lg p-4 bg-card/50">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <School className="h-5 w-5" />
                      {t('registerDialog.classInformation')}
                    </h3>
                    {renderClassSelectionUI()}
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-card/50">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      {t('registerDialog.professionalInformation')}
                    </h3>
                    {renderProfessionalFields()}
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-full py-6 text-base font-medium"
                    onClick={() => {
                      console.log("Submit button clicked");
                      // Optional: manually trigger validation before form submission
                      form.trigger().then(isValid => {
                        console.log("Manual validation result:", isValid);
                        if (!isValid) {
                          debugFormState();
                        }
                      });
                    }}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('registerDialog.creatingAccount')}
                      </>
                    ) : (
                      <>
                        {t('registerDialog.createAccount')}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {/* Add this development helper button in non-production environments */}
                  {process.env.NODE_ENV !== 'production' && (
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => debugFormState()}
                      >
                        Debug Form State
                      </Button>
                    </div>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col py-4 border-t border-primary/10">
            <p className="text-center text-sm text-muted-foreground">
              {t('register.alreadyHaveAccount')}{' '}
              <Link
                href={`/${locale}/auth/login${callbackUrl ? `?callbackUrl=${callbackUrl}` : ''}`}
                className="font-medium text-primary hover:underline"
              >
                {t('register.loginInstead')}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}