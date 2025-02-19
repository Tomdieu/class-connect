import Lottie from "lottie-react";
import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface LottieWrapperProps extends HTMLAttributes<HTMLDivElement> {
  animation: any;
}

export function LottieWrapper({ animation, className, ...props }: LottieWrapperProps) {
  return (
    <div className={cn("w-full h-full", className)} {...props}>
      <Lottie animationData={animation} loop={true} />
    </div>
  );
}
