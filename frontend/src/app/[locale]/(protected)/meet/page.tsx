"use client";
import React from 'react'
import MeetingCodeForm from './[code]/_components/MeetingCodeForm'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from 'next-auth/react';


function MeetingPage() {
    const {data:session} = useSession()
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center">
        <div className="container max-w-md mx-auto py-10 px-4">
          <Card className="shadow-lg border-primary/20 overflow-hidden bg-card/95 backdrop-blur">
            <CardHeader className="space-y-1 text-center">
              <div className="w-full flex items-center justify-center mb-2">
                <div className="rounded-full bg-primary/10 p-3">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Meeting Not Found</CardTitle>
              <CardDescription>
                Invalid meeting code. Please verify your meeting credentials.
              </CardDescription>
            </CardHeader>
            <form>
              <CardContent className="space-y-4 mt-4">
                <MeetingCodeForm />
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Link href="/dashboard">
                  <Button className="w-full flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                {session?.user.role === "teacher" && (
                  <Link href="/dashboard/online-meetings">
                    <Button className="w-full flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" />
                      My Meetings
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
  )
}

export default MeetingPage