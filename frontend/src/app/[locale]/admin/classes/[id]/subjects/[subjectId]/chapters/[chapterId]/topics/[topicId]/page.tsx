"use client";

import React from "react";
import {useParams} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import {Loader} from "lucide-react";
import {listResources} from "@/actions/courses";
import {useExerciseStore, usePDFStore, useQuizStore, useRevisionStore, useVideoStore} from "@/hooks/resources-store";
import ResourceMenu from "./_components/ResourceMenu";
import ResourceCard from "./_components/ResourceCard";
import {AbstractResourceType, PDFResourceType, VideoResourceType} from "@/types";
import {useViewPDFStore} from "@/hooks/view-pdf-store";
import {useSelectVideoStore} from "@/hooks/select-video-store";

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
    const {id, subjectId, chapterId, topicId} = useParams<PageParams>();

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
            case "VideoResource":
                break;
        }
    };

    const handleDeleteResource = (resource: AbstractResourceType) => {
        switch (resource.resource_type) {
            case "PDFResource":
                break;
            case "VideoResource":
                // Implement video delete handling
                console.log("Deleting video resource:", resource);
                break;
            case "QuizResource":
                break;
            case "RevisionResource":
                break;
            case "ExerciseResource":
                break;
            case "VideoResource":
                break;
        }
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

    const handleQuizClick = () => {
        quizStore.onOpen({
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
        <div className="space-y-6 p-4 sm:p-6 h-full">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Resources</h2>
                <ResourceMenu
                    onPDFClick={handlePDFClick}
                    onVideoClick={handleVideoClick}
                    onExerciseClick={handleExerciseClick}
                    onRevisionClick={handleRevisionClick}
                    onQuizClick={handleQuizClick}

                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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