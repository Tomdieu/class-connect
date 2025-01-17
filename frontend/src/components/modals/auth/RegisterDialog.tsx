"use client";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
} from "@/components/ui/credenza";
import { DialogTitle } from "@/components/ui/dialog";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
import { BookOpen } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";
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

const registerSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  phone_number: z.string(),
  date_of_birth: z.string(),
  education_level: z.string(),
  email: z.string(),
  town: z.string(),
  quarter: z.string(),
  password: z.string(),
});

type RegisterSchemaType = z.infer<typeof registerSchema>;

function RegisterDialog() {
  const { isRegisterOpen, closeDialog } = useAuthDialog();
  const t = useI18n();

  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
  });

  const handleRegisterSubmit = (values: RegisterSchemaType) => {
    console.log(values);
  };

  return (
    <Credenza open={isRegisterOpen} onOpenChange={closeDialog}>
      <CredenzaContent>
        <div className="overflow-y-auto max-h-[calc(100vh-120px)] w-full">
          <CredenzaHeader>
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 rounded-full bg-blue-100">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <DialogTitle className="text-2xl font-bold text-center">
                {t("registerDialog.title")}
              </DialogTitle>
              <p className="text-sm text-gray-500 text-center">
                {t("registerDialog.subtitle")}
              </p>
            </div>
          </CredenzaHeader>
          <div className="overflow-y-auto px-2 pb-8 flex flex-col items-center justify-center custom-scrollbar">
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
                        <FormLabel>{t("registerDialog.firstNameLabel")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("registerDialog.firstNameLabel")} {...field} />
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
                        <FormLabel>{t("registerDialog.lastNameLabel")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("registerDialog.lastNameLabel")} {...field} />
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
                      <FormLabel>{t("registerDialog.phoneNumberLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("registerDialog.phoneNumberLabel")} {...field} />
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
                        <FormLabel>{t("registerDialog.dateOfBirthLabel")}</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            placeholder={t("registerDialog.dateOfBirthLabel")}
                            className="w-full"
                            {...field}
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
                        <FormLabel>{t("registerDialog.educationLevelLabel")}</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t("registerDialog.educationLevelLabel")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="COLLEGE">{t("registerDialog.educationLevels.college")}</SelectItem>
                              <SelectItem value="LYCEE">{t("registerDialog.educationLevels.lycee")}</SelectItem>
                              <SelectItem value="UNIVERSITY">{t("registerDialog.educationLevels.university")}</SelectItem>
                              <SelectItem value="PROFESSIONAL">{t("registerDialog.educationLevels.professional")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("registerDialog.emailLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("registerDialog.emailLabel")} {...field} />
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
                          <Input placeholder={t("registerDialog.townLabel")} {...field} />
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
                        <FormLabel>{t("registerDialog.quarterLabel")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("registerDialog.quarterLabel")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("registerDialog.passwordLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t("registerDialog.passwordLabel")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">{t("registerDialog.submitButton")}</Button>
              </form>
            </Form>
          </div>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}

export default RegisterDialog;
