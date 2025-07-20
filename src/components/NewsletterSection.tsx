
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Subscribed!",
        description: "You have been subscribed to our newsletter.",
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-electrify-800 to-purple-900 text-white">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay Updated with Electrify</h2>
          <p className="text-blue-100 mb-8">
            Subscribe to our newsletter for exclusive deals, tech news, and product announcements.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-white text-electrify-800 hover:bg-white/90"
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
          <p className="text-xs text-blue-200 mt-4">
            By subscribing, you agree to receive marketing emails from Electrify. You can unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
