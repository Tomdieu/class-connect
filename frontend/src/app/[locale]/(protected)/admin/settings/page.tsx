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

  // Define the form schema with translated validation messages
  const formSchema = z.object({
    site_name: z.string().min(1, {
      message: t('settings.validation.siteNameRequired'),
    }),
    email: z.string().email({
      message: t('settings.validation.emailInvalid'),
    }),
    currency: z.string().min(1, {
      message: t('settings.validation.currencyRequired'),
    }),
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

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      site_name: "",
      email: "",
      currency: "",
      tax_rate: 0,
    },
  });

  // Update form values when data is loaded
  useEffect(() => {
    if (data) {
      form.reset({
        site_name: data.site_name,
        email: data.email,
        currency: data.currency,
        tax_rate: data.tax_rate,
      });
    }
  }, [data, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    settingsMutation.mutate(values as Partial<SiteSettings>);
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
                    <FormLabel>{t('settings.siteName')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>{t('settings.contactEmail')}</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
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
                    <FormLabel>{t('settings.currency')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>{t('settings.taxRate')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))}
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