import React from 'react'
import UserTable from './user-table'

async function UsersPage() {
  return (
    <div className='flex flex-col gap-5 px-2 sm:container pt-10'>
      <UserTable/>
    </div>
  )
}

export default UsersPage