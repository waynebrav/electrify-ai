
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const glowButtonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-glow-purple",
        blue: "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-glow-blue",
        green: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-glow-green",
        red: "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-glow-red",
        orange: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-glow-orange",
        outline: "border border-white/10 bg-transparent hover:border-white/20 hover:bg-white/5 text-foreground",
        ghost: "bg-transparent hover:bg-white/5 text-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
      glow: {
        true: "after:absolute after:inset-0 after:rounded-md after:opacity-40 after:blur-md after:transition-opacity hover:after:opacity-60",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: true,
    },
  }
);

export interface GlowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glowButtonVariants> {}

const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, variant, size, glow, ...props }, ref) => {
    // Use regular button styles but add the glow effect
    let glowColor = "";
    
    switch (variant) {
      case "blue":
        glowColor = "after:bg-gradient-to-r after:from-blue-600/50 after:to-cyan-600/50";
        break;
      case "green":
        glowColor = "after:bg-gradient-to-r after:from-green-600/50 after:to-emerald-600/50";
        break;
      case "red":
        glowColor = "after:bg-gradient-to-r after:from-red-600/50 after:to-rose-600/50";
        break;
      case "orange":
        glowColor = "after:bg-gradient-to-r after:from-orange-600/50 after:to-amber-600/50";
        break;
      case "outline":
      case "ghost":
        glowColor = "after:bg-white/5";
        break;
      default:
        glowColor = "after:bg-gradient-to-r after:from-purple-600/50 after:to-blue-600/50";
    }
    
    return (
      <Button
        className={cn(glowButtonVariants({ variant, size, glow }), glow && glowColor, className)}
        ref={ref}
        {...props}
      />
    );
  }
);
GlowButton.displayName = "GlowButton";

export { GlowButton };
