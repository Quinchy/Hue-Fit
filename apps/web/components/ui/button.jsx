import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center transition-transform active:scale-[0.99] justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary px-4 py-4 border border-primary border-[4px] uppercase text-sm font-semibold text-primary-foreground shadow hover:bg-primary/85 hover:border-primary/25 duration-300 ease-in-out",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/85",
        outline:
          "border bg-accent uppercase text-primary font-semibold py-[19px] px-4 border-border border-[2px] shadow-sm hover:bg-accent/70 hover:text-accent-foreground duration-300 ease-in-out",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary px-0 py-0 underline-offset-4 hover:underline",
        none: "focus-visible:ring-1 focus-visible:ring-ring uppercase font-semibold",
      },
      size: {
        default: "h-9",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
