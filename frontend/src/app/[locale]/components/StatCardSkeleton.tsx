import React from 'react'

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center text-center border border-gray-100 animate-pulse">
    <div className="p-5 rounded-full bg-gray-200 mb-4 w-20 h-20"></div>
    <div className="h-9 bg-gray-200 rounded w-20 mb-2"></div>
    <div className="h-5 bg-gray-200 rounded w-36"></div>
  </div>
  )
}

export default StatCardSkeleton