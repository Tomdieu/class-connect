"use client";

import { updateUser } from "@/actions/accounts";
import { UserCreateType, UserType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { InputPhone } from "@/components/ui/input-phone";
import { motion } from "framer-motion";

interface ProfileFormProps {
  user: UserType;
}

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone_number: z
    .string()
    .min(9, "Phone number must be at least 9 characters")
    .optional(),
  town: z.string().optional(),
  quarter: z.string().optional(),
});

export function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      phone_number: user?.phone_number || "",
      town: user?.town || "",
      quarter: user?.quarter || "",
    },
  });

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    try {
      setIsLoading(true);
      // Explicitly log what's being submitted to help with debugging
      console.log("Submitting profile update:", values);
      
      const result = await updateUser({
        id: user.id,
        body: values as Partial<UserCreateType>,
      });
      
      // Log the response
      console.log("Profile update response:", result);
      
      toast.success("Profile updated successfully");
      
      // Refresh the session if needed to reflect changes
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('user:updated'));
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-foreground font-medium">First Name</FormLabel>
                  <FormControl>
                    <Input 
                      disabled 
                      placeholder="John" 
                      {...field} 
                      className="bg-background/50 border-muted-foreground/20 focus:border-primary" 
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
                <FormItem className="space-y-2">
                  <FormLabel className="text-foreground font-medium">Last Name</FormLabel>
                  <FormControl>
                    <Input 
                      disabled 
                      placeholder="Doe" 
                      {...field} 
                      className="bg-background/50 border-muted-foreground/20 focus:border-primary" 
                    />
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
              <FormItem className="space-y-2">
                <FormLabel className="text-foreground font-medium">Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    disabled 
                    placeholder="john.doe@example.com" 
                    {...field} 
                    className="bg-background/50 border-muted-foreground/20 focus:border-primary" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-foreground font-medium">Phone Number</FormLabel>
                <FormControl>
                  <InputPhone 
                    placeholder="e.g. 6XXXXXXXX" 
                    {...field} 
                    className="bg-background/50 border-muted-foreground/20 focus:border-primary" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="town"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-foreground font-medium">Town</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Douala" 
                      {...field} 
                      value={field.value || ""} 
                      className="bg-background/50 border-muted-foreground/20 focus:border-primary" 
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
                <FormItem className="space-y-2">
                  <FormLabel className="text-foreground font-medium">Quarter</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Bonamoussadi" 
                      {...field} 
                      value={field.value || ""} 
                      className="bg-background/50 border-muted-foreground/20 focus:border-primary" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <motion.div 
          className="flex justify-end pt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="px-6 py-2 rounded-lg flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Update Profile</span>
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}
