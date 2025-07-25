import { getTopic } from "@/actions/courses";
import BackButton from "@/components/BackButton";
import Link from "next/link";
import React from "react";

interface TopicLayoutProps {
    children: React.ReactNode;
    params: {
      id: string;
      subjectId: string;
      chapterId: string;
      topicId: string;
    };
  }
  
  async function TopicLayout({ children, params }: TopicLayoutProps) {
    // Ensure params is being treated as an object
    const { id, subjectId, chapterId, topicId } = await params;
    const topic = await getTopic({
      chapter_pk: chapterId,
      class_pk: id,
      subject_pk: subjectId,
      topic_pk: topicId,
    });
  
    return (
      <div className="container py-10 flex flex-col h-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:flex-1">
          <div className="md:col-span-3">
            <div>
              <Link
                className="flex items-center gap-1"
                href={`/admin/classes/${id}/subjects/${subjectId}/chapters/${chapterId}/`}
              >
                <BackButton />
              </Link>
            </div>
            <h1 className="text-3xl font-medium">Topic</h1>
            <div>
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-medium">{topic?.title}</h2>
                <p className="text-muted-foreground text-sm">
                  {topic?.description}
                </p>
              </div>
            </div>
          </div>
          <div className="md:col-span-9 w-full h-full flex flex-col">{children}</div>
        </div>
      </div>
    );
  }
  
  export default TopicLayout;
  