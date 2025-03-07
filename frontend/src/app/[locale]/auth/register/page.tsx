"use client";

import { useI18n, useCurrentLocale } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { registerUser } from "@/actions/accounts";
import { Helmet } from 'react-helmet-async';
import { useMutation } from "@tanstack/react-query";
import { UserCreateType } from "@/types";
import { Textarea } from "@/components/ui/textarea";

// Constants from RegisterDialog
const EDUCATION_LEVELS = [
  "COLLEGE",
  "LYCEE",
  "UNIVERSITY",
  "PROFESSIONAL",
] as const;
const COLLEGE_CLASSES = ["6eme", "5eme", "4eme", "3eme"] as const;
const LYCEE_CLASSES = ["2nde", "1ere", "terminale"] as const;
const UNIVERSITY_LEVELS = ["licence", "master", "doctorat"] as const;
const LICENCE_YEARS = ["L1", "L2", "L3"] as const;
const MASTER_YEARS = ["M1", "M2"] as const;
const LYCEE_SPECIALITIES = ["scientifique", "litteraire"] as const;

export default function RegisterPage() {
  const t = useI18n();
  const router = useRouter();
  const locale = useCurrentLocale();
  const [additionalFieldsTab, setAdditionalFieldsTab] = useState<string>("college");
  
  // Base URL with locale
  const baseUrl = `https://www.classconnect.cm/${locale}`;

  // JSON-LD structured data for register page - localized
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": t('registerDialog.title'),
    "description": t('registerDialog.subtitle'),
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": locale === 'fr' ? "Accueil" : "Home",
          "item": `https://www.classconnect.cm/${locale}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": t('nav.register'),
          "item": `${baseUrl}/auth/register`
        }
      ]
    },
    "mainEntity": {
      "@type": "RegisterAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/auth/register`,
        "actionPlatform": [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform"
        ]
      },
      "potentialAction": {
        "@type": "CreateAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/auth/register`
        }
      }
    }
  };

  // Generate years from 1940 to current year - 13 years (minimum age)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1940 + 1 - 13 }, (_, i) => currentYear - 13 - i).map(year => year.toString());
  
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
  
  // States for birth date components
  const [birthYear, setBirthYear] = useState<string>(years[20] || (currentYear - 20).toString()); // Default to 20 years ago
  const [birthMonth, setBirthMonth] = useState<string>("01");
  const [birthDay, setBirthDay] = useState<string>("01");
  
  // Generate days based on selected month and year
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  
  const [daysInMonth, setDaysInMonth] = useState<string[]>([]);
  
  useEffect(() => {
    const year = parseInt(birthYear);
    const month = parseInt(birthMonth);
    const totalDays = getDaysInMonth(year, month);
    const days = Array.from({ length: totalDays }, (_, i) => (i + 1).toString().padStart(2, '0'));
    setDaysInMonth(days);
    
    // Adjust day if it exceeds the maximum days in the selected month
    if (parseInt(birthDay) > totalDays) {
      setBirthDay(totalDays.toString().padStart(2, '0'));
    }
  }, [birthYear, birthMonth, birthDay]);

  // Create form schema with translations
  const RegisterSchema = z.object({
    first_name: z.string().min(2, t('registerDialog.errors.firstNameMin')),
    last_name: z.string().min(2, t('registerDialog.errors.lastNameMin')),
    phone_number: z.string().min(9, t('registerDialog.errors.phoneInvalid')),
    // Remove date_of_birth from the schema as we'll handle it separately
    birth_year: z.string().nonempty(t('registerDialog.errors.dateRequired')),
    birth_month: z.string().nonempty(t('registerDialog.errors.dateRequired')),
    birth_day: z.string().nonempty(t('registerDialog.errors.dateRequired')),
    education_level: z.enum(EDUCATION_LEVELS),
    email: z.string().email(t('registerDialog.errors.emailInvalid')),
    town: z.string().min(2, t('registerDialog.errors.townMin')),
    quarter: z.string().min(2, t('registerDialog.errors.quarterMin')),
    password: z
      .string()
      .min(8, t('registerDialog.errors.passwordMin')),
    confirm_password: z.string().min(1, t('registerDialog.errors.confirmPasswordRequired')),
    // College fields
    college_class: z.enum(COLLEGE_CLASSES).optional(),
    // Lycee fields
    lycee_class: z.enum(LYCEE_CLASSES).optional(),
    lycee_speciality: z.enum(LYCEE_SPECIALITIES).optional(),
    // University fields
    university_level: z.enum(UNIVERSITY_LEVELS).optional(),
    licence_year: z.enum(LICENCE_YEARS).optional(),
    master_year: z.enum(MASTER_YEARS).optional(),
    // Professional fields
    enterprise_name: z.string().optional(),
    platform_usage_reason: z.string().optional(),
  }).refine(data => data.password === data.confirm_password, {
    message: t('registerDialog.errors.passwordsMustMatch'),
    path: ['confirm_password'],
  }).refine(data => {
    // Validate that the date is valid and user is at least 13 years old
    try {
      const birthDate = new Date(`${data.birth_year}-${data.birth_month}-${data.birth_day}`);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 13;
      }
      return age >= 13;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return false;
    }
  }, {
    message: t('registerDialog.errors.dateMinAge'),
    path: ['birth_year'],
  });

  // Form setup
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone_number: "",
      birth_year: birthYear,
      birth_month: birthMonth,
      birth_day: birthDay,
      education_level: "COLLEGE",
      email: "",
      town: "",
      quarter: "",
      password: "",
      confirm_password: "",
      college_class: "6eme",
    },
  });

  // Update form values when date components change
  useEffect(() => {
    form.setValue('birth_year', birthYear);
    form.setValue('birth_month', birthMonth);
    form.setValue('birth_day', birthDay);
  }, [birthYear, birthMonth, birthDay, form]);

  // Watch education level to show/hide related fields
  const educationLevel = form.watch('education_level');

  // Set the tab and update form values when education level changes
  React.useEffect(() => {
    setAdditionalFieldsTab(educationLevel.toLowerCase());

    // Reset field values when changing education level
    if (educationLevel === 'COLLEGE') {
      form.setValue('college_class', '6eme');
    } else if (educationLevel === 'LYCEE') {
      form.setValue('lycee_class', '2nde');
      form.setValue('lycee_speciality', 'scientifique');
    } else if (educationLevel === 'UNIVERSITY') {
      form.setValue('university_level', 'licence');
      form.setValue('licence_year', 'L1');
    }
  }, [educationLevel, form]);

  // TanStack Query mutation
  const registerMutation = useMutation({
    mutationFn: (data: UserCreateType) => registerUser(data),
    onSuccess: () => {
      toast.success("Registration successful! Please check your email to verify your account.");
      router.push('/auth/login');
    },
    onError: (error) => {
      try {
        const errorData = JSON.parse(error.message || "{}");
        
        // Handle field-specific errors
        if (errorData.email) {
          form.setError("email", {
            message: Array.isArray(errorData.email) ? errorData.email[0] : errorData.email,
          });
        }
        
        if (errorData.phone_number) {
          form.setError("phone_number", {
            message: Array.isArray(errorData.phone_number) ? errorData.phone_number[0] : errorData.phone_number,
          });
        }
        
        // Show error toast with all error messages
        const errorMessages = Object.entries(errorData)
          .filter(([key]) => key !== "message") // Exclude the generic message
          .map(([key, value]) => {
            const messages = Array.isArray(value) ? value.join(", ") : value;
            return `${key}: ${messages}`;
          });
        
        if (errorMessages.length > 0) {
          toast.error("Registration failed. Please try again.", {
            description: errorMessages.join("\n"),
          });
        } else {
          toast.error("Registration failed. Please try again.", {
            description: errorData.message || "Something went wrong. Please check your input and try again.",
          });
        }
      } catch (e) {
        console.error("Error parsing error response:", e);
        toast.error("Registration failed. Please try again.", {
          description: "An unexpected error occurred",
        });
      }
    }
  });

  async function onSubmit(values: z.infer<typeof RegisterSchema>) {
    // Create a date string in YYYY-MM-DD format
    const dateOfBirth = `${values.birth_year}-${values.birth_month}-${values.birth_day}`;
    
    try {
      // Create the registration data based on education level
      const registerData: UserCreateType = {
        first_name: values.first_name,
        last_name: values.last_name,
        phone_number: values.phone_number,
        date_of_birth: dateOfBirth,
        education_level: values.education_level,
        email: values.email,
        town: values.town,
        quarter: values.quarter,
        password: values.password,
      };

      // Add level-specific fields
      switch (values.education_level) {
        case 'COLLEGE':
          registerData.college_class = values.college_class;
          break;
        case 'LYCEE':
          registerData.lycee_class = values.lycee_class;
          registerData.lycee_speciality = values.lycee_speciality;
          break;
        case 'UNIVERSITY':
          registerData.university_level = values.university_level;
          
          if (values.university_level === 'licence') {
            registerData.university_year = values.licence_year;
          } else if (values.university_level === 'master') {
            registerData.university_year = values.master_year;
          }
          break;
        case 'PROFESSIONAL':
          registerData.enterprise_name = values.enterprise_name;
          registerData.platform_usage_reason = values.platform_usage_reason;
          break;
      }

      // Call the TanStack mutation
      registerMutation.mutate(registerData);
    } catch (error) {
      console.error("Registration data preparation error:", error);
      toast.error("Registration failed. Please check your details and try again.");
    }
  }

  // Add state for university level
  const [universityLevel, setUniversityLevel] = useState<string>("");

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Helmet>
        <title>{locale === 'fr' ? 'Inscription | ClassConnect' : 'Register | ClassConnect'}</title>
        <meta name="description" content={t('registerDialog.subtitle')} />
        <meta property="og:title" content={locale === 'fr' ? 'Inscription | ClassConnect' : 'Register | ClassConnect'} />
        <meta property="og:description" content={t('registerDialog.subtitle')} />
        <link rel="canonical" href={`${baseUrl}/auth/register`} />
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
      </Helmet>

      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t('registerDialog.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('registerDialog.subtitle')}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("registerDialog.sections.personalInfo")}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Name fields */}
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('registerDialog.firstNameLabel')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>{t('registerDialog.lastNameLabel')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Date of Birth */}
                <div className="space-y-2">
                  <FormLabel htmlFor="date_of_birth">{t('registerDialog.dateOfBirthLabel')}</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Select 
                        value={birthYear}
                        onValueChange={(value) => setBirthYear(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('registerDialog.yearPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Select 
                        value={birthMonth}
                        onValueChange={(value) => setBirthMonth(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('registerDialog.monthPlaceholder')} />
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
                    <div>
                      <Select 
                        value={birthDay}
                        onValueChange={(value) => setBirthDay(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('registerDialog.dayPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {daysInMonth.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {form.formState.errors.birth_year && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.birth_year.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Education Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("registerDialog.sections.educationDetails")}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="education_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('registerDialog.educationLevelLabel')}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value)}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EDUCATION_LEVELS.map((level) => (
                              <SelectItem key={level} value={level}>
                                {t(`registerDialog.educationLevels.${level.toLowerCase()}` as keyof typeof t)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Dynamic Education Fields */}
                <div className="space-y-4">
                  <Tabs value={additionalFieldsTab} onValueChange={setAdditionalFieldsTab}>
                    <TabsContent value="college">
                      <FormField
                        control={form.control}
                        name="college_class"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('registerDialog.collegeClassLabel')}</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {COLLEGE_CLASSES.map((classItem) => (
                                  <SelectItem key={classItem} value={classItem}>
                                    {t(`registerDialog.collegeClasses.${classItem}`)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    
                    <TabsContent value="lycee" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="lycee_class"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('registerDialog.lyceeClassLabel')}</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {LYCEE_CLASSES.map((classItem) => (
                                  <SelectItem key={classItem} value={classItem}>
                                    {t(`registerDialog.lyceeClasses.${classItem}`)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lycee_speciality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('registerDialog.lyceeSpecialityLabel')}</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select speciality" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {LYCEE_SPECIALITIES.map((speciality) => (
                                  <SelectItem key={speciality} value={speciality}>
                                    {t(`registerDialog.lyceeSpecialities.${speciality}`)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    
                    <TabsContent value="university" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="university_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('registerDialog.universityLevelLabel')}</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                setUniversityLevel(value);
                                if (value === 'licence') {
                                  form.setValue('licence_year', 'L1');
                                } else if (value === 'master') {
                                  form.setValue('master_year', 'M1');
                                }
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {UNIVERSITY_LEVELS.map((level) => (
                                  <SelectItem key={level} value={level}>
                                    {t(`registerDialog.universityLevels.${level}`)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {universityLevel === 'licence' && (
                        <FormField
                          control={form.control}
                          name="licence_year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('registerDialog.licenceYearLabel')}</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select year" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {LICENCE_YEARS.map((year) => (
                                    <SelectItem key={year} value={year}>
                                      {t(`registerDialog.licenceYears.${year}`)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {universityLevel === 'master' && (
                        <FormField
                          control={form.control}
                          name="master_year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('registerDialog.masterYearLabel')}</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select year" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {MASTER_YEARS.map((year) => (
                                    <SelectItem key={year} value={year}>
                                      {t(`registerDialog.masterYears.${year}`)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </TabsContent>
                    
                    <TabsContent value="professional" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="enterprise_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('registerDialog.enterpriseNameLabel')}</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
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
                            <FormLabel>{t('registerDialog.platformUsageReasonLabel')}</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={5}
                                placeholder={t('registerDialog.platformUsageReasonLabel')}
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("registerDialog.sections.contactInfo")}
                </h3>
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('registerDialog.phoneNumberLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 6XXXXXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('registerDialog.emailLabel')}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="town"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('registerDialog.townLabel')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>{t('registerDialog.quarterLabel')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("registerDialog.sections.security")}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('registerDialog.passwordLabel')}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
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
                        <FormLabel>{t('registerDialog.confirmPasswordLabel')}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('registerDialog.submitButton')
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <div className="text-center text-sm">
            {t('loginDialog.alreadyHaveAccount')} <Link href="/auth/login" className="text-primary hover:underline">{t('nav.login')}</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
