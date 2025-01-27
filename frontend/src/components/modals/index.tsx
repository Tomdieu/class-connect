"use client"
import React from 'react'
import LoginDialog from './auth/LoginDialog'
import RegisterDialog from './auth/RegisterDialog'
import UserDialog from '../dashboard/admin/modals/UserModal'
import SubjectModal from '../dashboard/admin/modals/SubjectModal'
import ChapterModal from '../dashboard/admin/modals/ChapterModal'

function Modals() {
  return (
    <>
    <LoginDialog/>
    <RegisterDialog/>
    <UserDialog/>
    <SubjectModal/>
    <ChapterModal/>
    </>
  )
}

export default Modals