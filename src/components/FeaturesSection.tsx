
import React from "react";
import { ShieldCheck, Truck, CreditCard, CircleCheck } from "lucide-react";

const features = [
  {
    icon: <Truck className="h-8 w-8 text-electrify-500" />,
    title: "Fast Shipping",
    description: "Free delivery on orders over $50"
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-electrify-500" />,
    title: "Secure Shopping",
    description: "100% secure payment processing"
  },
  {
    icon: <CircleCheck className="h-8 w-8 text-electrify-500" />,
    title: "Satisfaction Guaranteed",
    description: "30-day money-back guarantee"
  },
  {
    icon: <CreditCard className="h-8 w-8 text-electrify-500" />,
    title: "Flexible Payment",
    description: "Multiple payment methods accepted"
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-12">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-12">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center p-4"
            >
              <div className="mb-4 flex items-center justify-center rounded-full bg-electrify-50 p-3">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
