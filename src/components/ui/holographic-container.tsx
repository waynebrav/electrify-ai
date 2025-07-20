
import * as React from "react";
import { cn } from "@/lib/utils";

interface HolographicContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "low" | "medium" | "high";
}

const HolographicContainer = React.forwardRef<HTMLDivElement, HolographicContainerProps>(
  ({ className, intensity = "medium", children, ...props }, ref) => {
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      
      setMousePosition({ x, y });
    };

    const getIntensityValue = () => {
      switch (intensity) {
        case "low": return 3;
        case "high": return 9;
        default: return 6;
      }
    };

    const intensityValue = getIntensityValue();

    const style = {
      "--translate-x": isHovering ? `${mousePosition.x * intensityValue}px` : "0px",
      "--translate-y": isHovering ? `${mousePosition.y * intensityValue}px` : "0px",
      "--glow-opacity": isHovering ? 0.8 : 0.4,
      "--rotation-x": isHovering ? `${-mousePosition.y * 5}deg` : "0deg",
      "--rotation-y": isHovering ? `${mousePosition.x * 5}deg` : "0deg",
    } as React.CSSProperties;

    return (
      <div
        ref={(node) => {
          if (ref) {
            if (typeof ref === "function") ref(node);
            else ref.current = node;
          }
          containerRef.current = node;
        }}
        className={cn(
          "relative group perspective-1000 cursor-pointer",
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={style}
        {...props}
      >
        <div
          className="relative preserve-3d transition-transform duration-300 ease-out"
          style={{
            transform: `
              perspective(1000px)
              rotateX(var(--rotation-x))
              rotateY(var(--rotation-y))
            `
          }}
        >
          <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500" />
          
          <div className="relative bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden z-10">
            {children}
            
            <div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 opacity-0 group-hover:opacity-[var(--glow-opacity)] transition-opacity duration-500"
              style={{
                transform: `translate(var(--translate-x), var(--translate-y))`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }
);

HolographicContainer.displayName = "HolographicContainer";

export { HolographicContainer };
