import React from "react";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
    onClick?:()=>void;
    className?:string;
}

function BackButton({className,...props}:BackButtonProps) {
  return (
    <div className={cn(`flex items-center hover:text-primary`,className)} {...props}>
      <Button size={"icon"} className="rounded-full hover:bg-transparent" variant={"ghost"}>
        <ArrowLeft className="size-4" />
      </Button>
      <span className="font-semibold">Back</span>
    </div>
  );
}

export default BackButton;
