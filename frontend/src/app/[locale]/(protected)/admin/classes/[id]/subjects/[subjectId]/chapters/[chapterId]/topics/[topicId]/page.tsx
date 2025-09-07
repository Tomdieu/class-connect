"use client";

import React, { useState } from "react";
import {useParams} from "next/navigation";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {Loader} from "lucide-react";
import {listResources, deleteResource} from "@/actions/courses";
import {useExerciseStore, usePDFStore, useRevisionStore, useVideoStore} from "@/hooks/resources-store";
import ResourceMenu from "./_components/ResourceMenu";
import ResourceCard from "./_components/ResourceCard";
import {AbstractResourceType, PDFResourceType, VideoResourceType} from "@/types";
import {useViewPDFStore} from "@/hooks/view-pdf-store";
import {useSelectVideoStore} from "@/hooks/select-video-store";
import { useI18n } from "@/locales/client";
import { useDeleteConfirmationStore } from '@/hooks/delete-confirmation-store';
import { toast } from "sonner";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";

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
    const params = useParams<PageParams>();
    const id = params?.id || "";
    const subjectId = params?.subjectId || "";
    const chapterId = params?.chapterId || "";
    const topicId = params?.topicId || "";
    const { onOpen } = useDeleteConfirmationStore();
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
                const pdfUrl = pdf_resource.pdf_url || pdf_resource.pdf_file;
                // Use proxy API to avoid CORS issues with S3
                const proxiedPdfUrl = `/api/proxy-pdf?url=${encodeURIComponent(pdfUrl)}`;
                setPdfUrl(proxiedPdfUrl);
                break;
            case "VideoResource":
                const video_resource: VideoResourceType = resource as VideoResourceType
                const videoUrl = video_resource.video_url || video_resource.video_file;
                // Use proxy API to avoid CORS and CSP issues with S3
                const proxiedVideoUrl = `/api/proxy-video?url=${encodeURIComponent(videoUrl)}`;
                const proxiedVideoResource = {
                    ...video_resource,
                    video_url: proxiedVideoUrl
                };
                setVideoUrl(proxiedVideoResource);
                break;
            case "RevisionResource":
                break;
            case "ExerciseResource":
                break;
        }
    };

    const handleUpdateResource = (resource: AbstractResourceType) => {
        const editData = {
            classId: id,
            subjectId,
            chapterId,
            topicId,
            resource
        };

        switch (resource.resource_type) {
            case "PDFResource":
                pdfStore.onEdit(editData);
                break;
            case "VideoResource": 
                videoStore.onEdit(editData);
                break;
            case "ExerciseResource":
                exerciseStore.onEdit(editData);
                break;
            case "RevisionResource":
                revisionStore.onEdit(editData);
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

    const [deleteResourceModal, setDeleteResourceModal] = useState({
        isOpen: false,
        resourceId: null as string | null
    });

    const handleDeleteResource = (resource: AbstractResourceType) => {
        setDeleteResourceModal({
            isOpen: true,
            resourceId: resource.id.toString()
        });
    };

    const handleConfirmDelete = () => {
        if (deleteResourceModal.resourceId) {
            deleteResourceMutation.mutate(deleteResourceModal.resourceId);
        }
        setDeleteResourceModal({ isOpen: false, resourceId: null });
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
                <h2 className="text-lg 2xl:text-2xl font-bold text-gray-900">{t("resources.title")}</h2>
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

            <DeleteConfirmationModal
                isOpen={deleteResourceModal.isOpen}
                onClose={() => setDeleteResourceModal({ isOpen: false, resourceId: null })}
                onConfirm={handleConfirmDelete}
                title={t("resources.delete.title")}
                description={t("resources.delete.description")}
                isLoading={deleteResourceMutation.isPending}
            />
        </div>
    );
};

export default TopicDetailPage;