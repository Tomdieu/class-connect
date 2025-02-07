"use client"
import React from 'react'
import LoginDialog from './auth/LoginDialog'
import RegisterDialog from './auth/RegisterDialog'
import UserDialog from '../dashboard/admin/modals/UserModal'
import SubjectModal from '../dashboard/admin/modals/SubjectModal'
import ChapterModal from '../dashboard/admin/modals/ChapterModal'
import TopicModal from '../dashboard/admin/modals/TopicModal'
import { ExerciseModal, PDFModal, QuizModal, RevisionModal, VideoModal } from '../dashboard/admin/modals/ResourceModal'
import { PDFDialog } from '../dashboard/admin/modals/PDFDialog'
import { VideoPreviewModal } from "@/components/dashboard/admin/modals/VideoPreviewModal";

function Modals() {
  return (
    <>
      <LoginDialog />
      <RegisterDialog />
      <UserDialog />
      <SubjectModal />
      <ChapterModal />
      <TopicModal />
      {/* Resources modals */}
      <ExerciseModal />
      <PDFModal />
      <QuizModal />
      <RevisionModal />
      <VideoModal />

      {/*  */}
      <PDFDialog />
      <VideoPreviewModal />
    </>
  )
}

export default Modals