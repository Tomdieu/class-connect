"use client";
import { getCurrentPlan, getSubscriptionPlan } from "@/actions/payments";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Clock,
  CreditCard,
  Loader2,
  Package,
} from "lucide-react";
import PaymentForm from "@/components/payment/PaymentForm";
import { useParams, usePathname, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
import { useI18n } from "@/locales/client";

function SubscribePlanPage() {
  const t = useI18n();
  const params = useParams<{ plan: string }>();
  const plan = params?.plan || '';
  const router = useRouter();
  const { data: session } = useSession();
  const { openLogin } = useAuthDialog();
  const pathname = usePathname();

  const { data: plans, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: ()=>getSubscriptionPlan(),
  });

  const selectedPlan = plans?.find(
    (p) => p.name.toLowerCase() === plan.toLowerCase()
  );

  const { data: currentPlanData, isLoading: isCurrentPlanLoading } = useQuery({
    queryKey: ["currentPlan"],
    queryFn: getCurrentPlan,
    enabled: !!selectedPlan,
  });

  useEffect(() => {
    if (!session?.user) {
      router.push(`/auth/login?callbackUrl=${pathname}`);
      openLogin();
    }
  }, [openLogin, pathname, router, session]);
  
  if (isLoading || isCurrentPlanLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertTitle>{t("planNotFound.heading")}</AlertTitle>
          <AlertDescription>
            {t("planNotFound.description")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-5">
      <Header />

      <main className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {t("subscribe.title", { plan: selectedPlan.name })}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {t("subscribe.subtitle")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Plan Details Card */}
          <Card className="bg-white shadow-sm h-fit">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">
                  {t("subscribe.planDetails")}
                </CardTitle>
                <Badge variant="secondary" className="font-medium">
                  {selectedPlan.name}
                </Badge>
              </div>
              <CardDescription>
                {t("subscribe.planDetailsDesc")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-sm">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <div className="flex justify-between w-full">
                    <span className="font-medium text-gray-700">{t("subscribe.price")}</span>
                    <span className="font-bold text-primary">
                      {selectedPlan.price.toLocaleString()} XAF
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div className="flex justify-between w-full">
                    <span className="font-medium text-gray-700">{t("subscribe.duration")}</span>
                    <span>{selectedPlan.duration_days} {t("student.subscriptions.days")}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-4 text-sm">
                  <Package className="h-4 w-4 text-gray-500 mt-1" />
                  <div className="space-y-1 flex-1">
                    <span className="font-medium text-gray-700">{t("subscribe.features")}</span>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedPlan.description}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Plan or Payment Form */}
          {currentPlanData?.has_active_subscription && currentPlanData?.subscription ? (
            <Card className="bg-white shadow-sm h-fit">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  {t("subscribe.currentSubscription")}
                </CardTitle>
                <CardDescription>
                  {t("subscribe.currentSubscriptionDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-primary/5 border-primary/10">
                  <Package className="h-4 w-4" />
                  <AlertTitle>{t("subscribe.activePlanAlert")}</AlertTitle>
                  <AlertDescription>
                    {t("subscribe.activePlanAlertDesc")}
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm">
                    <Package className="h-4 w-4 text-gray-500" />
                    <div className="flex justify-between w-full">
                      <span className="font-medium text-gray-700">
                        {t("subscribe.currentPlan")}
                      </span>
                      <Badge variant="outline">
                        {currentPlanData.subscription.plan.name}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <div className="flex justify-between w-full">
                      <span className="font-medium text-gray-700">
                        {t("subscribe.startDate")}
                      </span>
                      <span>
                        {format(
                          new Date(currentPlanData.subscription.start_date),
                          "PPP"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <div className="flex justify-between w-full">
                      <span className="font-medium text-gray-700">
                        {t("subscribe.endDate")}
                      </span>
                      <span>
                        {format(new Date(currentPlanData.subscription.end_date), "PPP")}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <PaymentForm plan={selectedPlan} />
          )}
        </div>
      </main>
    </div>
  );
}

export default SubscribePlanPage;
