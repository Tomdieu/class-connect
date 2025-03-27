"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useI18n } from "@/locales/client";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { updateUser } from "@/actions/accounts";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AdminPersonalInfoFormProps {
  defaultValues: {
    first_name: string;
    last_name: string;
    phone_number: string;
    date_of_birth: string;
    language: "fr" | "en";
    town: string;
    quarter: string;
    enterprise_name: string;
    platform_usage_reason: string;
    is_staff: boolean;
    is_superuser: boolean;
  };
}

export default function AdminPersonalInfoForm({ defaultValues }: AdminPersonalInfoFormProps) {
  const { data: session, update } = useSession();
  const t = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Define form schema with zod
  const formSchema = z.object({
    first_name: z.string().min(2, { message: t("validation.firstNameRequired") }),
    last_name: z.string().min(2, { message: t("validation.lastNameRequired") }),
    phone_number: z
      .string()
      .min(9, { message: t("validation.phoneNumberInvalid") })
      .max(15, { message: t("validation.phoneNumberInvalid") }),
    date_of_birth: z.string().optional(),
    language: z.enum(["fr", "en"]),
    town: z.string().optional(),
    quarter: z.string().optional(),
    enterprise_name: z.string().optional(),
    platform_usage_reason: z.string().optional(),
    is_staff: z.boolean(),
    is_superuser: z.boolean(),
  });

  // Initialize form with defaultValues
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Setup mutation for updating user info
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!session?.user?.id) {
        throw new Error("User ID not found");
      }
      return await updateUser({
        id: session.user.id,
        body: values,
      });
    },
    onSuccess: (updatedUser) => {
      // Update session with new user data
      if (session) {
        update({
          ...session,
          user: {
            ...session.user,
            ...updatedUser,
          },
        });
      }

      // Update cached user data
      queryClient.invalidateQueries({ queryKey: ['userInfo'] });

      toast.success(t("common.success"), {
        description: t("profile.personalInfoUpdated"),
      });

      // Refresh the page to reflect changes
      router.refresh();
    },
    onError: (error) => {
      console.error("Error updating user:", error);
      toast.error(t("common.error"), {
        description: t("profile.updateFailed"),
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.firstName")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("profile.firstNamePlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Last Name */}
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.lastName")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("profile.lastNamePlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Phone Number */}
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.phoneNumber")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("profile.phoneNumberPlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Date of Birth */}
          <FormField
            control={form.control}
            name="date_of_birth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.dateOfBirth")}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Language */}
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.language")}</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("profile.selectLanguage")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Town */}
          <FormField
            control={form.control}
            name="town"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.town")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("profile.townPlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Quarter */}
          <FormField
            control={form.control}
            name="quarter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.quarter")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("profile.quarterPlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Enterprise Name */}
          <FormField
            control={form.control}
            name="enterprise_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.enterpriseName")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("profile.enterpriseNamePlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Platform Usage Reason */}
        <FormField
          control={form.control}
          name="platform_usage_reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.platformUsageReason")}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t("profile.platformUsageReasonPlaceholder")} 
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Admin-specific fields */}
        <div className="space-y-4 border rounded-md p-4">
          <h3 className="font-semibold">{t("admin.permissions") || "Permissions"}</h3>
          
          <FormField
            control={form.control}
            name="is_staff"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  {t("admin.isStaff") || "Staff privileges"}
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="is_superuser"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  {t("admin.isSuperuser") || "Superuser privileges"}
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t("common.saving")}
            </>
          ) : (
            t("common.save")
          )}
        </Button>
      </form>
    </Form>
  );
}