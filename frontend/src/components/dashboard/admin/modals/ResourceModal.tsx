"use client";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form";
import {Switch} from "@/components/ui/switch";
import {zodResolver} from "@hookform/resolvers/zod";
import {useFieldArray, useForm} from "react-hook-form";
import * as z from "zod";
import {Credenza, CredenzaContent, CredenzaHeader, CredenzaTitle,} from "@/components/ui/credenza";
import {useExerciseStore, usePDFStore, useQuizStore, useRevisionStore,useVideoStore} from "@/hooks/resources-store";
import {QuestionField} from "./QuestionField";
import {FileDropzone} from "@/components/FileDropzone";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// -------------------------
// Form Schemas
// -------------------------

const baseResourceSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    topic: z.number({
        required_error: "Topic is required",
        invalid_type_error: "Topic must be a number",
    }),
    polymorphic_ctype: z.number({
        required_error: "Content type is required",
        invalid_type_error: "Content type must be a number",
    }),
});

const quizSchema = baseResourceSchema.extend({
    total_questions: z.number().min(1, "Must have at least 1 question"),
    duration_minutes: z.number().min(1, "Duration must be at least 1 minute"),
    passing_score: z.number().min(0).max(100),
    show_correct_answers: z.boolean(),
    show_explanation: z.boolean(),
    shuffle_questions: z.boolean(),
    attempts_allowed: z.number().min(1),
    partial_credit: z.boolean(),
    questions: z.array(
        z.object({
            text: z.string().min(1, "Question text is required"),
            type: z.enum(["MULTIPLE_CHOICE", "SINGLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
            points: z.number().min(1, "Points must be at least 1"),
            order: z.number(),
            explanation: z.string().optional(),
            options: z.array(
                z.object({
                    text: z.string().min(1, "Option text is required"),
                    is_correct: z.boolean(),
                    order: z.number(),
                })
            ).optional(), // Options may be optional for some question types
        })
    ),
});

const pdfSchema = baseResourceSchema.extend({
    pdf_file: z.instanceof(File, {
        message: "PDF file is required",
    }),
});

const videoSchema = baseResourceSchema.extend({
    video_file:z.instanceof(File,{
        message:"Video file is required"
    })
})

const exerciseSchema = baseResourceSchema.extend({
    instructions: z.string().min(1, "Instructions are required"),
    solution_file: z.instanceof(File).optional(),
    exercise_file: z.instanceof(File).optional(),
});

const revisionSchema = baseResourceSchema.extend({
    content: z.string().min(1, "Content is required"),
});

// -------------------------
// Quiz Modal
// -------------------------

export const QuizModal = () => {
    const { isOpen, onClose, classId, subjectId, chapterId, topicId } = useQuizStore();
    const [isFullscreen, setIsFullscreen] = useState(false);

    const form = useForm({
        resolver: zodResolver(quizSchema),
        defaultValues: {
            title: "",
            description: "",
            topic: 0,
            polymorphic_ctype: 0,
            total_questions: 1,
            duration_minutes: 1,
            passing_score: 50,
            show_correct_answers: true,
            show_explanation: true,
            shuffle_questions: false,
            attempts_allowed: 1,
            partial_credit: false,
            questions: [],
        },
    });

    const {
        fields: questionFields,
        append: appendQuestion,
        remove: removeQuestion,
    } = useFieldArray({
        control: form.control,
        name: "questions",
    });

    const handleAddQuestion = () => {
        appendQuestion({
            text: "",
            type: "MULTIPLE_CHOICE",
            points: 1,
            order: questionFields.length + 1,
            explanation: "",
            options: [
                { text: "", is_correct: false, order: 1 },
                { text: "", is_correct: false, order: 2 },
            ],
        });
    };

    const onSubmit = async (data) => {
        try {
            console.log("Quiz form submitted:", data);
            onClose();
        } catch (error) {
            console.error("Error submitting quiz form:", error);
        }
    };

    const modalClasses = isFullscreen 
        ? "max-w-full w-full h-full" 
        : "sm:max-w-[800px]";

    return (
        <Credenza open={isOpen} onOpenChange={onClose}>
            <CredenzaContent showIcon={false} className={`${modalClasses} p-6 transition-all duration-300 flex flex-col`}>
                <div className="flex justify-between items-center">
                    <CredenzaTitle>Create Quiz Resource</CredenzaTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                    >
                        {isFullscreen ? <Minimize2 /> : <Maximize2 />}
                    </Button>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col">
                        <Tabs defaultValue="quiz-info" className="w-full flex-1">
                            <TabsList className="gap-1 bg-transparent">
                                <TabsTrigger
                                    value="quiz-info"
                                    className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                                >
                                    Quiz Information
                                </TabsTrigger>
                                <TabsTrigger
                                    value="questions"
                                    className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                                >
                                    Questions
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="quiz-info" className="p-4">
                                    <div className="space-y-6 h-full">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Title</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Quiz Title"/>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea {...field} placeholder="Quiz Description"/>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="total_questions"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Total Questions</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="number"/>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="duration_minutes"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Duration (minutes)</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="number"/>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="passing_score"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Passing Score</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="number"/>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 items-center sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="attempts_allowed"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Attempts</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="number"/>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="show_correct_answers"
                                                render={({field}) => (
                                                    <FormItem className="flex items-center space-x-2">
                                                        <FormLabel>Show Answers</FormLabel>
                                                        <FormControl>
                                                            <Switch 
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="show_explanation"
                                                render={({field}) => (
                                                    <FormItem className="flex items-center space-x-2">
                                                        <FormLabel>Show Explanation</FormLabel>
                                                        <FormControl>
                                                            <Switch 
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="shuffle_questions"
                                                render={({field}) => (
                                                    <FormItem className="flex items-center space-x-2">
                                                        <FormLabel>Shuffle</FormLabel>
                                                        <FormControl>
                                                            <Switch 
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="partial_credit"
                                            render={({field}) => (
                                                <FormItem className="flex items-center space-x-2">
                                                    <FormLabel>Partial Credit</FormLabel>
                                                    <FormControl>
                                                        <Switch 
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="questions" className="min-h-96">
                                    <ScrollArea className={cn("space-y-6 overflow-y-auto",isFullscreen?"max-h-[680px]":"max-h-[400px]")}>
                                        {questionFields.map((_, index) => (
                                            <QuestionField
                                                key={questionFields[index].id}
                                                questionIndex={index}
                                                control={form.control}
                                                removeQuestion={removeQuestion}
                                            />
                                        ))}
                                        <Button 
                                            onClick={handleAddQuestion}
                                            className="w-full"
                                            size={"sm"}
                                        >
                                            Add Question
                                        </Button>
                                    </ScrollArea>
                                </TabsContent>
                        </Tabs>

                        <div className="bg-background pt-4 border-t">
                            <Button type="submit" className="w-full">
                                Create Quiz
                            </Button>
                        </div>
                    </form>
                </Form>
            </CredenzaContent>
        </Credenza>
    );
};
// -------------------------
// PDF Modal
// -------------------------

export const PDFModal = () => {
    const {isOpen, onClose} = usePDFStore();

    const form = useForm<z.infer<typeof pdfSchema>>({
        resolver: zodResolver(pdfSchema),
        defaultValues: {
            title: "",
            description: "",
            topic: 0,
            polymorphic_ctype: 0,
        },
    });

    const onSubmit = async (data: z.infer<typeof pdfSchema>) => {
        try {
            console.log("PDF form submitted:", data);
            onClose();
        } catch (error) {
            console.error("Error submitting PDF form:", error);
        }
    };

    // Custom file input handler: Since react-hook-form cannot directly handle File inputs via spread
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (file: File) => void) => {
        if (e.target.files && e.target.files.length > 0) {
            onChange(e.target.files[0]);
        }
    };

    const handleDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            form.setValue("pdf_file", acceptedFiles[0], { shouldValidate: true });
        }
    };

    return (
        <Credenza open={isOpen} onOpenChange={onClose}>
            <CredenzaContent className="sm:max-w-[600px] p-6 pb-16 transition-all duration-300">
                <CredenzaHeader className="mt-5">
                    <CredenzaTitle>Create PDF Resource</CredenzaTitle>
                </CredenzaHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Base fields */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({field}) => (
                                <FormItem className="transition-all duration-300">
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="PDF Title"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem className="transition-all duration-300">
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="PDF Description"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormItem className="transition-all duration-300">
                            <FormLabel>PDF File</FormLabel>
                            <FormControl>
                                {/*<Input*/}
                                {/*    type="file"*/}
                                {/*    accept="application/pdf"*/}
                                {/*    onChange={(e) =>*/}
                                {/*        handleFileChange(e, (file) =>*/}
                                {/*            form.setValue("pdf_file", file, {shouldValidate: true})*/}
                                {/*        )*/}
                                {/*    }*/}
                                {/*/>*/}
                                <FileDropzone
                                    onDrop={handleDrop}
                                    accept={{
                                        'application/pdf': ['.pdf']
                                    }}
                                    label="Drop PDF here or click to select"
                                />
                            </FormControl>
                        </FormItem>
                        <Button type="submit" className="w-full">
                            Upload PDF
                        </Button>
                    </form>
                </Form>
            </CredenzaContent>
        </Credenza>
    );
};

// -------------------------
// Exercise Modal
// -------------------------

export const ExerciseModal = () => {
    const {isOpen, onClose,classId,subjectId,chapterId,topicId} = useExerciseStore();

    const form = useForm<z.infer<typeof exerciseSchema>>({
        resolver: zodResolver(exerciseSchema),
        defaultValues: {
            title: "",
            description: "",
            topic: 0,
            polymorphic_ctype: 0,
            instructions: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof exerciseSchema>) => {
        try {
            console.log("Exercise form submitted:", data);
            onClose();
        } catch (error) {
            console.error("Error submitting exercise form:", error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "solution_file" | "exercise_file") => {
        if (e.target.files && e.target.files.length > 0) {
            form.setValue(fieldName, e.target.files[0], {shouldValidate: true});
        }
    };

    const handleDrop = (fieldName: "solution_file" | "exercise_file") => (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            form.setValue(fieldName, acceptedFiles[0], { shouldValidate: true });
        }
    };

    return (
        <Credenza open={isOpen} onOpenChange={onClose}>
            <CredenzaContent className="sm:max-w-[600px] p-6 pb-16 transition-all duration-300">
                <CredenzaHeader className="mt-5">
                    <CredenzaTitle>Create Exercise Resource</CredenzaTitle>
                </CredenzaHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Base fields */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({field}) => (
                                <FormItem className="transition-all duration-300">
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Exercise Title"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem className="transition-all duration-300">
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea rows={5} className={"resize-none"} {...field} placeholder="Exercise Description"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="instructions"
                            render={({field}) => (
                                <FormItem className="transition-all duration-300">
                                    <FormLabel>Instructions</FormLabel>
                                    <FormControl>
                                        <Textarea rows={5} className={"resize-none"} {...field} placeholder="Exercise instructions"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormItem className="transition-all duration-300">
                            <FormLabel>Exercise File</FormLabel>
                            <FormControl>
                                <FileDropzone
                                    onDrop={handleDrop("exercise_file")}
                                    label="Drop exercise file here or click to select"
                                />
                            </FormControl>
                        </FormItem>
                        <FormItem className="transition-all duration-300">
                            <FormLabel>Solution File (optional)</FormLabel>
                            <FormControl>
                                <FileDropzone
                                    onDrop={handleDrop("solution_file")}
                                    label="Drop solution file here or click to select"
                                />
                            </FormControl>
                        </FormItem>
                        <Button type="submit" className="w-full">
                            Create Exercise
                        </Button>
                    </form>
                </Form>
            </CredenzaContent>
        </Credenza>
    );
};

// -------------------------
// Revision Modal
// -------------------------

export const RevisionModal = () => {
    const {isOpen, onClose,classId,subjectId,chapterId,topicId} = useRevisionStore();

    const form = useForm<z.infer<typeof revisionSchema>>({
        resolver: zodResolver(revisionSchema),
        defaultValues: {
            title: "",
            description: "",
            topic: 0,
            polymorphic_ctype: 0,
            content: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof revisionSchema>) => {
        try {
            console.log("Revision form submitted:", data);
            onClose();
        } catch (error) {
            console.error("Error submitting revision form:", error);
        }
    };

    return (
        <Credenza open={isOpen} onOpenChange={onClose}>
            <CredenzaContent className="sm:max-w-[600px] p-6 pb-16 transition-all duration-300">
                <CredenzaHeader className="mt-5">
                    <CredenzaTitle>Create Revision Resource</CredenzaTitle>
                </CredenzaHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Base fields */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({field}) => (
                                <FormItem className="transition-all duration-300">
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Revision Title"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem className="transition-all duration-300">
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Revision Description"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="content"
                            render={({field}) => (
                                <FormItem className="transition-all duration-300">
                                    <FormLabel>Content</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Revision content"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">
                            Create Revision
                        </Button>
                    </form>
                </Form>
            </CredenzaContent>
        </Credenza>
    );
};

// -------------------------
// Video Modal
// -------------------------

export const VideoModal = () => {
    const { isOpen, onClose, classId, subjectId, chapterId, topicId } = useVideoStore();

    const form = useForm<z.infer<typeof videoSchema>>({
        resolver: zodResolver(videoSchema),
        defaultValues: {
            title: "",
            description: "",
            topic: 0,
            polymorphic_ctype: 0,
        },
    });

    const onSubmit = async (data: z.infer<typeof videoSchema>) => {
        try {
            console.log("Video form submitted:", data);
            onClose();
        } catch (error) {
            console.error("Error submitting video form:", error);
        }
    };

    const handleDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            form.setValue("video_file", acceptedFiles[0], { shouldValidate: true });
        }
    };

    return (
        <Credenza open={isOpen} onOpenChange={onClose}>
            <CredenzaContent className="sm:max-w-[600px] p-6 pb-16 transition-all duration-300">
                <CredenzaHeader className="mt-5">
                    <CredenzaTitle>Create Video Resource</CredenzaTitle>
                </CredenzaHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({field}) => (
                                <FormItem className="transition-all duration-300">
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Video Title"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem className="transition-all duration-300">
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Video Description"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormItem className="transition-all duration-300">
                            <FormLabel>Video File</FormLabel>
                            <FormControl>
                                <FileDropzone
                                    onDrop={handleDrop}
                                    accept={{
                                        'video/*': ['.mp4', '.webm', '.mov', '.avi']
                                    }}
                                    label="Drop video file here or click to select"
                                />
                            </FormControl>
                        </FormItem>
                        <Button type="submit" className="w-full">
                            Upload Video
                        </Button>
                    </form>
                </Form>
            </CredenzaContent>
        </Credenza>
    );
};