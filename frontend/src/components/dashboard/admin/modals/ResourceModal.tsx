"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Credenza, CredenzaContent, CredenzaHeader, CredenzaTitle } from "@/components/ui/credenza";
import { useQuizStore, usePDFStore, useExerciseStore, useRevisionStore } from "@/hooks/resources-store";

// Form Schemas
const baseResourceSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    topic: z.number(),
    polymorphic_ctype: z.number(),
});

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

const pdfSchema = baseResourceSchema.extend({
    pdf_file: z.instanceof(File),
});

const exerciseSchema = baseResourceSchema.extend({
    instructions: z.string().min(1),
    solution_file: z.instanceof(File).optional(),
    exercise_file: z.instanceof(File).optional(),
});

const revisionSchema = baseResourceSchema.extend({
    content: z.string().min(1),
});

// Quiz Modal
export const QuizModal = () => {
    const { isOpen, onClose } = useQuizStore();
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

    const onSubmit = async (data: z.infer<typeof quizSchema>) => {
        try {
            console.log('Quiz form submitted:', data);
            onClose();
        } catch (error) {
            console.error('Error submitting quiz form:', error);
        }
    };

    return (
        <Credenza open={isOpen} onOpenChange={onClose}>
            <CredenzaContent className="sm:max-w-[600px] p-3 pb-16">
                <CredenzaHeader className="mt-5">
                    <CredenzaTitle>Create Quiz Resource</CredenzaTitle>
                </CredenzaHeader>
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
                        {/* Rest of the quiz form fields */}
                        <Button type="submit">Create Quiz</Button>
                    </form>
                </Form>
            </CredenzaContent>
        </Credenza>
    );
};

// PDF Modal
export const PDFModal = () => {
    const { isOpen, onClose } = usePDFStore();
    const form = useForm<z.infer<typeof pdfSchema>>({
        resolver: zodResolver(pdfSchema),
    });

    const onSubmit = async (data: z.infer<typeof pdfSchema>) => {
        try {
            console.log('PDF form submitted:', data);
            onClose();
        } catch (error) {
            console.error('Error submitting PDF form:', error);
        }
    };

    return (
        <Credenza open={isOpen} onOpenChange={onClose}>
            <CredenzaContent className="sm:max-w-[600px] p-3 pb-16">
                <CredenzaHeader className="mt-5">
                    <CredenzaTitle>Create PDF Resource</CredenzaTitle>
                </CredenzaHeader>
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
                        {/* Rest of the PDF form fields */}
                        <Button type="submit">Upload PDF</Button>
                    </form>
                </Form>
            </CredenzaContent>
        </Credenza>
    );
};

// Exercise Modal
export const ExerciseModal = () => {
    const { isOpen, onClose } = useExerciseStore();
    const form = useForm<z.infer<typeof exerciseSchema>>({
        resolver: zodResolver(exerciseSchema),
    });

    const onSubmit = async (data: z.infer<typeof exerciseSchema>) => {
        try {
            console.log('Exercise form submitted:', data);
            onClose();
        } catch (error) {
            console.error('Error submitting exercise form:', error);
        }
    };

    return (
        <Credenza open={isOpen} onOpenChange={onClose}>
            <CredenzaContent className="sm:max-w-[600px] p-3 pb-16">
                <CredenzaHeader className="mt-5">
                    <CredenzaTitle>Create Exercise Resource</CredenzaTitle>
                </CredenzaHeader>
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
                        {/* Rest of the exercise form fields */}
                        <Button type="submit">Create Exercise</Button>
                    </form>
                </Form>
            </CredenzaContent>
        </Credenza>
    );
};

// Revision Modal
export const RevisionModal = () => {
    const { isOpen, onClose } = useRevisionStore();
    const form = useForm<z.infer<typeof revisionSchema>>({
        resolver: zodResolver(revisionSchema),
    });

    const onSubmit = async (data: z.infer<typeof revisionSchema>) => {
        try {
            console.log('Revision form submitted:', data);
            onClose();
        } catch (error) {
            console.error('Error submitting revision form:', error);
        }
    };

    return (
        <Credenza open={isOpen} onOpenChange={onClose}>
            <CredenzaContent className="sm:max-w-[600px] p-3 pb-16">
                <CredenzaHeader className="mt-5">
                    <CredenzaTitle>Create Revision Resource</CredenzaTitle>
                </CredenzaHeader>
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
                        {/* Rest of the revision form fields */}
                        <Button type="submit">Create Revision</Button>
                    </form>
                </Form>
            </CredenzaContent>
        </Credenza>
    );
};