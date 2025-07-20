
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection: React.FC = () => {
  return (
    <div className="hero-section text-white">
      <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-8 md:mb-0 md:pr-10 animate-fade-in">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            The Future of Electronics is Here
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-xl">
            Discover the latest tech innovations, from smartphones to smart homes, all in one place. Get exclusive deals on premium electronics.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-white text-electrify-800 hover:bg-blue-50">
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              View Deals
            </Button>
          </div>
        </div>
        <div className="md:w-1/2 relative animate-slide-in">
          <div className="relative z-10 grid grid-cols-2 gap-4">
            <img 
              src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
              alt="Smartwatch" 
              className="rounded-lg object-cover h-36 md:h-48 w-full shadow-lg transform translate-y-4"
            />
            <img 
              src="https://images.unsplash.com/photo-1585060544812-6b45742d762f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
              alt="Headphones" 
              className="rounded-lg object-cover h-36 md:h-48 w-full shadow-lg"
            />
            <img 
              src="https://images.unsplash.com/photo-1607853202273-797f1c22a38e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
              alt="Smartphone" 
              className="rounded-lg object-cover h-36 md:h-48 w-full shadow-lg"
            />
            <img 
              src="https://images.unsplash.com/photo-1593642702749-b7d2a804fbcf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
              alt="Laptop" 
              className="rounded-lg object-cover h-36 md:h-48 w-full shadow-lg transform translate-y-4"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-600 opacity-30 rounded-full filter blur-xl"></div>
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-electrify-500 opacity-30 rounded-full filter blur-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
