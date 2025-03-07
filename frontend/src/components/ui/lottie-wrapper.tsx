"use client"
import { useLottie } from "lottie-react";
import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface LottieWrapperProps extends HTMLAttributes<HTMLDivElement> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animation: any;
}

export function LottieWrapper({ animation, className, ...props }: LottieWrapperProps) {
  const options = {
    animationData: animation,
    loop: true,
  };

  const { View } = useLottie(options);

  return (
    <div className={cn("w-full h-full", className)} {...props}>
      {View}
    </div>
  );
}
