"use client"
import { getSubscriptionPlan } from '@/actions/payments'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import PaymentForm from '@/components/payment/PaymentForm'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'

function SubscribePlanPage() {
    const {plan} = useParams<{ plan: string }>()
  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: getSubscriptionPlan
  })

  const selectedPlan = plans?.find(p => p.name.toLowerCase() === plan.toLowerCase())

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!selectedPlan) {
    return <div>Plan not found</div>
  }

  return (
    <div className="container mx-auto py-10 flex flex-col space-y-5">
      <Header/>
      <div className="grid gap-8 md:grid-cols-2">
        {/* Plan Details */}
        <Card>
          <CardHeader>-
            <CardTitle>Plan Details</CardTitle>
            <CardDescription>Review your selected plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Plan</span>
              <span>{selectedPlan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Price</span>
              <span>{selectedPlan.price} XAF</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Duration</span>
              <span>{selectedPlan.duration_days} days</span>
            </div>
            <div>
              <span className="font-medium">Description</span>
              <p className="mt-1 text-sm text-gray-600">{selectedPlan.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <PaymentForm plan={selectedPlan} />
      </div>
    </div>
  )
}

export default SubscribePlanPage