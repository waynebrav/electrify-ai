
import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "low" | "medium" | "high";
  tint?: "none" | "blue" | "purple" | "cyan" | "green";
}

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, intensity = "medium", tint = "none", children, ...props }, ref) => {
    const getTintClass = () => {
      switch (tint) {
        case "blue": return "bg-blue-500/10";
        case "purple": return "bg-purple-500/10";
        case "cyan": return "bg-cyan-500/10";
        case "green": return "bg-green-500/10";
        default: return "bg-white/5";
      }
    };

    const getIntensityClass = () => {
      switch (intensity) {
        case "low": return "backdrop-blur-sm";
        case "high": return "backdrop-blur-2xl";
        default: return "backdrop-blur-md";
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-white/10",
          getTintClass(),
          getIntensityClass(),
          "transition-all duration-300 hover:border-white/20",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassPanel.displayName = "GlassPanel";

export { GlassPanel };
