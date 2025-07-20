
import * as React from "react";
import { cn } from "@/lib/utils";

interface NeomorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
  variant?: "raised" | "inset" | "floating";
  intensity?: "low" | "medium" | "high";
}

const NeomorphicCard = React.forwardRef<HTMLDivElement, NeomorphicCardProps>(
  ({ className, glowColor = "#3f51b5", variant = "raised", intensity = "medium", children, ...props }, ref) => {
    const getIntensityClass = () => {
      switch (intensity) {
        case "low": return "shadow-sm";
        case "high": return "shadow-xl";
        default: return "shadow-md";
      }
    };
    
    const getVariantClass = () => {
      switch (variant) {
        case "inset": return "bg-gradient-to-br from-background/90 to-background border-t border-l border-background/20";
        case "floating": return "bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-xl";
        default: return "bg-gradient-to-br from-background to-background/80";
      }
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-white/10 transition-all duration-300",
          getVariantClass(),
          getIntensityClass(),
          "hover:shadow-lg hover:scale-[1.01] group",
          className
        )}
        style={{
          boxShadow: variant === "inset" ? "inset 2px 2px 5px rgba(255,255,255,0.05), inset -2px -2px 5px rgba(0,0,0,0.1)" : undefined
        }}
        {...props}
      >
        <div className="relative overflow-hidden rounded-xl z-0">
          {variant === "floating" && (
            <div 
              className="absolute -z-10 opacity-50 blur-3xl aspect-square w-1/2 -top-1/4 -right-1/4 rounded-full transition-opacity group-hover:opacity-70" 
              style={{ background: `radial-gradient(circle, ${glowColor}40 0%, transparent 70%)` }} 
            />
          )}
          {children}
        </div>
      </div>
    );
  }
);

NeomorphicCard.displayName = "NeomorphicCard";

export { NeomorphicCard };
