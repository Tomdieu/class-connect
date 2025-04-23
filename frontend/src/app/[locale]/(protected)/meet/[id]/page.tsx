"use server";
import { auth } from "@/auth";
import Meeting from "@/components/Meeting";
import { redirect, useParams } from "next/navigation";
import React from "react";

async function MeetPage({params:{id:string}}) {
  const session = await auth();
  const {id} = useParams<{id:string}>()
  if (!session?.user) {
    return redirect("/");
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-red-100">
      <Meeting disableModeratorIndicator roomName="ivantom" />
    </div>
  );
}

export default MeetPage;
