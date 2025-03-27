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
import { updateUser } from "@/actions/accounts";
import { toast } from "sonner";

interface EmailFormProps {
  defaultValues: {
    oldEmail: string;
    newEmail: string;
    confirmEmail: string;
  };
}

export default function EmailForm({ defaultValues }: EmailFormProps) {
  const { data: session, update } = useSession();
  const t = useI18n();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define form schema with zod for email change
  const formSchema = z
    .object({
      newEmail: z.string().email({ message: t("validation.validEmail") }),
      confirmEmail: z.string().email({ message: t("validation.validEmail") }),
    })
    .refine((data) => data.newEmail === data.confirmEmail, {
      message: t("validation.emailsDoNotMatch"),
      path: ["confirmEmail"],
    });

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newEmail: defaultValues.newEmail || "",
      confirmEmail: defaultValues.confirmEmail || "",
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
      
      // Update user email
      await updateUser({
        id: session.user.id,
        body: { email: values.newEmail },
      });

      // Update session with new email
      await update({ email: values.newEmail });

      toast.success(t("profile.emailUpdated"));
      
      // Reset confirmation field
      form.setValue("confirmEmail", "");
    } catch (error) {
      let errorMessage = t("profile.emailUpdateFailed");
      
      try {
        const parsedError = JSON.parse(error as string);
        if (parsedError.email) {
          errorMessage = parsedError.email[0];
        } else if (parsedError.message) {
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
        {/* Current Email - Read only */}
        <FormItem>
          <FormLabel>{t("profile.email")} ({t("common.current")})</FormLabel>
          <Input 
            value={defaultValues.oldEmail} 
            disabled 
            readOnly 
          />
        </FormItem>
        
        {/* New Email */}
        <FormField
          control={form.control}
          name="newEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.newEmail")}</FormLabel>
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
        
        {/* Confirm Email */}
        <FormField
          control={form.control}
          name="confirmEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.confirmEmail")}</FormLabel>
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
            t("profile.updateEmail")
          )}
        </Button>
      </form>
    </Form>
  );
}
