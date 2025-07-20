import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import CategoriesSection from "@/components/CategoriesSection";
import ARPromotion from "@/components/ARPromotion";
import NewsletterSection from "@/components/NewsletterSection";
import LimitedOfferNotification from "@/components/LimitedOfferNotification";
import ProductRecommendations from "@/components/ProductRecommendations";
import QuickAddToCart from "@/components/QuickAddToCart";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Award, Shield } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const Index = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  const carouselImages = [
    { src: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Modern workspace with a laptop", title: "Power Your Productivity", subtitle: "Find the latest tech to boost your workflow." },
    { src: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Developer at work", title: "Code in Style", subtitle: "High-performance machines for developers." },
    { src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Woman using laptop in a cozy setting", title: "Entertainment Unleashed", subtitle: "Stream, play, and enjoy with our devices." }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="relative w-full group">
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            opts={{
              loop: true,
            }}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {carouselImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-[60vh] md:h-[80vh] w-full">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white p-4">
                      <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">{image.title}</h1>
                      <p className="mt-4 text-lg md:text-2xl max-w-2xl drop-shadow">{image.subtitle}</p>
                      <Link to="/products" className="mt-8">
                        <Button size="lg">
                          Shop Now
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity" />
          </Carousel>
        </section>
        
        <LimitedOfferNotification />
        
        {/* AI Recommended Products Section - Above Featured Products */}
        <section className="container py-12">
          <ProductRecommendations className="mb-8" />
        </section>
        
        <FeaturedProducts />
        <CategoriesSection />
        
        <ARPromotion />
        
        {/* Enhanced AI Tool Section */}
        <div className="container py-12 md:py-16">
          <div className="relative overflow-hidden rounded-2xl bg-electrify-900 text-white">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <img 
                src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
                alt="" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center">
              <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
                <div className="inline-block bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                  NEW
                </div>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                  "Build My Setup" AI Tool
                </h2>
                <p className="text-lg md:text-xl text-blue-100 mb-6 max-w-xl">
                  Describe what you need, and let our AI build the perfect electronics setup for you. Whether it's for gaming, productivity, or entertainment, we've got you covered.
                </p>
                <Link to="/build-setup">
                  <Button size="lg" className="bg-white text-electrify-800 hover:bg-blue-50 group">
                    Try Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              <div className="md:w-1/3">
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-2 rounded-xl shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y29tcHV0ZXIlMjBzZXR1cHxlbnwwfHwwfHx8MA%3D%3D" 
                    alt="Custom PC Setup" 
                    className="rounded-lg shadow-lg transform hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* New Trusted By Section */}
        <div className="bg-gray-50 dark:bg-gray-900 py-10">
          <div className="container mx-auto px-4">
            <h3 className="text-center text-lg text-gray-500 dark:text-gray-400 mb-8">Trusted by over 10,000 customers worldwide</h3>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              <img src="https://placehold.co/100x40?text=Brand+1" alt="Brand 1" className="h-8 opacity-50 hover:opacity-100 transition-opacity" />
              <img src="https://placehold.co/100x40?text=Brand+2" alt="Brand 2" className="h-8 opacity-50 hover:opacity-100 transition-opacity" />
              <img src="https://placehold.co/100x40?text=Brand+3" alt="Brand 3" className="h-8 opacity-50 hover:opacity-100 transition-opacity" />
              <img src="https://placehold.co/100x40?text=Brand+4" alt="Brand 4" className="h-8 opacity-50 hover:opacity-100 transition-opacity" />
              <img src="https://placehold.co/100x40?text=Brand+5" alt="Brand 5" className="h-8 opacity-50 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
        
        {/* Enhanced Features Section with Icons */}
        <div className="container py-16">
          <h2 className="text-center text-3xl font-bold mb-12">Why Choose Electrify?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-6">
                <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fast Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300">Get your electronics delivered to your doorstep in as little as 24 hours.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-6">
                <Award className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality Guaranteed</h3>
              <p className="text-gray-600 dark:text-gray-300">All our products undergo rigorous testing to ensure the highest quality standards.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full mb-6">
                <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Extended Warranty</h3>
              <p className="text-gray-600 dark:text-gray-300">Enjoy peace of mind with our extended warranty options on all electronics.</p>
            </div>
          </div>
        </div>
        
        <NewsletterSection />
      </main>
      <QuickAddToCart />
      <Footer />
    </div>
  );
};

export default Index;
