"use client";

import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { registerUser } from "@/actions/accounts";

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
  const [isLoading, setIsLoading] = useState(false);
  const [additionalFieldsTab, setAdditionalFieldsTab] = useState<string>("college");
  
  // Create form schema with translations
  const RegisterSchema = z.object({
    first_name: z.string().min(2, t('registerDialog.errors.firstNameMin')),
    last_name: z.string().min(2, t('registerDialog.errors.lastNameMin')),
    phone_number: z.string().min(9, t('registerDialog.errors.phoneInvalid')),
    date_of_birth: z.date({
      required_error: t('registerDialog.errors.dateRequired'),
    }),
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
  });

  // Form setup
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone_number: "",
      education_level: "COLLEGE",
      email: "",
      town: "",
      quarter: "",
      password: "",
      confirm_password: "",
      college_class: "6eme",
    },
  });

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

  async function onSubmit(values: z.infer<typeof RegisterSchema>) {
    setIsLoading(true);
    
    try {
      // Create the registration data based on education level
      const registerData: any = {
        first_name: values.first_name,
        last_name: values.last_name,
        phone_number: values.phone_number,
        date_of_birth: format(values.date_of_birth, 'yyyy-MM-dd'),
        education_level: values.education_level,
        email: values.email,
        town: values.town,
        quarter: values.quarter,
        password: values.password,
      };

      // Add level-specific fields
      switch (values.education_level) {
        case 'COLLEGE':
          registerData.class_name = values.college_class;
          break;
        case 'LYCEE':
          registerData.class_name = values.lycee_class;
          registerData.speciality = values.lycee_speciality;
          break;
        case 'UNIVERSITY':
          registerData.university_level = values.university_level;
          
          if (values.university_level === 'licence') {
            registerData.licence_year = values.licence_year;
          } else if (values.university_level === 'master') {
            registerData.master_year = values.master_year;
          }
          break;
        case 'PROFESSIONAL':
          registerData.enterprise_name = values.enterprise_name;
          registerData.platform_usage_reason = values.platform_usage_reason;
          break;
      }

      // Call the registration API
      await registerUser(registerData);
      
      toast.success("Registration successful! Please check your email to verify your account.");
      
      // Redirect to login page
      router.push('/auth/login');
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please check your details and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal Information */}
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
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t('registerDialog.dateOfBirthLabel')}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                        <Input type="email" placeholder="example@mail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                              {t(`registerDialog.educationLevels.${level.toLowerCase()}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Education Level Specific Fields */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-medium text-base mb-3">{t(`registerDialog.educationLevels.${educationLevel.toLowerCase()}` as keyof typeof t)}</h3>
                
                <Tabs value={additionalFieldsTab} onValueChange={setAdditionalFieldsTab}>
                  <TabsContent value="college" className="mt-4">
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
                  
                  <TabsContent value="lycee" className="space-y-4 mt-4">
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
                  
                  <TabsContent value="university" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="university_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('registerDialog.universityLevelLabel')}</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
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
                    
                    {form.watch('university_level') === 'licence' && (
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
                    
                    {form.watch('university_level') === 'master' && (
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
                  
                  <TabsContent value="professional" className="space-y-4 mt-4">
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
                            <Input {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Location Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
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
