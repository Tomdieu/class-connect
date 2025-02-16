"use client"
import { listSubscriptions } from '@/actions/payments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useI18n } from '@/locales/client'
import { Subscriptions } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

function SubscriptionsPage() {
  const t = useI18n()
  const { data: subscriptions, isLoading, error, refetch } = useQuery<Subscriptions[]>({
    queryKey: ['subscriptions'],
    queryFn: ()=>listSubscriptions()
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t('subscriptionsPage.loading')}</span>
      </div>
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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t('subscriptionsPage.title')}</CardTitle>
            <CardDescription>{t('subscriptionsPage.description')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
            {subscriptions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {t('subscriptionsPage.empty')}
                </TableCell>
              </TableRow>
            ) : (
              subscriptions?.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>{subscription.user}</TableCell>
                  <TableCell>{subscription.plan}</TableCell>
                  <TableCell>
                    {format(new Date(subscription.start_date), 'PPP')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(subscription.end_date), 'PPP')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={subscription.is_active ? "default" : "destructive"}
                    >
                      {subscription.is_active 
                        ? t('subscriptionsPage.status.active') 
                        : t('subscriptionsPage.status.expired')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={subscription.auto_renew ? "default" : "secondary"}
                    >
                      {subscription.auto_renew 
                        ? t('subscriptionsPage.autoRenew.enabled') 
                        : t('subscriptionsPage.autoRenew.disabled')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default SubscriptionsPage