
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MoveRight } from 'lucide-react';

const ARPromotion = () => {
  return (
    <div className="container py-12 md:py-16">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-electrify-700 to-blue-600 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-10">
           <img
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
            alt="AR Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-64">
                <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse-ring"></div>
                <img 
                    src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=500" 
                    alt="AR Product" 
                    className="w-full h-full object-contain p-4 relative z-10 transform transition-transform duration-500 hover:scale-110"
                />
            </div>
          </div>
          <div className="md:w-1/2 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 animate-glow">
              Step into the Future
            </h2>
            <p className="text-lg md:text-xl text-blue-100 mb-6 max-w-xl">
              Visualize products in your own space with our Augmented Reality Viewing Room. See how they fit, look, and feel before you buy.
            </p>
            <Link to="/ar-room">
              <Button size="lg" className="bg-white text-electrify-800 hover:bg-blue-50 group">
                Explore in AR
                <MoveRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARPromotion;
