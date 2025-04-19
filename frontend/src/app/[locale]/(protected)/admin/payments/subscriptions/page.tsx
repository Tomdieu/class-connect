"use client"
import { listSubscriptions } from '@/actions/payments'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useI18n } from '@/locales/client'
import { SubscriptionDetail } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Loader2, CreditCard, CalendarRange, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { getUserName } from '@/lib/getUserName'
import { motion } from 'framer-motion'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

function SubscriptionsPage() {
  const t = useI18n()
  const { data: subscriptions, isLoading, error, refetch } = useQuery<SubscriptionDetail[]>({
    queryKey: ['subscriptions'],
    queryFn: ()=>listSubscriptions()
  })

  if (isLoading) {
    return (
      <motion.div 
        className="w-full flex justify-center items-center h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-600">{t('subscriptionsPage.loading')}</p>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500 mb-4">{t('subscriptionsPage.error')}</p>
        <Button onClick={() => refetch()}>{t('subscriptionsPage.retry')}</Button>
      </div>
    )
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
          <div className="bg-primary/10 p-3 rounded-full mr-4">
            <CreditCard className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {t('subscriptionsPage.title')}
            </h1>
            <p className="text-sm text-gray-600">{t('subscriptionsPage.description')}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-10 max-w-[2400px] mx-auto"
      >
        <motion.div
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-primary/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/5 rounded-bl-full z-0"></div>
          
          {subscriptions?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-6 p-8 text-center relative z-10"
            >
              <div className="bg-primary/10 p-4 rounded-full">
                <CalendarRange className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-800">{t('subscriptionsPage.empty')}</h3>
                <p className="text-gray-600 max-w-md">No active subscriptions found. Users need to subscribe to a plan to appear here.</p>
              </div>
            </motion.div>
          ) : (
            <div className="overflow-x-auto relative z-10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('subscriptionsPage.headers.user')}</TableHead>
                    <TableHead>{t('subscriptionsPage.headers.plan')}</TableHead>
                    <TableHead>{t('subscriptionsPage.headers.startDate')}</TableHead>
                    <TableHead>{t('subscriptionsPage.headers.endDate')}</TableHead>
                    <TableHead>{t('subscriptionsPage.headers.status')}</TableHead>
                    <TableHead>{t('subscriptionsPage.headers.autoRenew')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions?.map((subscription) => (
                    <TableRow key={subscription.id} className="hover:bg-primary/5 transition-colors">
                      <TableCell className="font-medium">{getUserName(subscription.user)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            subscription.plan.name.toLowerCase().includes('premium') ? 'bg-primary' :
                            subscription.plan.name.toLowerCase().includes('standard') ? 'bg-blue-500' : 'bg-gray-500'
                          }`}></span>
                          {subscription.plan.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarRange className="h-4 w-4 text-gray-500" />
                          {format(new Date(subscription.start_date), 'PPP')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarRange className="h-4 w-4 text-gray-500" />
                          {format(new Date(subscription.end_date), 'PPP')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={subscription.is_active ? "default" : "secondary"}
                          className="flex items-center gap-1"
                        >
                          {subscription.is_active ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {subscription.is_active 
                            ? t('subscriptionsPage.status.active') 
                            : t('subscriptionsPage.status.expired')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={subscription.auto_renew ? "outline" : "secondary"}
                          className={`${subscription.auto_renew ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}`}
                        >
                          {subscription.auto_renew 
                            ? t('subscriptionsPage.autoRenew.enabled') 
                            : t('subscriptionsPage.autoRenew.disabled')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default SubscriptionsPage