"use client"

import { create } from "zustand";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Credenza, CredenzaContent, CredenzaHeader, CredenzaTitle } from "@/components/ui/credenza";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Store Types
type ResourceStore = {
    isOpen: boolean;
    resourceType?: 'VideoResource' | 'QuizResource' | 'RevisionResource' | 'PDFResource' | 'ExerciseResource';
    topicId?: number | string;
    chapterId?: string | number;
    subjectId?: string | number;
    classId?: string | number;
    onAdd: (params: {
        classId: string | number,
        subjectId: string | number,
        chapterId: string | number, topicId: number | string, resourceType: ResourceStore['resourceType']
    }) => void;
    onClose: () => void;
    setResourceType: (type: 'VideoResource' | 'QuizResource' | 'RevisionResource' | 'PDFResource' | 'ExerciseResource') => void;
};

// Create the store
export const useResourceStore = create<ResourceStore>((set) => ({
    isOpen: false,
    resourceType: undefined,
    topicId: undefined,
    chapterId: undefined,
    classId: undefined,
    subjectId: undefined,
    onAdd: ({ topicId, resourceType }) => set({ isOpen: true, topicId, resourceType }),
    onClose: () => set({ isOpen: false, resourceType: undefined, topicId: undefined }),
    setResourceType: (type) => set({ resourceType: type })
}));

// Base Resource Form Schema
const baseResourceSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    topic: z.number(),
    polymorphic_ctype: z.number(),
});

// Quiz Form Schema
const quizSchema = baseResourceSchema.extend({
    total_questions: z.number().min(1),
    duration_minutes: z.number().min(1),
    passing_score: z.number().min(0).max(100),
    show_correct_answers: z.boolean(),
    show_explanation: z.boolean(),
    shuffle_questions: z.boolean(),
    attempts_allowed: z.number().min(1),
    partial_credit: z.boolean(),
    questions: z.array(z.object({
        text: z.string().min(1),
        type: z.enum(['MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER']),
        points: z.number().min(1),
        order: z.number(),
        explanation: z.string(),
        options: z.array(z.object({
            text: z.string().min(1),
            is_correct: z.boolean(),
            order: z.number(),
        })),
    })),
});

// PDF Form Schema
const pdfSchema = baseResourceSchema.extend({
    pdf_file: z.instanceof(File),
});

// Exercise Form Schema
const exerciseSchema = baseResourceSchema.extend({
    instructions: z.string().min(1),
    solution_file: z.instanceof(File).optional(),
    exercise_file: z.instanceof(File).optional(),
});

// Revision Form Schema
const revisionSchema = baseResourceSchema.extend({
    content: z.string().min(1),
});

// Quiz Form Component
const QuizForm = ({ onSubmit }: { onSubmit: (data: z.infer<typeof quizSchema>) => void }) => {
    const form = useForm<z.infer<typeof quizSchema>>({
        resolver: zodResolver(quizSchema),
        defaultValues: {
            show_correct_answers: true,
            show_explanation: true,
            shuffle_questions: false,
            partial_credit: false,
            questions: [],
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="duration_minutes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Duration (minutes)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="passing_score"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Passing Score (%)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="show_correct_answers"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                            <FormLabel>Show Correct Answers</FormLabel>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type="submit">Create Quiz</Button>
            </form>
        </Form>
    );
};

// PDF Form Component
const PDFForm = ({ onSubmit }: { onSubmit: (data: z.infer<typeof pdfSchema>) => void }) => {
    const form = useForm<z.infer<typeof pdfSchema>>({
        resolver: zodResolver(pdfSchema),
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="pdf_file"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>PDF File</FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => field.onChange(e.target.files?.[0])}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type="submit">Upload PDF</Button>
            </form>
        </Form>
    );
};

// Exercise Form Component
const ExerciseForm = ({ onSubmit }: { onSubmit: (data: z.infer<typeof exerciseSchema>) => void }) => {
    const form = useForm<z.infer<typeof exerciseSchema>>({
        resolver: zodResolver(exerciseSchema),
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="exercise_file"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Exercise File</FormLabel>
                                <FormControl>
                                    <Input
                                        type="file"
                                        onChange={(e) => field.onChange(e.target.files?.[0])}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="solution_file"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Solution File</FormLabel>
                                <FormControl>
                                    <Input
                                        type="file"
                                        onChange={(e) => field.onChange(e.target.files?.[0])}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit">Create Exercise</Button>
            </form>
        </Form>
    );
};

// Revision Form Component
const RevisionForm = ({ onSubmit }: { onSubmit: (data: z.infer<typeof revisionSchema>) => void }) => {
    const form = useForm<z.infer<typeof revisionSchema>>({
        resolver: zodResolver(revisionSchema),
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                                <Textarea {...field} className="min-h-[200px]" />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type="submit">Create Revision</Button>
            </form>
        </Form>
    );
};

// Main Resource Dialog Component
export const ResourceDialog = () => {
    const { isOpen, resourceType, topicId, onClose, setResourceType } = useResourceStore();

    const handleSubmit = async (data: any) => {
        try {
            // Handle form submission based on resource type
            console.log('Form submitted:', data);
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <Credenza open={isOpen} onOpenChange={onClose}>
            <CredenzaContent className="sm:max-w-[600px] p-3 pb-16">
                <CredenzaHeader className="mt-5">

                    <CredenzaTitle>
                        <div className="flex items-center justify-between">
                            <span>
                                Create {resourceType?.replace('Resource', '')} Resource
                            </span>
                            <Select value={resourceType} onValueChange={setResourceType}>
                                <SelectTrigger className="w-fit">

                                    <SelectValue placeholder={"Change Resource"} />
                                </SelectTrigger>
                                <SelectContent className="w-fit">
                                    {['VideoResource', 'QuizResource', 'RevisionResource', 'PDFResource', 'ExerciseResource'].map((item, index) => (
                                        <SelectItem value={item} key={index} >{item}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                    </CredenzaTitle>
                </CredenzaHeader>

                {resourceType === 'QuizResource' && (
                    <QuizForm onSubmit={handleSubmit} />
                )}

                {resourceType === 'PDFResource' && (
                    <PDFForm onSubmit={handleSubmit} />
                )}

                {resourceType === 'ExerciseResource' && (
                    <ExerciseForm onSubmit={handleSubmit} />
                )}

                {resourceType === 'RevisionResource' && (
                    <RevisionForm onSubmit={handleSubmit} />
                )}
            </CredenzaContent>
        </Credenza>
    );
};