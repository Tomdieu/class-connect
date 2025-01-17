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
                Rejoignez ClassConnect
              </DialogTitle>
              <p className="text-sm text-gray-500 text-center">
                Créez votre compte pour commencer votre parcours
                d&apos;apprentissage
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
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom" {...field} />
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
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Prénom" {...field} />
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
                      <FormLabel>Numéro de téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="Numéro de téléphone" {...field} />
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
                        <FormLabel>Date de naissance</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            placeholder="Date de naissance"
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
                        <FormLabel>Niveau d&apos;éducation</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choisissez votre niveau" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="COLLEGE">Collège</SelectItem>
                              <SelectItem value="LYCEE">Secondaire</SelectItem>
                              <SelectItem value="UNIVERSITY">
                                UNIVERSITY
                              </SelectItem>
                              <SelectItem value="PROFESSIONAL">
                                Professionnel
                              </SelectItem>
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" {...field} />
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
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input placeholder="Ville" {...field} />
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
                        <FormLabel>Quartier</FormLabel>
                        <FormControl>
                          <Input placeholder="Quartier" {...field} />
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
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">S&apos;inscrire</Button>
              </form>
            </Form>
          </div>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}

export default RegisterDialog;
