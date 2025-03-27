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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { changePassword } from "@/actions/accounts";
import { toast } from "sonner";

export default function AdminPasswordForm() {
  const { data: session } = useSession();
  const t = useI18n();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define form schema with zod for password change
  const formSchema = z
    .object({
      current_password: z.string().min(1, { message: t("validation.currentPasswordRequired") }),
      new_password: z
        .string()
        .min(8, { message: t("validation.passwordMinLength") })
        .refine(
          (value) => /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value),
          {
            message: t("validation.passwordRequirements"),
          }
        ),
      confirm_password: z.string().min(1, { message: t("validation.confirmPasswordRequired") }),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: t("validation.passwordsDoNotMatch"),
      path: ["confirm_password"],
    });

  // Initialize form with empty values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
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
      await changePassword({
        id: session.user.id,
        body: {
          current_password: values.current_password,
          new_password: values.new_password,
          confirm_password: values.confirm_password,
        },
      });

      toast.success(t("profile.passwordUpdated"));

      // Reset form fields
      form.reset();
    } catch (error) {
      let errorMessage = t("profile.passwordUpdateFailed");
      
      // Try to parse the error message if it's a JSON string
      try {
        const parsedError = JSON.parse(error as string);
        if (parsedError.current_password) {
          errorMessage = parsedError.current_password[0];
        } else if (parsedError.message) {
          errorMessage = parsedError.message;
        }
      } catch (e) {
        // If parsing fails, use the default error message
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Current Password */}
        <FormField
          control={form.control}
          name="current_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.currentPassword")}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* New Password */}
        <FormField
          control={form.control}
          name="new_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.newPassword")}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Confirm New Password */}
        <FormField
          control={form.control}
          name="confirm_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.confirmPassword")}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="text-sm text-muted-foreground mb-2">
          {t("profile.passwordRequirementsInfo")}
        </div>
        
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
            t("profile.changePassword")
          )}
        </Button>
      </form>
    </Form>
  );
}