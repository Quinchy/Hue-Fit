import * as React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

// Define the input variants including icon and textarea variants
const inputVariants = cva(
  "flex w-full border-2 border-border rounded-md bg-accent px-5 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-none focus-visible:ring-2 focus-visible:ring-primary/75 disabled:cursor-not-allowed disabled:opacity-50 duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "h-[2.5rem]", // Default input styling
        icon: "pl-12 h-[2.5rem]", // Add padding to the left for icon
        textarea: "h-auto py-3 min-h-[8rem] resize-none" // Textarea styling
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

// Forward ref and handle variant types
const Input = React.forwardRef(({ className, type, variant, icon: Icon, ...props }, ref) => {
  // Check if variant is textarea
  const isTextarea = variant === "textarea";

  return (
    <div className="relative flex items-center">
      {/* Icon positioning for input with icon */}
      {variant === "icon" && Icon && (
        <div className="absolute left-5 text-muted-foreground">
          <Icon className="w-5 h-5 opacity-65" />
        </div>
      )}
      {isTextarea ? (
        <textarea
          className={cn(inputVariants({ variant, className }))}
          ref={ref}
          {...props}
        />
      ) : (
        <input
          type={type}
          className={cn(inputVariants({ variant, className }))}
          ref={ref}
          {...props}
        />
      )}
    </div>
  );
});

Input.displayName = "Input";

export { Input, inputVariants };
