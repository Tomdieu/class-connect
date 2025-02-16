"use client"
import { getSubscriptionPlan } from '@/actions/payments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useI18n } from '@/locales/client'
import { SubscriptionPlan } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { Edit2, Loader2, Plus, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { usePlanStore } from '@/hooks/plan-store'
import PlanModal from '@/components/dashboard/admin/modals/PlanModal'
import DeletePlanModal from '@/components/dashboard/admin/modals/DeletePlanModal'

function PlanListPage() {
  const t = useI18n()
  const { data: plans, isLoading, error, refetch } = useQuery<SubscriptionPlan[]>({
    queryKey: ['plans'],
    queryFn: ()=>getSubscriptionPlan()
  })
  const { onAdd, setPlan } = usePlanStore()
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t('plans.loading')}</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500 mb-4">{t('plans.error')}</p>
        <Button onClick={() => refetch()}>{t('plans.retry')}</Button>
      </div>
    )
  }

  return (
    <div className='w-full'>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t('plans.title')}</CardTitle>
              <CardDescription>{t('plans.description')}</CardDescription>
            </div>
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" />
              {t('plans.actions.add')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className='overflow-x-auto'>
          <Table className='overflow-x-auto'>
            <TableHeader>
              <TableRow>
                <TableHead>{t('plans.headers.name')}</TableHead>
                <TableHead>{t('plans.headers.price')}</TableHead>
                <TableHead>{t('plans.headers.duration')}</TableHead>
                <TableHead>{t('plans.headers.description')}</TableHead>
                <TableHead>{t('plans.headers.status')}</TableHead>
                <TableHead>{t('plans.headers.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    {t('plans.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                plans?.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>{plan.name}</TableCell>
                    <TableCell>{plan.price}</TableCell>
                    <TableCell>
                      {t('plans.durationDays', { days: plan.duration_days })}
                    </TableCell>
                    <TableCell>{plan.description}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          plan.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {plan.active ? t('plans.status.active') : t('plans.status.inactive')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setPlan(plan)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setPlanToDelete(plan)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <PlanModal />
      <DeletePlanModal 
        isOpen={!!planToDelete} 
        onClose={() => setPlanToDelete(null)} 
        plan={planToDelete} 
      />
    </div>
  )
}

export default PlanListPage