
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

const UserPreferencesSurvey = () => {
  const { user, setIsFirstLogin, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>("");
  const [shoppingFrequency, setShoppingFrequency] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "Smartphones & Tablets", "Laptops & Computers", "Audio & Headphones", "Cameras & Photography", 
    "Smart Home Devices", "Gaming & Consoles", "Wearable Technology", "Home Appliances"
  ];

  const priceRanges = [
    "Under KES 5,000", "KES 5,000 - 15,000", "KES 15,000 - 50,000", "Over KES 50,000"
  ];

  const frequencies = [
    "Weekly", "Monthly", "Quarterly", "Rarely"
  ];

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }

    if (selectedCategories.length === 0 || !priceRange || !shoppingFrequency) {
      toast({
        title: "Please complete all fields",
        description: "We need this information to personalize your experience.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const preferences = {
        categories: selectedCategories,
        priceRange,
        shoppingFrequency,
        surveyCompleted: true,
        completedAt: new Date().toISOString(),
      };

      console.log('Updating user preferences for user:', user.id);
      console.log('Preferences to save:', preferences);

      // Use upsert to create a profile if it doesn't exist, or update it if it does.
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          preferences,
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Successfully updated preferences:', data);

      // Refresh the profile data
      await refreshProfile();

      // Mark first login as complete
      setIsFirstLogin(false);

      toast({
        title: "Preferences saved!",
        description: "Your shopping preferences have been saved successfully.",
      });

    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error saving preferences",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    setIsFirstLogin(false);
    toast({
      title: "Survey skipped",
      description: "You can update your preferences later in your profile.",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <CardHeader className="relative border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Welcome to Electrify! Let's personalize your tech experience
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Tell us about your electronics preferences to get the best tech recommendations
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-8">
          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Which electronics categories interest you most? (Select multiple)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  onClick={() => handleCategoryToggle(category)}
                  className={`h-12 justify-start transition-all ${
                    selectedCategories.includes(category)
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              What's your typical spending range per purchase?
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {priceRanges.map((range) => (
                <Button
                  key={range}
                  variant={priceRange === range ? "default" : "outline"}
                  onClick={() => setPriceRange(range)}
                  className={`h-12 justify-start transition-all ${
                    priceRange === range
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>

          {/* Shopping Frequency */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              How often do you shop online?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {frequencies.map((frequency) => (
                <Button
                  key={frequency}
                  variant={shoppingFrequency === frequency ? "default" : "outline"}
                  onClick={() => setShoppingFrequency(frequency)}
                  className={`h-12 justify-start transition-all ${
                    shoppingFrequency === frequency
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {frequency}
                </Button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <Button
              onClick={handleSkip}
              variant="outline"
              className="flex-1 h-12 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Skip for now
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedCategories.length === 0 || !priceRange || !shoppingFrequency}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPreferencesSurvey;
