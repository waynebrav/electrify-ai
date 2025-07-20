
import React from "react";
import { Button as ShadcnButton } from "@/components/ui/button";

interface ButtonProps extends React.ComponentProps<typeof ShadcnButton> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "default",
  ...props
}) => {
  return (
    <ShadcnButton variant={variant} size={size} {...props} />
  );
};

export default Button;
