'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import React from 'react'
import { useI18n, useCurrentLocale } from "@/locales/client"
import { Helmet } from 'react-helmet-async'

export default function PlanNotFound() {
  const router = useRouter()
  const t = useI18n()
  const locale = useCurrentLocale()
  const pathName = usePathname()
  const {plan} = useParams<{plan:string}>()
  
  // Base URL with locale for SEO
  const baseUrl = `https://www.classconnect.cm/${locale}`
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <Helmet>
        <title>{t('planNotFound.heading')} | ClassConnect</title>
        <meta name="description" content={t('planNotFound.description')} />
        <link rel="canonical" href={`${baseUrl}/subscribe/${plan}/404`} />
      </Helmet>
      
      <div className="max-w-md w-full text-center space-y-8">
        <div className="animate-bounce inline-flex rounded-full bg-primary/10 p-4 mb-4">
          <div className="rounded-full bg-primary p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold text-primary mb-2">{t('planNotFound.title')}</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {t('planNotFound.heading')}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
          {t('planNotFound.description')}
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button 
            onClick={() => router.back()}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            {t('notFound.goBack')}
          </button>
          
          <button 
            onClick={() => router.push('/pricing')}
            className="px-6 py-3 bg-primary border border-transparent rounded-lg shadow-sm text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            {t('subscriptionPlans.title')}
          </button>
        </div>
      </div>
    </div>
  )
}