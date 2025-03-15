"use client";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
} from "@/components/ui/credenza";
import { DialogTitle } from "@/components/ui/dialog";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
import { BookOpen, Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
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
import { useUserStore } from "@/hooks/user-store";
import { Switch } from "@/components/ui/switch";
import { updateUser } from "@/actions/accounts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

function UserDialog() {
  const { isOpen, user, onClose } = useUserStore();
  const t = useI18n();
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Create registration schema with translations and conditional validation
  const createRegisterSchema = (t: (key: string) => string) => {
    const baseSchema = z.object({
      id: z.string(),
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

      email: z
        .string()
        .min(1, { message: t("registerDialog.errors.emailRequired") })
        .email({ message: t("registerDialog.errors.emailInvalid") }),

      is_staff: z.boolean(),
      is_active: z.boolean(),
    });

    // Add conditional validation based on is_staff
    return z.discriminatedUnion("is_staff", [
      // Schema for staff/admin users
      baseSchema.extend({
        is_staff: z.literal(true),
        date_of_birth: z.string().optional().nullable(),
        education_level: z.enum(EDUCATION_LEVELS).optional().nullable(),
        town: z.string().optional().nullable(),
        quarter: z.string().optional().nullable(),
        college_class: z.enum(COLLEGE_CLASSES).optional().nullable(),
        lycee_class: z.enum(LYCEE_CLASSES).optional().nullable(),
        lycee_speciality: z.enum(LYCEE_SPECIALITIES).optional().nullable(),
        university_level: z.enum(UNIVERSITY_LEVELS).optional().nullable(),
        university_year: z.string().optional().nullable(),
        enterprise_name: z.string().optional().nullable(),
        platform_usage_reason: z.string().optional().nullable(),
      }),
      // Schema for regular users (with all validations)
      baseSchema.extend({
        is_staff: z.literal(false),
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
        town: z
          .string()
          .min(1, { message: t("registerDialog.errors.townRequired") })
          .min(2, { message: t("registerDialog.errors.townMin") }),
        quarter: z
          .string()
          .min(1, { message: t("registerDialog.errors.quarterRequired") })
          .min(2, { message: t("registerDialog.errors.quarterMin") }),
        college_class: z.enum(COLLEGE_CLASSES).optional().nullable(),
        lycee_class: z.enum(LYCEE_CLASSES).optional().nullable(),
        lycee_speciality: z.enum(LYCEE_SPECIALITIES).optional().nullable(),
        university_level: z.enum(UNIVERSITY_LEVELS).optional().nullable(),
        university_year: z.string().optional().nullable(),
        enterprise_name: z.string().optional().nullable(),
        platform_usage_reason: z.string().optional().nullable(),
      }),
    ]);
  };

  type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(createRegisterSchema(t as keyof typeof t)),
    mode: "onSubmit",
    defaultValues: {
      id: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      date_of_birth: "", // Changed from null to empty string
      education_level: undefined, // Changed from null to undefined
      email: "",
      town: "", // Changed from null to empty string
      quarter: "", // Changed from null to empty string
      is_staff: false,
      is_active: true,
      college_class: undefined, // Changed from null to undefined
      lycee_class: undefined,
      lycee_speciality: undefined,
      university_level: undefined,
      university_year: "",
      enterprise_name: "",
      platform_usage_reason: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        date_of_birth: user.date_of_birth || "", // Changed from null to empty string
        education_level: user.education_level || undefined, // Changed from null to undefined
        email: user.email,
        town: user.town || "", // Changed from null to empty string
        quarter: user.quarter || "", // Changed from null to empty string
        college_class: user.college_class || undefined, // Changed from null to undefined
        lycee_class: user.lycee_class || undefined,
        lycee_speciality: user.lycee_speciality || undefined,
        university_level: user.university_level || undefined,
        university_year: user.university_year || "",
        enterprise_name: user.enterprise_name || "",
        platform_usage_reason: user.platform_usage_reason || "",
        is_staff: user.is_staff,
        is_active: user.is_active,
      });
      
      // Set university level state if it exists
      if (user.university_level) {
        setUniversityLevel(user.university_level);
      }
    }
  }, [form, user]);

  // Add state for university level
  const [universityLevel, setUniversityLevel] = React.useState<string>("");

  // Update form validation whenever language changes
  useEffect(() => {
    if (form.formState.isDirty) {
      form.trigger();
    }
  }, [form, t]);

  // Update useEffect to handle is_staff changes
  useEffect(() => {
    const isStaff = form.watch("is_staff");
    if (isStaff) {
      // Clear validation errors for optional fields when user becomes staff
      form.clearErrors(["date_of_birth", "education_level", "town", "quarter"]);
    }
  }, [form]);

  // Add update user mutation
  const updateUserMutation = useMutation({
    mutationFn: updateUser,
  });

  const router = useRouter()

  const handleRegisterSubmit = async (values: RegisterFormData) => {
    try {
      setError(null);
      // Remove id from values before sending to API
      const { id, ...updateData } = values;

      // Call the updateUser mutation
      updateUserMutation.mutate(
        {
          id: user?.id ||id|| "",
          body: updateData,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User updated successfully");
            router.refresh()
            onClose();
          },
          onError: (error: any) => {
            let errorMessage = "Failed to update user";
            try {
              const parsedError = JSON.parse(error.message);
              errorMessage = parsedError.message || errorMessage;
              // If there are field-specific errors, set them on the form
              if (
                parsedError.detail &&
                typeof parsedError.detail === "object"
              ) {
                Object.entries(parsedError.detail).forEach(
                  ([field, message]) => {
                    form.setError(field as any, {
                      type: "manual",
                      message: Array.isArray(message)
                        ? message[0]
                        : (message as string),
                    });
                  }
                );
              }
            } catch (e) {
              // If parsing fails, use the original error message
            }
            setError(errorMessage);
            toast.error(errorMessage);
          },
        }
      );
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Render dynamic fields based on education level
  const renderDynamicFields = () => {
    const educationLevel = form.watch("education_level");
    const lyceeClass = form.watch("lycee_class");

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
    <Credenza open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <CredenzaContent className="px-3 py-5 ">
        <div className="overflow-y-auto max-h-[calc(100vh-120px)] w-full">
          <CredenzaHeader>
            <div className="flex flex-col items-center space-y-4">
              <DialogTitle className="text-2xl font-bold text-center">
                {t("userDialog.title")}
              </DialogTitle>
              <p className="text-sm text-gray-500 text-center">
                {t("userDialog.subtitle")}
              </p>
            </div>
          </CredenzaHeader>
          <div className="overflow-y-auto px-2 pb-8 flex flex-col items-center justify-center custom-scrollbar">
            {error && (
              <div className="w-full mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
                <span className="text-red-600 text-sm font-medium">
                  {error}
                </span>
              </div>
            )}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleRegisterSubmit)}
                className="flex flex-col gap-2 w-full"
              >
                <div className="grid gap-1 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          {t("registerDialog.firstNameLabel")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("registerDialog.firstNameLabel")}
                            {...field}
                          />
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
                        <FormLabel>
                          {t("registerDialog.lastNameLabel")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("registerDialog.lastNameLabel")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("registerDialog.phoneNumberLabel")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("registerDialog.phoneNumberLabel")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-1 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("registerDialog.dateOfBirthLabel")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            placeholder={t("registerDialog.dateOfBirthLabel")}
                            className="w-full"
                            value={field.value || ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                          />
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
                        <FormLabel>
                          {t("registerDialog.educationLevelLabel")}
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t(
                                  "registerDialog.educationLevelLabel"
                                )}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {EDUCATION_LEVELS.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {t(
                                    `registerDialog.educationLevels.${level.toLowerCase()}` as keyof typeof t
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
                </div>
                {renderDynamicFields()}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("registerDialog.emailLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="town"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("registerDialog.townLabel")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("registerDialog.townLabel")}
                            {...field}
                          />
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
                        <FormLabel>
                          {t("registerDialog.quarterLabel")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("registerDialog.quarterLabel")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="is_staff"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 py-2">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Admin Access
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 py-2">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Account Active
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={
                    form.formState.isSubmitting || updateUserMutation.isPending
                  }
                  className="flex items-center justify-center gap-2"
                >
                  {(form.formState.isSubmitting ||
                    updateUserMutation.isPending) && (
                    <Loader className="size-4 animate-spin" />
                  )}
                  {t("userDialog.submitButton")}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}

export default UserDialog;
