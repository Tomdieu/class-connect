"use client"

import { addSubscriptionPlan, updateSubscriptionPlan } from '@/actions/payments'
import { Button } from '@/components/ui/button'
import { Credenza, CredenzaContent, CredenzaHeader, CredenzaTitle } from '@/components/ui/credenza'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { usePlanStore } from '@/hooks/plan-store'
import { useI18n } from '@/locales/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader, TriangleAlert } from 'lucide-react'
import React, { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SubscriptionPlan } from '@/types'

const PLAN_TYPES = ['BASIC', 'STANDARD', 'PREMIUM'] as const;

function PlanModal() {
  const t = useI18n()
  const { isOpen, onClose, plan } = usePlanStore()
  const queryClient = useQueryClient()

  const createPlanSchema = (t: (key: string) => string) =>
    z.object({
      name: z.enum(PLAN_TYPES, {
        required_error: t('plan.modal.errors.nameRequired'),
      }),
      price: z.number({
        required_error: t('plan.modal.errors.priceRequired'),
        invalid_type_error: t('plan.modal.errors.priceRequired')
      }).min(0, { message: t('plan.modal.errors.priceMin') }),
      duration_days: z.number({
        required_error: t('plan.modal.errors.durationRequired'),
        invalid_type_error: t('plan.modal.errors.durationRequired')
      }).min(1, { message: t('plan.modal.errors.durationMin') }),
      description: z.string().min(1, { message: t('plan.modal.errors.descriptionRequired') }),
      active: z.boolean().default(true),
      features: z.record(z.any()).default({})
    })

  type PlanFormData = z.infer<ReturnType<typeof createPlanSchema>>

  const form = useForm<PlanFormData>({
    resolver: zodResolver(createPlanSchema(t)),
    defaultValues: {
      name: 'BASIC',
      price: 0,
      duration_days: 30,
      description: '',
      active: true,
      features: {}
    }
  })

  const addPlanMutation = useMutation({
    mutationFn: addSubscriptionPlan
  })

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<PlanFormData> }) =>
      updateSubscriptionPlan(id, body)
  })

  const resetForm = useCallback(() => {
    form.reset({
      name: 'BASIC',
      price: 0,
      duration_days: 30,
      description: '',
      active: true,
      features: {}
    })
  }, [form])

  useEffect(() => {
    if (plan) {
      form.reset({
        name: plan.name,
        price: plan.price,
        duration_days: plan.duration_days,
        description: plan.description,
        active: plan.active,
        features: plan.features
      })
    }
  }, [form, plan])

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen, resetForm])

  const onSubmit = async (data: PlanFormData) => {
    if (plan) {
      updatePlanMutation.mutate(
        { id: plan.id, body: data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plans'] })
            toast.success('Plan updated successfully')
            onClose()
          },
          onError: (error) => {
            toast.error('Failed to update plan', {
              description: error.message,
              icon: <TriangleAlert />
            })
          }
        }
      )
    } else {
      addPlanMutation.mutate(data as SubscriptionPlan, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['plans'] })
          toast.success('Plan added successfully')
          onClose()
        },
        onError: (error) => {
          toast.error('Failed to add plan', {
            description: error.message,
            icon: <TriangleAlert />
          })
        }
      })
    }
  }

  const isLoading = addPlanMutation.isPending || updatePlanMutation.isPending

  return (
    <Credenza open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <CredenzaContent className='p-3'>
        <CredenzaHeader>
          <CredenzaTitle>
            {plan ? t("plan.modal.title.edit") : t("plan.modal.title.add")}
          </CredenzaTitle>
          <p className="text-sm text-muted-foreground">
            {plan ? t("plan.modal.subtitle.edit") : t("plan.modal.subtitle.add")}
          </p>
        </CredenzaHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('plan.modal.name')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('plan.modal.selectPlan')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PLAN_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`subscriptionPlans.${type.toLowerCase()}.name`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('plan.modal.price')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('plan.modal.duration')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('plan.modal.description')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t('plan.modal.active')}
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {plan ? t('plan.modal.submit.edit') : t('plan.modal.submit.add')}
            </Button>
          </form>
        </Form>
      </CredenzaContent>
    </Credenza>
  )
}

export default PlanModal