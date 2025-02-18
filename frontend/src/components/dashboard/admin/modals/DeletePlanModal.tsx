"use client"

import { deleteSubscriptionPlan } from '@/actions/payments'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useI18n } from '@/locales/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import { toast } from 'sonner'
import { SubscriptionPlan } from '@/types'

interface DeletePlanModalProps {
  isOpen: boolean
  onClose: () => void
  plan: SubscriptionPlan | null
}

function DeletePlanModal({ isOpen, onClose, plan }: DeletePlanModalProps) {
  const t = useI18n()
  const queryClient = useQueryClient()

  const deletePlanMutation = useMutation({
    mutationFn: deleteSubscriptionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      toast.success(t('plans.delete.success'))
      onClose()
    },
    onError: (error) => {
      toast.error(t('plans.delete.error'), {
        description: error.message
      })
    }
  })

  const handleDelete = () => {
    if (plan) {
      deletePlanMutation.mutate(plan.id)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('plans.delete.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('plans.delete.description', { name: plan?.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePlanMutation.isPending}>
            {t('plans.delete.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            asChild
          >
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deletePlanMutation.isPending}
            >
              {deletePlanMutation.isPending && (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('plans.delete.confirm')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeletePlanModal
