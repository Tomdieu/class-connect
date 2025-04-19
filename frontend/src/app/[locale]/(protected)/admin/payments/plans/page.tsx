"use client"
import { getSubscriptionPlan } from '@/actions/payments'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/locales/client'
import { SubscriptionPlan } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { 
  BookOpen, 
  Crown, 
  Star, 
  Sparkles, 
  Check, 
  ChevronRight,
  Edit2,
  Loader2,
  Plus,
  Trash2 
} from 'lucide-react'
import React, { useState } from 'react'
import { usePlanStore } from '@/hooks/plan-store'
import PlanModal from '@/components/dashboard/admin/modals/PlanModal'
import DeletePlanModal from '@/components/dashboard/admin/modals/DeletePlanModal'
import { motion } from 'framer-motion'

// Add animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function PlanListPage() {
  const t = useI18n()
  const { data: plans, isLoading, error, refetch } = useQuery<SubscriptionPlan[]>({
    queryKey: ['plans'],
    queryFn: ()=>getSubscriptionPlan()
  })
  const { onAdd, setPlan } = usePlanStore()
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null)

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const tierColors = {
      basic: 'from-gray-500 to-gray-600',
      standard: 'from-blue-500 to-blue-600',
      premium: 'from-primary to-primary/90'
    };

    const tierIcons = {
      basic: <Star className="h-6 w-6" />,
      standard: <Crown className="h-6 w-6" />,
      premium: <Sparkles className="h-6 w-6" />
    };

    const planType = plan.name.toLowerCase().includes('premium') ? 'premium' : 
                    plan.name.toLowerCase().includes('standard') ? 'standard' : 'basic';

    return (
      <motion.div
        variants={itemVariants}
        className="relative bg-white/90 backdrop-blur-sm rounded-xl border border-primary/10 shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
      >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tierColors[planType]} opacity-10 rounded-bl-full`} />
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
            </div>
            <div className={`p-2 rounded-full bg-gradient-to-r ${tierColors[planType]} text-white`}>
              {tierIcons[planType]}
            </div>
          </div>

          <div className="flex items-baseline mb-4">
            <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
            <span className="text-gray-600 ml-2">XAF</span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <Check className="h-4 w-4 text-primary mr-2" />
              <span>{t('plans.durationDays', { days: plan.duration_days })}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge
              variant={plan.active ? "default" : "secondary"}
              className="px-3 py-1"
            >
              {plan.active ? t('plans.status.active') : t('plans.status.inactive')}
            </Badge>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPlan(plan)}
                className="text-primary hover:text-primary/90"
              >
                {t('plans.actions.edit')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPlanToDelete(plan)}
                className="text-destructive hover:text-destructive/90"
              >
                {t('plans.actions.delete')}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <motion.div 
        className="w-full flex justify-center items-center h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-600">{t('plans.loading')}</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500 mb-4">{t('plans.error')}</p>
        <Button onClick={() => refetch()}>{t('plans.retry')}</Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full px-4 sm:px-8 py-10 bg-gradient-to-b from-primary/5 via-background to-background min-h-screen"
    >
      <motion.div 
        className="relative flex flex-col sm:flex-row items-center justify-between mb-10 pb-4 border-b border-primary/10 max-w-[2400px] mx-auto"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/10 rounded-bl-full z-0 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-primary/10 rounded-tr-full z-0 opacity-10"></div>
        
        <div className="flex items-center mb-4 sm:mb-0 relative z-10">
          <div className="hidden sm:flex bg-primary/10 sm:p-3 rounded-full sm:mr-4">
            <BookOpen className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {t('plans.title')}
            </h1>
            <p className="text-sm text-gray-600">{t('plans.description')}</p>
          </div>
        </div>
        
        <Button
          onClick={onAdd}
          className="bg-primary hover:bg-primary/90 w-full sm:w-fit text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow rounded-lg px-6 py-6 relative z-10"
          size="lg"
        >
          <Plus size={20} />
          {t('plans.actions.add')}
        </Button>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[2400px] mx-auto"
      >
        {plans?.map((plan) => renderPlanCard(plan))}
      </motion.div>

      <PlanModal />
      <DeletePlanModal 
        isOpen={!!planToDelete}
        onClose={() => setPlanToDelete(null)}
        plan={planToDelete}
      />
    </motion.div>
  );
}

export default PlanListPage;