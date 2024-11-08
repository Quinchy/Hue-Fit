import * as React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

// Define the input variants including an icon variant
const inputVariants = cva(
  "flex h-[3rem] w-full rounded-md bg-accent px-5 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "", // Default input styling
        icon: "pl-10" // Add padding to the left for icon
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

// Forward ref and handle variant types
const Input = React.forwardRef(({ className, type, variant, icon: Icon, ...props }, ref) => {
  return (
    <div className="relative flex items-center">
      {variant === "icon" && Icon && (
        <div className="absolute left-3 text-muted-foreground">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <input
        type={type}
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    </div>
  );
});

Input.displayName = "Input";

export { Input, inputVariants };
