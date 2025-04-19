"use client";

import { motion } from "framer-motion";
import { getCurrentPlan, getMySubscriptions } from "@/actions/payments";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/locales/client";
import { CalendarCheck, Receipt, Clock, CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SubscriptionDetail } from "@/types";
import { Badge } from "@/components/ui/badge";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Add animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function SubscriptionsPage() {
  const t = useI18n();

  // Fetch current plan
  const {
    data: currentPlanData,
    isLoading: isCurrentPlanLoading,
    error: currentPlanError,
  } = useQuery({
    queryKey: ["current-plan"],
    queryFn: () => getCurrentPlan(),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch subscription history
  const {
    data: subscriptions,
    isLoading: isHistoryLoading,
    error: historyError,
  } = useQuery({
    queryKey: ["subscriptions-history"],
    queryFn: () => getMySubscriptions({ params: { page_size: 10 } }),
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isCurrentPlanLoading || isHistoryLoading;
  const error = currentPlanError || historyError;

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if user has any subscriptions (current or past)
  const hasSubscriptions = subscriptions?.results.length > 0;

  if (isLoading) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-[2400px] mx-auto">
          <Skeleton className="h-12 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <Skeleton className="h-32 w-full mb-8" />
          <div className="border border-primary/20 rounded-lg p-6 bg-card/95 backdrop-blur">
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-[2400px] mx-auto">
          <motion.div 
            className="relative flex flex-col items-center justify-between mb-10 pb-4 border-b border-primary/10"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/10 rounded-bl-full z-0 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-primary/10 rounded-tr-full z-0 opacity-10"></div>
            
            <div className="flex items-center mb-4 relative z-10 w-full">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Receipt className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {t("student.subscriptions.title")}
                </h1>
                <p className="text-sm text-gray-600">{t("common.error")}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            className="border rounded-lg p-6 bg-card/95 backdrop-blur border-primary/20 shadow-lg"
          >
            <p className="text-center text-muted-foreground">
              {t("common.errorDesc", { item: "subscriptions" })}
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen w-full bg-gradient-to-b from-primary/5 via-background to-background p-4 sm:p-6"
    >
      <div className="max-w-[2400px] mx-auto">
        <motion.div 
          className="relative flex flex-col items-center justify-between mb-10 pb-4 border-b border-primary/10"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/10 rounded-bl-full z-0 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-primary/10 rounded-tr-full z-0 opacity-10"></div>
          
          <div className="flex items-center mb-4 relative z-10 w-full">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <Receipt className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {t("student.subscriptions.title")}
              </h1>
              <p className="text-sm text-gray-600">{t("student.subscriptions.description")}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {!hasSubscriptions ? (
            <motion.div variants={sectionVariants} className="bg-card/95 backdrop-blur">
              <SubscriptionPlans />
            </motion.div>
          ) : (
            <>
              {currentPlanData?.has_active_subscription === true && 
                currentPlanData?.subscription !== undefined && (
                <motion.div 
                  variants={sectionVariants}
                  className="bg-card/95 backdrop-blur shadow-lg border border-primary/20 rounded-lg overflow-hidden"
                >
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">
                      {t("student.subscriptions.currentPlan")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("student.subscriptions.activePlanDesc")}
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          {t("student.subscriptions.plan")}
                        </div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold">
                            {currentPlanData.subscription?.plan.name}
                          </h3>
                          <Badge
                            variant="default"
                            className="bg-primary text-primary-foreground"
                          >
                            {t("student.subscriptions.active")}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{t("student.subscriptions.period")}</span>
                          </div>
                        </div>
                        <div>
                          {formatDate(currentPlanData.subscription?.start_date)} - {formatDate(currentPlanData.subscription?.end_date)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            <span>{t("student.subscriptions.price")}</span>
                          </div>
                        </div>
                        <div className="font-semibold text-xl">
                          {currentPlanData.subscription.plan.price} XAF
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            / {currentPlanData.subscription.plan.duration_days} {t("student.subscriptions.days")}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex items-center text-sm text-muted-foreground">
                      <CalendarCheck className="h-4 w-4 mr-1" />
                      <span>{t("student.subscriptions.validUntil")}: </span>
                      <span className="font-medium ml-1">
                        {formatDate(currentPlanData.subscription?.end_date)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div 
                variants={sectionVariants}
                className="border border-primary/20 rounded-lg overflow-hidden bg-card/95 backdrop-blur shadow-lg"
              >
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold">
                    {t("student.subscriptions.history")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("student.subscriptions.historyDesc")}
                  </p>
                </div>
                
                <div className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("student.subscriptions.plan")}</TableHead>
                        <TableHead>{t("student.subscriptions.period")}</TableHead>
                        <TableHead>{t("student.subscriptions.price")}</TableHead>
                        <TableHead>{t("student.subscriptions.duration")}</TableHead>
                        <TableHead>{t("student.subscriptions.status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions?.results.map(
                        (subscription: SubscriptionDetail) => (
                          <TableRow key={subscription.id}>
                            <TableCell className="font-medium">
                              {subscription.plan.name}
                            </TableCell>
                            <TableCell>
                              {formatDate(subscription.start_date)} - {formatDate(subscription.end_date)}
                            </TableCell>
                            <TableCell>
                              {subscription.plan.price} XAF
                            </TableCell>
                            <TableCell>
                              {subscription.plan.duration_days} {t("student.subscriptions.days")}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={subscription.is_active ? "default" : "secondary"}
                                className={`${
                                  subscription.is_active
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                }`}
                              >
                                {subscription.is_active
                                  ? t("student.subscriptions.active")
                                  : t("student.subscriptions.expired")}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
