"use client";

import React from "react";
import {useParams} from "next/navigation";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {Loader} from "lucide-react";
import {listResources, deleteResource} from "@/actions/courses";
import {useExerciseStore, usePDFStore, useQuizStore, useRevisionStore, useVideoStore} from "@/hooks/resources-store";
import ResourceMenu from "./_components/ResourceMenu";
import ResourceCard from "./_components/ResourceCard";
import {AbstractResourceType, PDFResourceType, VideoResourceType} from "@/types";
import {useViewPDFStore} from "@/hooks/view-pdf-store";
import {useSelectVideoStore} from "@/hooks/select-video-store";
import { useI18n } from "@/locales/client";
import { useDeleteConfirmationStore } from '@/hooks/delete-confirmation-store';
import { toast } from "sonner";

interface ResourceResponse {
    resource: AbstractResourceType;
}

interface PageParams {
    id: string;
    subjectId: string;
    chapterId: string;
    topicId: string;

    [key: string]: string;
}

const TopicDetailPage: React.FC = () => {
    const t = useI18n();
    const { id, subjectId, chapterId, topicId } = useParams<PageParams>();
    const { open } = useDeleteConfirmationStore();
    const queryClient = useQueryClient();

    const {data, isError, error, isLoading} = useQuery({
        queryKey: [
            "class",
            id,
            "subjects",
            subjectId,
            "chapters",
            chapterId,
            "topics",
            topicId,
            "resources",
        ],
        queryFn: () =>
            listResources({
                chapter_pk: chapterId,
                class_pk: id,
                subject_pk: subjectId,
                topic_pk: topicId,
            }),
    });

    const pdfStore = usePDFStore();
    const quizStore = useQuizStore();
    const revisionStore = useRevisionStore();
    const exerciseStore = useExerciseStore();
    const videoStore = useVideoStore();

    const {setPdfUrl} = useViewPDFStore()
    const {setVideoUrl,video,isOpen} = useSelectVideoStore()

    console.log({video,isOpen})

    const handleViewResource = (resource: AbstractResourceType) => {
        switch (resource.resource_type) {
            case "PDFResource":
                const pdf_resource: PDFResourceType = resource as PDFResourceType
                setPdfUrl(pdf_resource.pdf_file)
                break;
            case "VideoResource":
                const video_resource: VideoResourceType = resource as VideoResourceType
                setVideoUrl(video_resource)
                break;
            case "QuizResource":
                break;
            case "RevisionResource":
                break;
            case "ExerciseResource":
                break;
        }
    };

    const handleUpdateResource = (resource: AbstractResourceType) => {
        switch (resource.resource_type) {
            case "PDFResource":
                break;
            case "VideoResource":
                // Implement video update handling
                console.log("Updating video resource:", resource);
                break;
            case "QuizResource":
                break;
            case "RevisionResource":
                break;
            case "ExerciseResource":
                break;
        }
    };

    const deleteResourceMutation = useMutation({
        mutationFn: (resource_pk: string) =>
            deleteResource({
                class_pk: id,
                subject_pk: subjectId,
                chapter_pk: chapterId,
                topic_pk: topicId,
                resource_pk,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    "class",
                    id,
                    "subjects",
                    subjectId,
                    "chapters",
                    chapterId,
                    "topics",
                    topicId,
                    "resources",
                ],
            });
            toast.success(t("resources.delete.success"));
        },
        onError: (error) => {
            toast.error(t("resources.delete.error"), {
                description: error.message,
            });
        },
    });

    const handleDeleteResource = (resource: AbstractResourceType) => {
        open({
            title: t("resources.delete.title"),
            description: t("resources.delete.description"),
            onConfirm: () => {
                deleteResourceMutation.mutate(resource.id.toString());
            },
            isLoading: deleteResourceMutation.isPending
        });
    };

    const handlePDFClick = () => {
        pdfStore.onOpen({
            topicId,
            chapterId,
            subjectId,
            classId: id
        });
    };

    const handleVideoClick = () => {
        videoStore.onOpen({
            topicId,
            chapterId,
            subjectId,
            classId: id
        })
    };

    const handleExerciseClick = () => {
        exerciseStore.onOpen({
            topicId,
            chapterId,
            subjectId,
            classId: id
        });
    };

    const handleRevisionClick = () => {
        revisionStore.onOpen({
            topicId,
            chapterId,
            subjectId,
            classId: id
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-48">
                <Loader className="h-8 w-8 animate-spin"/>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                <strong>Error: </strong>
                {error.message}
            </div>
        );
    }

    return (
        <div className="space-y-3 p-4 sm:p-6 h-full">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{t("resources.title")}</h2>
                <ResourceMenu
                    onPDFClick={handlePDFClick}
                    onVideoClick={handleVideoClick}
                    onExerciseClick={handleExerciseClick}
                    onRevisionClick={handleRevisionClick}

                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {data?.map(({resource}: ResourceResponse) => (
                    <ResourceCard
                        key={resource.id}
                        resource={resource}
                        onView={handleViewResource}
                        onUpdate={handleUpdateResource}
                        onDelete={handleDeleteResource}
                        className={"h-full"}
                    />
                ))}
            </div>
        </div>
    );
};

export default TopicDetailPage;