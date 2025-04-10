import React from 'react'
import { BookOpen } from 'lucide-react'

function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse">
          <BookOpen className="h-16 w-16 text-primary animate-bounce" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Loading content...</h2>
      </div>
      
      <div className="w-full max-w-3xl mt-12 px-4">
        {/* Skeleton for content */}
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-md w-3/4 animate-pulse"></div>
          
          {/* Content skeletons */}
          {[1, 2, 3].map((item) => (
            <div key={item} className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-4/6 animate-pulse"></div>
            </div>
          ))}
          
          {/* Action button skeleton */}
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-md w-36 animate-pulse mt-8"></div>
        </div>
      </div>
    </div>
  )
}

export default Loading