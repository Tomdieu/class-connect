import Header from '@/components/Header'
import Hero from '@/components/Hero'
import { SubscriptionPlans } from '@/components/SubscriptionPlans'
import React from 'react'

function LandingPage() {
  return (
    <div className='flex-1 w-full h-full flex flex-col container mx-auto'>
      <Header/>
      <Hero/>
      <SubscriptionPlans/>
    </div>
  )
}

export default LandingPage