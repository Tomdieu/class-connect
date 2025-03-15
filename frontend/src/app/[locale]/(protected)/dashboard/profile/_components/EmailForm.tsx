"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

// Email Form Schema
const emailSchema = z.object({
  oldEmail: z.string().email("Please provide a valid email"),
  newEmail: z.string().email("Please provide a valid email"),
  confirmEmail: z.string().email("Please provide a valid email")
}).refine(data => data.newEmail === data.confirmEmail, {
  message: "Emails don't match",
  path: ["confirmEmail"]
});

export type EmailFormValues = z.infer<typeof emailSchema>;

interface EmailFormProps {
  defaultValues: EmailFormValues;
}

export default function EmailForm({ defaultValues }: EmailFormProps) {
  const { update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues,
  });

  const onSubmit = async (data: EmailFormValues) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/update-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldEmail: data.oldEmail,
          newEmail: data.newEmail
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update email');
      }
      
      // Update the session with the new email
      await update({
        user: {
          email: data.newEmail
        }
      });
      
      toast.success("Email modifié avec succès");
      form.reset({
        oldEmail: data.newEmail,
        newEmail: "",
        confirmEmail: ""
      });
    } catch (error: any) {
      console.error('Error updating email:', error);
      toast.error(error.message || "Échec de la modification de l'email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="oldEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email actuel</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  disabled 
                  className="bg-muted" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="newEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nouvel email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="nouveau@exemple.com" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmer le nouvel email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="nouveau@exemple.com" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Modification en cours..." : "Modifier mon email"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
