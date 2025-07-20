import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const LimitedOfferNotification = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-primary to-orange-500 text-white py-4 relative">
      <div className="container mx-auto px-4 text-center">
        <p className="font-medium pr-8">
          🎉 Limited Time Offer: Get 20% off on all products with code{" "}
          <span className="font-bold">ELECTRIFY20</span>
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 h-8 w-8 p-0"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default LimitedOfferNotification;