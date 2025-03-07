"use client";
import {
  Credenza,
  CredenzaClose,
  CredenzaContent,
  CredenzaHeader,
} from "@/components/ui/credenza";
import { DialogTitle } from "@/components/ui/dialog";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
import { BookOpen, LoaderCircle } from "lucide-react";
import React, { useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { registerUser } from "@/actions/accounts";
import { UserCreateType } from "@/types";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

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

function RegisterDialog() {
  const { isRegisterOpen, closeDialog } = useAuthDialog();
  const t = useI18n();
  const router = useRouter();

  // Create registration schema with translations
  const createRegisterSchema = (t: (key: string) => string) =>
    z
      .object({
        first_name: z
          .string()
          .min(1, { message: t("registerDialog.errors.firstNameRequired") })
          .min(2, { message: t("registerDialog.errors.firstNameMin") }),

        last_name: z
          .string()
          .min(1, { message: t("registerDialog.errors.lastNameRequired") })
          .min(2, { message: t("registerDialog.errors.lastNameMin") }),

        phone_number: z
          .string()
          .min(1, { message: t("registerDialog.errors.phoneRequired") })
          .regex(/^[0-9+\s-]+$/, {
            message: t("registerDialog.errors.phoneInvalid"),
          }),

        date_of_birth: z
          .string()
          .min(1, { message: t("registerDialog.errors.dateRequired") })
          .refine(
            (date) => {
              const birthDate = new Date(date);
              const today = new Date();
              const age = today.getFullYear() - birthDate.getFullYear();
              return age >= 13;
            },
            { message: t("registerDialog.errors.dateMinAge") }
          ),

        education_level: z.enum(EDUCATION_LEVELS, {
          errorMap: () => ({
            message: t("registerDialog.errors.educationLevelRequired"),
          }),
        }),

        email: z
          .string()
          .min(1, { message: t("registerDialog.errors.emailRequired") })
          .email({ message: t("registerDialog.errors.emailInvalid") }),

        town: z
          .string()
          .min(1, { message: t("registerDialog.errors.townRequired") })
          .min(2, { message: t("registerDialog.errors.townMin") }),

        quarter: z
          .string()
          .min(1, { message: t("registerDialog.errors.quarterRequired") })
          .min(2, { message: t("registerDialog.errors.quarterMin") }),

        password: z
          .string()
          .min(1, { message: t("registerDialog.errors.passwordRequired") })
          .min(8, { message: t("registerDialog.errors.passwordMin") })
          .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
            message: t("registerDialog.errors.passwordComplexity"),
          }),
        confirm_password: z.string().min(1, {
          message: t("registerDialog.errors.confirmPasswordRequired"),
        }),
        // Dynamic fields
        college_class: z.enum(COLLEGE_CLASSES).optional(),
        lycee_class: z.enum(LYCEE_CLASSES).optional(),
        lycee_speciality: z.enum(LYCEE_SPECIALITIES).optional(),
        university_level: z.enum(UNIVERSITY_LEVELS).optional(),
        university_year: z.string().optional(),
        enterprise_name: z.string().optional(),
        platform_usage_reason: z.string().optional(),
      })
      .refine((data) => data.password === data.confirm_password, {
        message: t("registerDialog.errors.passwordsMustMatch"),
        path: ["confirm_password"],
      })
      .refine(
        (data) => {
          // Add validation for speciality
          if (
            data.education_level === "LYCEE" &&
            ["2nde", "1ere", "terminale"].includes(data.lycee_class || "")
          ) {
            return !!data.lycee_speciality;
          }
          return true;
        },
        {
          message: "Speciality is required for this class",
          path: ["lycee_speciality"],
        }
      );

  type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(createRegisterSchema(t as keyof typeof t)),
    mode: "onSubmit",
    defaultValues: {
      first_name: "",
      last_name: "",
      phone_number: "",
      date_of_birth: "",
      education_level: undefined,
      email: "",
      town: "",
      quarter: "",
      password: "",
      confirm_password: "",
      // Initialize all optional fields
      college_class: undefined,
      lycee_class: undefined,
      lycee_speciality: undefined,
      university_level: undefined,
      university_year: "",
      enterprise_name: "",
      platform_usage_reason: "",
    },
  });

  const { errors } = form.formState;

  console.log({ errors });

  // Add state for university level
  const [universityLevel, setUniversityLevel] = React.useState<string>("");

  // Update form validation whenever language changes
  useEffect(() => {
    if (form.formState.isDirty) {
      form.trigger();
    }
  }, [form, t]);

  const registerMutation = useMutation({
    mutationFn: (data: UserCreateType) => registerUser(data),
    onSuccess: () => {
      toast.success("Registration successful! Please login to continue.");
      closeDialog(false);
      router.refresh();
    },
    onError: (error) => {
      try {
        const errorData = JSON.parse(error.message || "{}");

        // Handle field-specific errors
        if (errorData.email) {
          form.setError("email", {
            message: Array.isArray(errorData.email)
              ? errorData.email[0]
              : errorData.email,
          });
        }

        if (errorData.phone_number) {
          form.setError("phone_number", {
            message: Array.isArray(errorData.phone_number)
              ? errorData.phone_number[0]
              : errorData.phone_number,
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
            description:
              errorData.message ||
              "Something went wrong. Please check your input and try again.",
          });
        }
      } catch (e) {
        console.error("Error parsing error response:", e);
        toast.error("Registration failed. Please try again.", {
          description: "An unexpected error occurred",
        });
      } 
    },
  });

  const handleRegisterSubmit = async (values: RegisterFormData) => {
    const formData: UserCreateType = {
      first_name: values.first_name,
      last_name: values.last_name,
      phone_number: values.phone_number,
      date_of_birth: values.date_of_birth,
      education_level: values.education_level,
      email: values.email,
      town: values.town,
      quarter: values.quarter,
      password: values.password,
      college_class: values.college_class,
      lycee_class: values.lycee_class,
      lycee_speciality: values.lycee_speciality,
      university_level: values.university_level,
      university_year: values.university_year,
      enterprise_name: values.enterprise_name,
      platform_usage_reason: values.platform_usage_reason,
    };

    registerMutation.mutate(formData);
  };

  // Render dynamic fields based on education level
  const renderDynamicFields = () => {
    const educationLevel = form.watch("education_level");

    if (educationLevel === "COLLEGE") {
      return (
        <FormField
          control={form.control}
          name="college_class"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("registerDialog.collegeClassLabel")}</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("registerDialog.collegeClassLabel")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLEGE_CLASSES.map((collegeClass) => (
                      <SelectItem key={collegeClass} value={collegeClass}>
                        {t(
                          `registerDialog.collegeClasses.${collegeClass}` as keyof typeof t
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (educationLevel === "LYCEE") {
      return (
        <>
          <FormField
            control={form.control}
            name="lycee_class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("registerDialog.lyceeClassLabel")}</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("registerDialog.lyceeClassLabel")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {LYCEE_CLASSES.map((lyceeClass) => (
                        <SelectItem key={lyceeClass} value={lyceeClass}>
                          {t(
                            `registerDialog.lyceeClasses.${lyceeClass}` as keyof typeof t
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lycee_speciality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("registerDialog.lyceeSpecialityLabel")}
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("registerDialog.lyceeSpecialityLabel")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {LYCEE_SPECIALITIES.map((speciality) => (
                        <SelectItem key={speciality} value={speciality}>
                          {t(
                            `registerDialog.lyceeSpecialities.${speciality}` as keyof typeof t
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      );
    }

    if (educationLevel === "UNIVERSITY") {
      return (
        <>
          <FormField
            control={form.control}
            name="university_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("registerDialog.universityLevelLabel")}
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setUniversityLevel(value);
                    }}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("registerDialog.universityLevelLabel")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIVERSITY_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {t(
                            `registerDialog.universityLevels.${level}` as keyof typeof t
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {universityLevel === "licence" && (
            <FormField
              control={form.control}
              name="university_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("registerDialog.licenceYearLabel")}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("registerDialog.licenceYearLabel")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {LICENCE_YEARS.map((year) => (
                          <SelectItem key={year} value={year}>
                            {t(
                              `registerDialog.licenceYears.${year}` as keyof typeof t
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {universityLevel === "master" && (
            <FormField
              control={form.control}
              name="university_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("registerDialog.masterYearLabel")}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("registerDialog.masterYearLabel")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {MASTER_YEARS.map((year) => (
                          <SelectItem key={year} value={year}>
                            {t(
                              `registerDialog.masterYears.${year}` as keyof typeof t
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </>
      );
    }

    if (educationLevel === "PROFESSIONAL") {
      return (
        <>
          <FormField
            control={form.control}
            name="enterprise_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("registerDialog.enterpriseNameLabel")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("registerDialog.enterpriseNameLabel")}
                    {...field}
                  />
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
                <FormLabel>
                  {t("registerDialog.platformUsageReasonLabel")}
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
                    placeholder={t("registerDialog.platformUsageReasonLabel")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      );
    }

    return null;
  };

  return (
    <Credenza open={isRegisterOpen} onOpenChange={closeDialog}>
      <CredenzaContent className="max-w-2xl p-0 overflow-hidden">
        <div className="relative overflow-scroll pt-5">
          {/* Decorative background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100/50" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200/20 rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-200/20 rounded-full filter blur-3xl" />
          </div>

          <div className="relative">
            {/* Header */}
            <CredenzaHeader className="pb-6">
              <div className="text-center space-y-2">
                <div className="flex flex-col items-center">
                  <div className="p-3 rounded-2xl bg-blue-100/80 backdrop-blur-sm mb-4">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    {t("registerDialog.title")}
                  </DialogTitle>
                  <p className="text-gray-500 text-base max-w-sm mt-2">
                    {t("registerDialog.subtitle")}
                  </p>
                </div>
              </div>
            </CredenzaHeader>

            {/* Form */}
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-6 pb-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleRegisterSubmit)}
                  className="space-y-6"
                >
                  {/* Personal Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Personal Information
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Name fields */}
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">
                              {t("registerDialog.firstNameLabel")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("registerDialog.firstNameLabel")}
                                className="h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">
                              {t("registerDialog.lastNameLabel")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("registerDialog.lastNameLabel")}
                                className="h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="date_of_birth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            {t("registerDialog.dateOfBirthLabel")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Education Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Education Details
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="education_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">
                              {t("registerDialog.educationLevelLabel")}
                            </FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20">
                                  <SelectValue
                                    placeholder={t(
                                      "registerDialog.educationLevelLabel"
                                    )}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {EDUCATION_LEVELS.map((level) => (
                                    <SelectItem
                                      key={level}
                                      value={level}
                                      className="cursor-pointer"
                                    >
                                      {t(
                                        `registerDialog.educationLevels.${level.toLowerCase()}` as keyof typeof t
                                      )}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-4">{renderDynamicFields()}</div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Contact Information
                    </h3>
                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            {t("registerDialog.phoneNumberLabel")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("registerDialog.phoneNumberLabel")}
                              className="h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            {t("registerDialog.emailLabel")}
                          </FormLabel>
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
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="town"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">
                              {t("registerDialog.townLabel")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("registerDialog.townLabel")}
                                className="h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="quarter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">
                              {t("registerDialog.quarterLabel")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("registerDialog.quarterLabel")}
                                className="h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Security Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Security
                    </h3>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            {t("registerDialog.passwordLabel")}
                          </FormLabel>
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
                    <FormField
                      control={form.control}
                      name="confirm_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            {t("registerDialog.confirmPasswordLabel")}
                          </FormLabel>
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
                  </div>

                  <div className="flex gap-5 items-center">
                    <CredenzaClose asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        className="w-32 h-11 border-gray-200 text-white hover:bg-red-500/70 hover:text-white font-medium rounded-xl"
                        disabled={registerMutation.isPending}
                      >
                        {t("registerDialog.closeButton")}
                      </Button>
                    </CredenzaClose>
                    <Button
                      type="submit"
                      disabled={registerMutation.isPending}
                      className="flex-1 h-11 bg-default hover:bg-default/90 text-white font-medium rounded-xl"
                    >
                      {registerMutation.isPending && (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {t("registerDialog.submitButton")}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}

export default RegisterDialog;
