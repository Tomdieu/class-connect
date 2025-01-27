"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Context to manage accordion state
type AccordionContextType = {
  value?: string;
  onValueChange?: (value: string) => void;
};

const AccordionContext = React.createContext<AccordionContextType>({});

// Context for each accordion item
type AccordionItemContextType = {
  id: string;
  isOpen: boolean;
  onToggle: () => void;
};

const AccordionItemContext =
  React.createContext<AccordionItemContextType | null>(null);

// Main Accordion Component
interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
}

export function Accordion({
  type = "single",
  value,
  onValueChange,
  defaultValue,
  children,
  className,
  ...props
}: AccordionProps) {
  const [internalValue, setInternalValue] = React.useState<string>(
    defaultValue || ""
  );

  // Verify children are AccordionItem components
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child) || child.type !== AccordionItem) {
      console.warn("Accordion requires AccordionItem components as children");
    }
  });

  const handleValueChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  return (
    <AccordionContext.Provider
      value={{
        value: value || internalValue,
        onValueChange: handleValueChange,
      }}
    >
      <div className={cn("space-y-1", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// Accordion Item Component
interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

export function AccordionItem({
  value,
  children,
  className,
  ...props
}: AccordionItemProps) {
  const { value: selectedValue, onValueChange } =
    React.useContext(AccordionContext);
  const isOpen = value === selectedValue;

  // Verify children include trigger and content
  const hasValidChildren = React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) &&
      (child.type === AccordionTrigger || child.type === AccordionContent)
  );

  if (!hasValidChildren) {
    console.warn(
      "AccordionItem requires AccordionTrigger and AccordionContent components"
    );
  }

  return (
    <AccordionItemContext.Provider
      value={{
        id: value,
        isOpen,
        onToggle: () => onValueChange?.(isOpen ? "" : value),
      }}
    >
      <div
        className={cn("border rounded-lg", isOpen && "", className)}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

// Accordion Trigger Component
interface AccordionTriggerProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  showIcon?: boolean;
}

export function AccordionTrigger({
  children,
  className,
  showIcon=true,
  ...props
}: AccordionTriggerProps) {
  const item = React.useContext(AccordionItemContext);

  if (!item) {
    throw new Error("AccordionTrigger must be used within an AccordionItem");
  }

  return (
    <button
      className={cn(
        "flex items-center justify-between w-full px-4 py-2 text-sm font-medium transition-all",
        className
      )}
      onClick={item.onToggle}
      aria-expanded={item.isOpen}
      {...props}
    >
      {children}
      {showIcon && (
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            item.isOpen && "rotate-180"
          )}
        />
      )}
    </button>
  );
}

// Accordion Content Component
interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AccordionContent({
  children,
  className,
  ...props
}: AccordionContentProps) {
  const item = React.useContext(AccordionItemContext);

  if (!item) {
    throw new Error("AccordionContent must be used within an AccordionItem");
  }

  return (
    <div
      className={cn(
        "overflow-hidden transition-all",
        item.isOpen ? "max-h-screen" : "max-h-0",
        className
      )}
      {...props}
    >
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}
