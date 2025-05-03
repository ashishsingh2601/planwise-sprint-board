
import React from "react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | 
    "ghost" | "link" | "primary" | "success";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, children, ...props }, ref) => {
    // Map our custom variants to Shadcn variants
    const mappedVariant = 
      variant === "primary" ? "default" : 
      variant === "success" ? "outline" : 
      variant;
    
    // Apply custom classes based on variant
    const customClasses = 
      variant === "primary" ? "bg-planwise-purple hover:bg-planwise-purple/90" :
      variant === "success" ? "border-green-500 text-green-500 hover:bg-green-50" :
      "";

    return (
      <ShadcnButton
        ref={ref}
        variant={mappedVariant as any}
        size={size}
        className={cn(customClasses, className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              ></circle>
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </ShadcnButton>
    );
  }
);

Button.displayName = "Button";

export { Button };
