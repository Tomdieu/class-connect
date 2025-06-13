"use client";
import { checkFreeMoReferencePaymentStatus, FreeMoPayResponse, subscribeToPlan, subscribeToPlanFreeMopay } from "@/actions/payments";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SubscriptionPlan } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

// MTN prefixes: 650, 651, 652, 653, 654, 67x, 680, 681, 682, 683
const MTN_PREFIXES = [
  "650",
  "651",
  "652",
  "653",
  "654",
  "670",
  "671",
  "672",
  "673",
  "674",
  "675",
  "676",
  "677",
  "678",
  "679",
  "680",
  "681",
  "682",
  "683",
];

// Orange prefixes: 655, 656, 657, 658, 659[0-5], 69x
const ORANGE_PREFIXES = [
  "655",
  "656",
  "657",
  "658",
  "6590",
  "6591",
  "6592",
  "6593",
  "6594",
  "6595",
  "690",
  "691",
  "692",
  "693",
  "694",
  "695",
  "696",
  "697",
  "698",
  "699",
];

const getCarrierFromNumber = (number: string): "MTN" | "ORANGE" | null => {
  const prefix3 = number.slice(0, 3);
  const prefix4 = number.slice(0, 4);

  if (MTN_PREFIXES.includes(prefix3)) return "MTN";
  if (ORANGE_PREFIXES.includes(prefix3) || ORANGE_PREFIXES.includes(prefix4))
    return "ORANGE";
  return null;
};

const paymentSchema = z.object({
  method: z.enum(["MTN", "ORANGE"], {
    required_error: "Please select a payment method",
  }),
  phone_number: z
    .string()
    .min(9, "Phone number must be at least 9 digits")
    .max(9, "Phone number must be exactly 9 digits")
    .regex(/^[6-9][0-9]{8}$/, "Invalid phone number format")
    .refine((value) => {
      const carrier = getCarrierFromNumber(value);
      return carrier !== null;
    }, "Invalid phone number prefix"),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function PaymentForm({ plan }: { plan: SubscriptionPlan }) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      phone_number: "",
    },
  });

  const [freemoPayResponse,setFreemoPayResponse] = useState<FreeMoPayResponse|null>(null)
  const [lastProcessedPhoneNumber, setLastProcessedPhoneNumber] = useState<string>("");

  // Watch phone number to auto-select carrier
  const phoneNumber = form.watch("phone_number");

  useEffect(() => {
    // Only process if phone number has actually changed and has enough digits
    if (phoneNumber.length >= 3 && phoneNumber !== lastProcessedPhoneNumber) {
      const carrier = getCarrierFromNumber(phoneNumber);
      const currentMethod = form.getValues("method");
      
      // Only update if carrier is valid and different from current method
      if (carrier && carrier !== currentMethod) {
        form.setValue("method", carrier, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false
        });
      }
      
      // Update the last processed phone number to prevent re-processing
      setLastProcessedPhoneNumber(phoneNumber);
    }
  }, [phoneNumber, form, lastProcessedPhoneNumber]);

  const freemoPaySubscribeMutation = useMutation({
    mutationFn:(phoneNumber:string)=>subscribeToPlanFreeMopay({
      phone_number:phoneNumber,
      plan: plan.name.toLowerCase() as "basic" | "standard" | "premium",
      callback:process.env.NEXT_PUBLIC_FREEMOPAY_WEBHOOK
    }),
    onSuccess(data, variables, context) {
      setFreemoPayResponse(data)
    },
    onError: (error: any) => {
      console.error('Payment error:', error);
      
      let errorMessage = "An unexpected error occurred";
      
      try {
        // Try to parse the error if it's a JSON string
        if (typeof error === 'string') {
          const parsedError = JSON.parse(error);
          errorMessage = parsedError.message || parsedError.error || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = error.error;
        }
      } catch (e) {
        // If parsing fails, use the string as is
        errorMessage = error.toString();
      }
      
      toast.error(`Payment Failed: ${errorMessage}`, {
        duration: 5000,
      });
    },
  })

  const verifyStatusQuery = useQuery({
    queryKey:['checkTransactionstatus',freemoPayResponse?.reference!],
    queryFn:()=>checkFreeMoReferencePaymentStatus(freemoPayResponse?.reference!),
    enabled:!!freemoPayResponse,
    refetchInterval: (data) => {
      // Stop auto-refetching if payment is completed (SUCCESS or FAILED)
      if (data?.state.data?.status === "SUCCESS" || data?.state.data?.status === "FAILED") {
        return false;
      }
      // Continue auto-refetching every 5 seconds while PENDING
      return 5000;
    },
    retry: 3,
    retryDelay: 2000,
  })

  const subscribeMutation = useMutation({
    mutationFn: (data: PaymentFormValues) =>
      subscribeToPlan({
        plan: plan.name.toLowerCase() as "basic" | "standard" | "premium",
        success_url: window.location.href,
        failure_url: window.location.href,
        phone_number: data.phone_number,
        payment_method: data.method,
      }),
    onSuccess: (data) => {
      if (data?.payment_link) {
        window.location.href = data.payment_link;
      } else {
        toast.error("No payment link received. Please try again.");
      }
    },
    onError: (error: any) => {
      console.error('Payment error:', error);
      
      let errorMessage = "An unexpected error occurred";
      
      try {
        // Try to parse the error if it's a JSON string
        if (typeof error === 'string') {
          const parsedError = JSON.parse(error);
          errorMessage = parsedError.message || parsedError.error || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = error.error;
        }
      } catch (e) {
        // If parsing fails, use the string as is
        errorMessage = error.toString();
      }
      
      toast.error(`Payment Failed: ${errorMessage}`, {
        duration: 5000,
      });
    },
  });

  useEffect(()=>{
    if(verifyStatusQuery){
      if(verifyStatusQuery.isSuccess && verifyStatusQuery.data){
        const data = verifyStatusQuery.data;
        if(data.status === "SUCCESS"){
          toast.success("Payment successful! Your subscription is now active.", {
            duration: 5000,
          });
          form.reset();
          // Optionally redirect or update UI
        } else if(data.status === "FAILED"){
          toast.error("Payment failed. Please try again.", {
            duration: 5000,
          });
          form.reset();
          setFreemoPayResponse(null);
        } else {
          toast.info("Payment is still pending. Please check back later.", {
            duration: 5000,
          });
        }
      }
    }
  },[verifyStatusQuery])

  function onSubmit(data: PaymentFormValues) {
    // subscribeMutation.mutate(data);
    freemoPaySubscribeMutation.mutate(data.phone_number)
  }

  // Payment Status Progress Component
  const PaymentStatusProgress = () => {
    if (!freemoPayResponse) return null;

    const getStatusDetails = () => {
      const status = verifyStatusQuery.data?.status;
      
      switch (status) {
        case "PENDING":
          return {
            icon: <Clock className="h-5 w-5 text-orange-500" />,
            title: "Payment Pending",
            description: "Your payment is being processed. Please wait...",
            progress: 50,
            progressColor: "bg-orange-500",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-200",
            textColor: "text-orange-700"
          };
        case "SUCCESS":
          return {
            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
            title: "Payment Successful",
            description: "Your subscription has been activated successfully!",
            progress: 100,
            progressColor: "bg-green-500",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            textColor: "text-green-700"
          };
        case "FAILED":
          return {
            icon: <XCircle className="h-5 w-5 text-red-500" />,
            title: "Payment Failed",
            description: "Your payment could not be processed. Please try again.",
            progress: 100,
            progressColor: "bg-red-500",
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
            textColor: "text-red-700"
          };
        default:
          return {
            icon: <Clock className="h-5 w-5 text-blue-500" />,
            title: "Processing Payment",
            description: "Initializing payment request...",
            progress: 25,
            progressColor: "bg-blue-500",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            textColor: "text-blue-700"
          };
      }
    };

    const statusDetails = getStatusDetails();

    return (
      <div className={`p-4 rounded-lg border-2 ${statusDetails.borderColor} ${statusDetails.bgColor}`}>
        <div className="flex items-center gap-3 mb-3">
          {statusDetails.icon}
          <div className="flex-1">
            <h3 className={`font-semibold ${statusDetails.textColor}`}>
              {statusDetails.title}
            </h3>
            <p className={`text-sm ${statusDetails.textColor} opacity-80`}>
              {statusDetails.description}
            </p>
          </div>
          {verifyStatusQuery.isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Progress</span>
            <span>{statusDetails.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ease-in-out ${statusDetails.progressColor}`}
              style={{ width: `${statusDetails.progress}%` }}
            />
          </div>
        </div>
        
        {freemoPayResponse.reference && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Reference: <span className="font-mono">{freemoPayResponse.reference}</span>
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>
          Select your preferred payment method
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                        +237
                      </span>
                      <Input
                        {...field}
                        placeholder="612345678"
                        className="rounded-l-none"
                        type="tel"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter your number without country code (e.g., 612345678)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="MTN"
                          id="mtn"
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="mtn"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <Image
                            src="/images/mtn-momo.png"
                            alt="MTN Mobile Money"
                            width={100}
                            height={100}
                            className="mb-3 w-24 h-24 rounded-md"
                          />
                          <span className="text-sm font-medium">
                            MTN Mobile Money
                          </span>
                        </label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="ORANGE"
                          id="orange"
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="orange"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <Image
                            src="/images/orange-money.svg"
                            alt="Orange Money"
                            width={100}
                            height={100}
                            className="mb-3 w-24 h-24 bg-black rounded-md"
                          />
                          <span className="text-sm font-medium">
                            Orange Money
                          </span>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!freemoPayResponse && (
              <Button
              type="submit"
              className="w-full"
              disabled={subscribeMutation.isPending}
            >
              {subscribeMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Pay {plan.price} XAF
            </Button>
            )}
            
          </form>
        </Form>
          {freemoPayResponse && (
            <div className="space-y-4">
              <PaymentStatusProgress />
              <div className="my-3">
                <Button 
                  onClick={() => verifyStatusQuery.refetch()}
                  disabled={verifyStatusQuery.isFetching}
                  variant="outline"
                >
                  {verifyStatusQuery.isFetching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Check Payment Status"
                  )}
                </Button>
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
