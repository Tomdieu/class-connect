"use client"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getSiteSettings, updateSiteSettings } from "@/actions/site-settings";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SiteSettings } from "@/types";
import { Loader2 } from "lucide-react";
import { useCurrentLocale, useI18n } from "@/locales/client";

const SettingsPage = () => {
  const t = useI18n();

  // Define the form schema with optional fields
  const formSchema = z.object({
    site_name: z.string().optional(),
    email: z.string().email({
      message: t('settings.validation.emailInvalid'),
    }).optional().or(z.literal("")),
    currency: z.string().optional(),
    tax_rate: z.number().min(0).max(100, {
      message: t('settings.validation.taxRateRange'),
    }).optional(),
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['settings'],
    queryFn: () => getSiteSettings()
  });

  const settingsMutation = useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: () => {
      toast(t('settings.saveSuccess'), {
        description: t('settings.saveSuccessDesc'),
      });
    },
    onError: () => {
      toast(t('settings.saveError'), {
        description: t('settings.saveErrorDesc'),
      });
    }
  });

  // Initialize the form with empty defaults
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      site_name: "",
      email: "",
      currency: "",
      tax_rate: undefined,
    },
  });

  // Update form values when data is loaded
  useEffect(() => {
    if (data) {
      form.reset({
        site_name: data.site_name || "",
        email: data.email || "",
        currency: data.currency || "",
        tax_rate: data.tax_rate || undefined,
      });
    }
  }, [data, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Filter out empty strings and undefined values for cleaner data
    const cleanedValues = Object.fromEntries(
      Object.entries(values).filter(([_, value]) => value !== "" && value !== undefined)
    );
    
    settingsMutation.mutate(cleanedValues as Partial<SiteSettings>);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6 container mx-auto">
        <h2 className="text-2xl font-bold">{t('settings.title')}</h2>
        <Card className="p-6">
          <p className="text-red-500">{t('settings.loadingError')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto flex flex-col gap-5">
      <h2 className="text-2xl font-bold">{t('settings.title')}</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">{t('settings.generalSettings')}</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="site_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.siteName')} <span className="text-gray-500">(Optional)</span></FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter site name..."
                        value={field.value || ""} 
                      />
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
                    <FormLabel>{t('settings.contactEmail')} <span className="text-gray-500">(Optional)</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        {...field} 
                        placeholder="contact@example.com"
                        value={field.value || ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">{t('settings.paymentSettings')}</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.currency')} <span className="text-gray-500">(Optional)</span></FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="USD, EUR, XAF..."
                        value={field.value || ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.taxRate')} <span className="text-gray-500">(Optional)</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="0.00"
                        {...field} 
                        value={field.value || ""} 
                        onChange={e => {
                          const value = e.target.value;
                          field.onChange(value === "" ? undefined : parseFloat(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={settingsMutation.isPending}
              className="min-w-[120px]"
            >
              {settingsMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('settings.saving')}</span>
                </div>
              ) : t('settings.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SettingsPage