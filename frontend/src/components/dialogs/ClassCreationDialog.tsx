"use client";

import React, { useState, useEffect } from 'react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Loader2, Plus, Trash, School, Book, GraduationCap, ArrowRight, FileText } from "lucide-react";
import { toast } from "sonner";
import { getSpecialities, createLevelClassWithClasses } from "@/actions/sections";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Speciality, ClassCreateSerializer, LevelClassDefinitionCreate } from '@/types';
import { useI18n } from "@/locales/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Credenza, 
  CredenzaContent, 
  CredenzaDescription, 
  CredenzaFooter, 
  CredenzaHeader, 
  CredenzaTitle,
  CredenzaBody
} from "@/components/ui/credenza";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface ClassCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  educationLevelId: number;
  educationType: string;
  onSuccess: () => void;
}

// Each class variant schema
const classVariantSchema = z.object({
  variant: z.string().optional().default(""),
  description: z.string().optional().default(""),
});

// Main form schema
const classCreationSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  speciality: z.string().optional(), // Only required for LYCEE
  initialClasses: z.array(classVariantSchema).min(1, "At least one class is required"),
});

export function ClassCreationDialog({ 
  isOpen, 
  onClose, 
  educationLevelId, 
  educationType, 
  onSuccess 
}: ClassCreationDialogProps) {
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [isLoadingSpecialities, setIsLoadingSpecialities] = useState(false);
  const t = useI18n();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof classCreationSchema>>({
    resolver: zodResolver(classCreationSchema),
    defaultValues: {
      name: "",
      speciality: "",
      initialClasses: [{ variant: "", description: "" }],
    },
  });

  // Setup field array for multiple initial classes
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "initialClasses",
  });

  // Reset form when dialog is closed
  useEffect(() => {
    if (!isOpen) {
      form.reset({
        name: "",
        speciality: "",
        initialClasses: [{ variant: "", description: "" }],
      });
    }
  }, [isOpen, form]);

  // Fetch specialities when dialog opens for LYCEE education level
  useEffect(() => {
    if (isOpen && educationType === 'LYCEE') {
      const fetchSpecialities = async () => {
        try {
          setIsLoadingSpecialities(true);
          const data = await getSpecialities();
          setSpecialities(data);
        } catch (error) {
          console.error("Failed to fetch specialities:", error);
          toast.error("Failed to load specialities");
        } finally {
          setIsLoadingSpecialities(false);
        }
      };
      
      fetchSpecialities();
    }
  }, [isOpen, educationType]);

  // Create a mutation for class creation
  const createClassMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof classCreationSchema>) => {
      if (!educationLevelId) {
        throw new Error("Education level ID is required");
      }
      
      // Map form data to the expected API payload format
      const payload: LevelClassDefinitionCreate = {
        education_level: educationLevelId,
        name: formData.name,
        speciality: formData.speciality ? parseInt(formData.speciality) : null,
        initial_class: formData.initialClasses.map(item => ({
          variant: item.variant || "",
          description: item.description || ""
        }))
      };
      
      return await createLevelClassWithClasses(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formatted-classes"] });
      toast.success(t("class.create.successMessage") || "Class created successfully");
      form.reset();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error("Failed to create class:", error);
      toast.error(t("class.create.errorMessage") || "Failed to create class. Please try again.");
    }
  });

  const onSubmit = (values: z.infer<typeof classCreationSchema>) => {
    createClassMutation.mutate(values);
  };

  const addClassVariant = () => {
    append({ variant: "", description: "" });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !createClassMutation.isPending) {
      onClose();
    }
  };

  // Get education level icon based on type
  const getEducationIcon = () => {
    switch (educationType) {
      case 'COLLEGE':
        return <School className="h-5 w-5 text-indigo-500" />;
      case 'LYCEE':
        return <Book className="h-5 w-5 text-emerald-500" />;
      case 'UNIVERSITY':
        return <GraduationCap className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-amber-500" />;
    }
  };

  return (
    <Credenza open={isOpen} onOpenChange={handleOpenChange}>
      <CredenzaContent className="sm:max-w-[700px] p-0 overflow-hidden border-0">
        <div className="relative">
          {/* Decorative gradient backgrounds */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-indigo-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 z-0 opacity-60"></div>
        
          <CredenzaHeader className="pb-0 relative z-10">
            <div className="p-6 pb-4">
              <div className="flex items-center mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mr-3">
                  {getEducationIcon()}
                </div>
                <Badge 
                  variant="outline" 
                  className="font-medium border-primary/20 bg-primary/5 text-primary"
                >
                  {educationType === 'COLLEGE' ? t("educationLevels.college") :
                   educationType === 'LYCEE' ? t("educationLevels.lycee") :
                   educationType === 'UNIVERSITY' ? t("educationLevels.university") :
                   t("educationLevels.professional")}
                </Badge>
              </div>
              <CredenzaTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                {t("class.create.title")}
              </CredenzaTitle>
              <CredenzaDescription className="text-muted-foreground mt-1.5">
                {educationType === 'COLLEGE' && t("class.create.descriptionCollege")}
                {educationType === 'LYCEE' && t("class.create.descriptionLycee")}
                {educationType === 'UNIVERSITY' && t("class.create.descriptionUniversity")}
                {educationType === 'PROFESSIONAL' && t("class.create.descriptionProfessional")}
              </CredenzaDescription>
            </div>
            
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
          </CredenzaHeader>

          <CredenzaBody className="p-0 relative z-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-4">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">
                          {t("class.create.name")}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={educationType === 'COLLEGE' ? "6ème" : 
                              educationType === 'LYCEE' ? "2nde" : 
                              educationType === 'UNIVERSITY' ? "Licence" : "Class Name"} 
                            {...field} 
                            className="bg-background/50 border-muted-foreground/20 focus:border-primary" 
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          {t("class.create.nameDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {educationType === 'LYCEE' && (
                    <FormField
                      control={form.control}
                      name="speciality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">
                            {t("class.create.speciality")}
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background/50 border-muted-foreground/20 focus:border-primary">
                                <SelectValue placeholder={t("class.create.selectSpeciality")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingSpecialities ? (
                                <div className="flex justify-center p-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                              ) : (
                                specialities.map((speciality) => (
                                  <SelectItem key={speciality.id} value={speciality.id?.toString() || ""}>
                                    {speciality.label}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Class Variants Section */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground flex items-center">
                          {t("class.create.variants")}
                          <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/20 border-0">
                            {fields.length}
                          </Badge>
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t("class.create.variantsDescription") || "Add one or more class variants"}
                        </p>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addClassVariant}
                        className="h-8 px-3 rounded-full border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> {t("class.create.addVariant")}
                      </Button>
                    </div>
                    
                    <ScrollArea className="h-[38vh] md:h-[28vh] pr-4 rounded-md border border-muted/40 bg-muted/20 p-3">
                      <AnimatePresence initial={false}>
                        {fields.map((field, index) => (
                          <motion.div 
                            key={field.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mb-4 last:mb-1"
                          >
                            <Card className="border border-muted/60 shadow-sm bg-background/80 backdrop-blur-sm overflow-hidden">
                              <CardContent className="p-0">
                                <div className="flex justify-between items-center px-4 py-2.5 bg-muted/30 border-b border-muted/50">
                                  <h4 className="text-sm font-medium flex items-center">
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs text-primary mr-2">
                                      {index + 1}
                                    </span>
                                    {t("class.create.variantNumber", { number: index + 1 })}
                                  </h4>
                                  {index > 0 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => remove(index)}
                                      className="h-7 px-2 text-destructive hover:text-white hover:bg-destructive rounded-full"
                                    >
                                      <Trash className="h-3.5 w-3.5 mr-1" />
                                      {t("common.remove")}
                                    </Button>
                                  )}
                                </div>
                                
                                <div className="grid gap-4 md:grid-cols-2 p-4">
                                  <FormField
                                    control={form.control}
                                    name={`initialClasses.${index}.variant`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-foreground text-sm font-medium">
                                          {t("class.create.variant")}
                                        </FormLabel>
                                        <FormControl>
                                          <Input 
                                            placeholder={educationType === 'COLLEGE' ? "A" : 
                                              educationType === 'LYCEE' ? "C" : 
                                              educationType === 'UNIVERSITY' ? "L1" : "Variant"} 
                                            {...field} 
                                            className="bg-background/50 border-muted-foreground/20 focus:border-primary h-9"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name={`initialClasses.${index}.description`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-foreground text-sm font-medium">
                                          {t("class.create.description")}
                                        </FormLabel>
                                        <FormControl>
                                          <Textarea 
                                            placeholder={t("class.create.descriptionPlaceholder")} 
                                            {...field} 
                                            className="resize-none h-[70px] bg-background/50 border-muted-foreground/20 focus:border-primary"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </ScrollArea>
                  </div>
                </div>

                <CredenzaFooter className="px-0 py-4 gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                    disabled={createClassMutation.isPending}
                    className="rounded-full border-muted-foreground/30"
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createClassMutation.isPending}
                    className="rounded-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 transition-all shadow-md"
                  >
                    {createClassMutation.isPending ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("common.creating")}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Plus className="mr-2 h-4 w-4" />
                        {t("common.create")}
                        <ArrowRight className="ml-1 h-3.5 w-3.5 opacity-70" />
                      </div>
                    )}
                  </Button>
                </CredenzaFooter>
              </form>
            </Form>
          </CredenzaBody>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}
