"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Image from "next/image";

// Personal Info Form Schema
const personalInfoSchema = z.object({
  phone_number: z.string().min(1, "Phone number is required"),
  date_of_birth: z.string().optional().nullable(),
  language: z.enum(["fr", "en"]),
  town: z.string().min(1, "Town is required"),
  quarter: z.string().min(1, "Quarter is required"),
  enterprise_name: z.string().optional().nullable(),
  platform_usage_reason: z.string().optional().nullable(),
});

// Password Form Schema
const passwordSchema = z.object({
  oldPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters")
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Email Form Schema
const emailSchema = z.object({
  oldEmail: z.string().email("Please provide a valid email"),
  newEmail: z.string().email("Please provide a valid email"),
  confirmEmail: z.string().email("Please provide a valid email")
}).refine(data => data.newEmail === data.confirmEmail, {
  message: "Emails don't match",
  path: ["confirmEmail"]
});

export default function ProfilePage() {
  const { data: session, update, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("/placeholder.png");
  
  // Personal Info Form
  const personalForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      phone_number: "",
      date_of_birth: "",
      language: "fr",
      town: "",
      quarter: "",
      enterprise_name: "",
      platform_usage_reason: "",
    }
  });

  // Password Form
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  // Email Form
  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      oldEmail: "",
      newEmail: "",
      confirmEmail: ""
    }
  });
  
  // Update forms when session data is available
  useEffect(() => {
    if (session?.user) {
      personalForm.reset({
        phone_number: session.user.phone_number || "",
        date_of_birth: session.user.date_of_birth || "",
        language: session.user.language || "fr",
        town: session.user.town || "",
        quarter: session.user.quarter || "",
        enterprise_name: session.user.enterprise_name || "",
        platform_usage_reason: session.user.platform_usage_reason || "",
      });
      
      emailForm.reset({
        oldEmail: session.user.email || "",
        newEmail: "",
        confirmEmail: ""
      });
      
      setImageUrl(session.user.profile_picture || "/placeholder.png");
    }
  }, [session, personalForm, emailForm]);

  const handleImageUpload = async (e) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload-profile-image', { 
        method: 'POST', 
        body: formData 
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      setImageUrl(data.imageUrl);
      
      // Update the session with the new image URL
      await update({
        ...session,
        user: {
          ...session?.user,
          profile_picture: data.imageUrl
        }
      });
      
      toast.success("Photo mise à jour avec succès");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Échec de la mise à jour de la photo");
    } finally {
      setIsLoading(false);
    }
  };

  const onPersonalInfoSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      // Update the session with the new data
      await update({
        ...session,
        user: {
          ...session?.user,
          ...data
        }
      });
      
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Échec de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update password');
      }
      
      toast.success("Mot de passe modifié avec succès");
      passwordForm.reset();
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.message || "Échec de la modification du mot de passe");
    } finally {
      setIsLoading(false);
    }
  };

  const onEmailSubmit = async (data) => {
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
        ...session,
        user: {
          ...session?.user,
          email: data.newEmail
        }
      });
      
      toast.success("Email modifié avec succès");
      emailForm.reset({
        oldEmail: data.newEmail,
        newEmail: "",
        confirmEmail: ""
      });
    } catch (error) {
      console.error('Error updating email:', error);
      toast.error(error.message || "Échec de la modification de l'email");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state if session is still loading
  if (status === "loading") {
    return <div className="container p-6">Chargement...</div>;
  }

  return (
    <div className="container space-y-6 p-6">
      <h1 className="text-2xl font-bold">Mon compte</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Mon profil Anacours</h2>
          <p className="text-gray-600 mb-4">
            Identifiant Anacours : {session?.user?.id || "N/A"}
          </p>
          
          {/* Image Upload Section */}
          <div className="flex flex-col items-center space-y-4 mb-6">
            <div className="relative w-32 h-32">
              <Image
                src={imageUrl}
                alt="Profile"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="photo-upload"
            />
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => document.getElementById('photo-upload')?.click()}
              disabled={isLoading}
            >
              Ajouter ma photo
            </Button>
          </div>

          {/* Read-only Information */}
          <div className="space-y-4 mb-6">
            <div>
              <FormLabel>Nom</FormLabel>
              <Input value={session?.user?.last_name || ""} disabled className="bg-muted" />
            </div>
            <div>
              <FormLabel>Prénom</FormLabel>
              <Input value={session?.user?.first_name || ""} disabled className="bg-muted" />
            </div>
            <div>
              <FormLabel>Niveau d&apos;études</FormLabel>
              <Input value={session?.user?.education_level || ""} disabled className="bg-muted" />
            </div>
          </div>

          {/* Personal Info Form */}
          <Form {...personalForm}>
            <form onSubmit={personalForm.handleSubmit(onPersonalInfoSubmit)} className="space-y-4">
              <FormField
                control={personalForm.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={personalForm.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de naissance</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={personalForm.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Langue</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la langue" />
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

              <FormField
                control={personalForm.control}
                name="town"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={personalForm.control}
                name="quarter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quartier</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={personalForm.control}
                name="enterprise_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entreprise</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={personalForm.control}
                name="platform_usage_reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raison d'utilisation</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                Sauvegarder
              </Button>
            </form>
          </Form>
        </Card>

        {/* Password Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Modifier mon mot de passe</h2>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Ancien mot de passe" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Nouveau mot de passe" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirmation mot de passe" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                Modifier
              </Button>
            </form>
          </Form>
        </Card>

        {/* Email Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Modifier mon email</h2>
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="oldEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Ancien email" 
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
                control={emailForm.control}
                name="newEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Nouvel email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={emailForm.control}
                name="confirmEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Confirmation email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                Modifier
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}