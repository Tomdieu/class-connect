"use client";
import { subscribeToPlan } from "@/actions/payments";
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
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

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

  // Watch phone number to auto-select carrier
  const phoneNumber = form.watch("phone_number");

  useEffect(() => {
    if (phoneNumber.length >= 3) {
      const carrier = getCarrierFromNumber(phoneNumber);
      if (carrier) {
        form.setValue("method", carrier);
      }
    }
  }, [phoneNumber, form]);

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

  function onSubmit(data: PaymentFormValues) {
    subscribeMutation.mutate(data);
  }

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
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
