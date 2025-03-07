"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { PropsWithChildren, useEffect } from 'react'

function ProtectedLayout({ children }: PropsWithChildren) {
    const { data: session } = useSession()
    console.log({session})
    // const router = useRouter()
    // useEffect(() => {
    //     if (!session?.user) {
    //         router.push('/auth/login')
    //     }
    // }, [session])
    return (
        <React.Fragment>
            {children}
        </React.Fragment>
    )
}

export default ProtectedLayout