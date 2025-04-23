"use server";
import { auth } from "@/auth";
import Meeting from "@/components/Meeting";
import { redirect } from "next/navigation";
import React from "react";
import { getOnlineCourseFromByCode } from "@/actions/online-courses";
import Link from "next/link";
import { Calendar, ArrowLeft, AlertCircle } from "lucide-react"; // Assuming you're using lucide-react for icons

async function MeetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    return redirect("/");
  }
  
  const { id } = await params;
  
  try {
    // Verify that the online course exists
    await getOnlineCourseFromByCode(id);
  } catch {
    // Tech-focused UI with meeting code input form
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100">
        <div className="max-w-md w-full px-8 py-10 bg-gray-800 rounded-lg border border-gray-700 shadow-lg relative overflow-hidden">
          {/* Tech pattern background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
          </div>
          
          {/* Error indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center relative">
              <AlertCircle className="h-10 w-10 text-red-400" />
              <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-pulse"></div>
            </div>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">
              Meeting Not Found
            </h1>
            
            <p className="text-gray-400 mb-8 text-center">
              Invalid meeting code detected. Please verify your meeting credentials.
            </p>
            
            {/* Meeting code form */}
            <form className="mb-6" action="/api/join-meeting" method="POST">
              <div className="mb-4">
                <label htmlFor="meetingCode" className="block text-sm font-medium text-gray-300 mb-2">
                  Enter Meeting Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="meetingCode"
                    name="meetingCode"
                    placeholder="Enter code (e.g., abcdef123)"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-500"
                  />
                  <div className="absolute right-3 top-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                  </div>
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-md transition-all duration-300 flex items-center justify-center group"
              >
                Join Meeting
                <svg 
                  className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </form>
            
            <div className="flex space-x-3">
              <Link href="/dashboard" className="flex-1">
                <button className="w-full py-2.5 px-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-md transition-colors border border-gray-600 flex items-center justify-center text-sm">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Dashboard
                </button>
              </Link>
              
              {session?.user.role === "teacher" && (

                <Link href="/dashboard/online-meetings" className="flex-1">
                <button className="w-full py-2.5 px-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-md transition-colors border border-gray-600 flex items-center justify-center text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  My Meetings
                </button>
              </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* System status indicator */}
        <div className="mt-8 bg-gray-800 px-4 py-2 rounded-full border border-gray-700 flex items-center text-xs">
          <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
          <span className="text-gray-400">System Status:</span>
          <span className="text-gray-300 ml-1">Operational</span>
          <span className="mx-2 text-gray-600">|</span>
          <a href="mailto:support@example.com" className="text-blue-400 hover:text-blue-300">Request Support</a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen">
      <Meeting disableModeratorIndicator roomName={id} />
    </div>
  );
}

export default MeetPage;