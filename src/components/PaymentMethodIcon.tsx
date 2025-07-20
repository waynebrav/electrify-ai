
import React from "react";
import { Bitcoin, CreditCard, Banknote, Phone, Landmark } from "lucide-react";

type PaymentMethodProps = {
  method: "bitcoin" | "ethereum" | "usdt" | "mpesa" | "cash" | "card";
  size?: number;
  className?: string;
};

const PaymentMethodIcon: React.FC<PaymentMethodProps> = ({ 
  method, 
  size = 24, 
  className = "" 
}) => {
  switch (method) {
    case "bitcoin":
      return <Bitcoin size={size} className={className} />;
    case "ethereum":
      // Using CreditCard as a fallback since Ethereum icon isn't available in lucide
      return <CreditCard size={size} className={className} />;
    case "usdt":
      // Using Landmark as a fallback since USDT icon isn't available in lucide
      return <Landmark size={size} className={className} />;
    case "mpesa":
      return <Phone size={size} className={className} />;
    case "cash":
      return <Banknote size={size} className={className} />;
    case "card":
      return <CreditCard size={size} className={className} />;
    default:
      return <CreditCard size={size} className={className} />;
  }
};

export default PaymentMethodIcon;
