"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { updateUser } from "@/actions/accounts";
import { toast } from "sonner";
import { UserType } from "@/types";

interface PersonalInfoFormProps {
  defaultValues: {
    phone_number: string;
    date_of_birth: string;
    language: "fr" | "en";
    town: string;
    quarter: string;
    enterprise_name?: string;
    platform_usage_reason?: string;
  };
}

export default function PersonalInfoForm({ defaultValues }: PersonalInfoFormProps) {
  const { data: session, update } = useSession();
  const t = useI18n();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isProfessional = session?.user?.education_level === "PROFESSIONAL";

  // Format date from ISO string to YYYY-MM-DD for date input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) 
      ? date.toISOString().split('T')[0]
      : "";
  };

  // Define form schema with zod for personal info
  const formSchema = z.object({
    phone_number: z.string()
      .min(1, { message: t("validation.phoneRequired") })
      .regex(/^\+?[0-9]{8,15}$/, { message: t("validation.phoneInvalid") }),
    date_of_birth: z.string().optional(),
    language: z.enum(["fr", "en"]),
    town: z.string().min(1, { message: t("validation.townRequired") }),
    quarter: z.string().min(1, { message: t("validation.quarterRequired") }),
    enterprise_name: isProfessional 
      ? z.string().min(1) 
      : z.string().optional(),
    platform_usage_reason: isProfessional 
      ? z.string().min(1) 
      : z.string().optional(),
  });

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone_number: defaultValues.phone_number || "",
      date_of_birth: formatDateForInput(defaultValues.date_of_birth || ""),
      language: defaultValues.language || "fr",
      town: defaultValues.town || "",
      quarter: defaultValues.quarter || "",
      enterprise_name: defaultValues.enterprise_name || "",
      platform_usage_reason: defaultValues.platform_usage_reason || "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session?.user?.id) {
      toast.error(t("profile.updateFailed"));
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Update user information
      const updatedUser = await updateUser({
        id: session.user.id,
        body: values,
      });

      // Update session with new information
      await update({
        ...session.user,
        phone_number: values.phone_number,
        date_of_birth: values.date_of_birth,
        language: values.language,
        town: values.town,
        quarter: values.quarter,
        enterprise_name: values.enterprise_name,
        platform_usage_reason: values.platform_usage_reason,
      });

      toast.success(t("profile.personalInfoUpdated"));
    } catch (error) {
      let errorMessage = t("profile.updateFailed");
      
      try {
        const parsedError = JSON.parse(error as string);
        if (parsedError.message) {
          errorMessage = parsedError.message;
        }
      } catch (e) {
        // Use default error message
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Phone Number */}
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.phone")}</FormLabel>
              <FormControl>
                <Input placeholder="+237 6XXXXXXXX" {...field} />
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
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
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
                <Input {...field} />
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Enterprise Name - Only for professional users */}
        {isProfessional && (
          <FormField
            control={form.control}
            name="enterprise_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.enterpriseName")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {/* Platform Usage Reason - Only for professional users */}
        {isProfessional && (
          <FormField
            control={form.control}
            name="platform_usage_reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.platformUsage")}</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t("common.saving")}
            </>
          ) : (
            t("profile.updateProfile")
          )}
        </Button>
      </form>
    </Form>
  );
}
