"use client"
import React from 'react'
import UserDialog from '../dashboard/admin/modals/UserModal'
import SubjectModal from '../dashboard/admin/modals/SubjectModal'
import ChapterModal from '../dashboard/admin/modals/ChapterModal'
import TopicModal from '../dashboard/admin/modals/TopicModal'
import { ExerciseModal, PDFModal, RevisionModal, VideoModal } from '../dashboard/admin/modals/ResourceModal'
import { PDFDialog } from '../dashboard/admin/modals/PDFDialog'
import { VideoPreviewModal } from "@/components/dashboard/admin/modals/VideoPreviewModal";
import ClassModal from '../dashboard/admin/modals/ClassModal'
import PlanModal from '../dashboard/admin/modals/PlanModal'
import DeleteConfirmationModal from './DeleteConfirmationModal'

function Modals() {
  return (
    <>
      <UserDialog />
      <ClassModal/>
      <SubjectModal />
      <ChapterModal />
      <TopicModal />
      {/* Resources modals */}
      <ExerciseModal />
      <PDFModal />
      {/* <QuizModal /> */}
      <RevisionModal />
      <VideoModal />
      <PlanModal/>
      <DeleteConfirmationModal />

      {/*  */}
      <PDFDialog />
      <VideoPreviewModal />
    </>
  )
}

export default Modals