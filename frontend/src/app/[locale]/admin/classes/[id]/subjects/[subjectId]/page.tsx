"use client"
import { getSubject } from '@/actions/courses';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import React from 'react'

function SubjectDetail() {
  const { id, subjectId } = useParams<{ id: string; subjectId: string }>();
  const subjectQuery = useQuery({
      queryKey: ["class", id, "subjects",subjectId],
      queryFn: () => getSubject({ class_pk: id,subject_pk: subjectId }),
    });
  return (
    <div>SubjectDetail</div>
  )
}

export default SubjectDetail