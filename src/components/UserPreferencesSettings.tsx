import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Update the Preferences interface to be compatible with Json type
interface Preferences {
  [key: string]: any; // This makes it compatible with the Json type
  theme?: string;
  notifications?: boolean;
  marketingEmails?: boolean;
  favoriteCategories?: string[];
  preferredProductTypes?: string[];
  sustainabilityFocus?: boolean;
  priceSensitivity?: string;
  arExperienceInterest?: boolean;
}

const UserPreferencesSettings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<Preferences>({
    theme: "light",
    notifications: true,
    marketingEmails: false,
    favoriteCategories: [],
    preferredProductTypes: [],
    sustainabilityFocus: false,
    priceSensitivity: "medium",
    arExperienceInterest: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile?.preferences) {
      setPreferences({
        ...preferences,
        ...profile.preferences,
      });
    }
  }, [profile]);

  const handleThemeChange = (value: string) => {
    setPreferences({
      ...preferences,
      theme: value,
    });
  };

  const handlePriceSensitivityChange = (value: string) => {
    setPreferences({
      ...preferences,
      priceSensitivity: value,
    });
  };

  const handleCategoryToggle = (category: string) => {
    const currentCategories = preferences.favoriteCategories || [];
    const updatedCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];

    setPreferences({
      ...preferences,
      favoriteCategories: updatedCategories,
    });
  };

  const handleProductTypeToggle = (type: string) => {
    const currentTypes = preferences.preferredProductTypes || [];
    const updatedTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];

    setPreferences({
      ...preferences,
      preferredProductTypes: updatedTypes,
    });
  };

  const handleSwitchChange = (field: keyof Preferences) => {
    setPreferences({
      ...preferences,
      [field]: !preferences[field],
    });
  };

  const savePreferences = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save your preferences.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Saving preferences for user:", user.id);
      console.log("Preferences to save:", preferences);
      
      // Use upsert to handle both insert and update cases
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, // Use user ID
          email: user.email,
          preferences: preferences,
          updated_at: new Date().toISOString(), 
        })
        .select();
      
      if (error) {
        console.error("Upsert error:", error);
        throw error;
      }
      
      console.log("Successfully saved preferences:", data);
      
      await refreshProfile();
      
      toast({
        title: "Preferences saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error saving preferences",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">Theme Preference</h3>
        <RadioGroup
          value={preferences.theme}
          onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
          className="mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="light" id="light" />
            <Label htmlFor="light">Light</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dark" id="dark" />
            <Label htmlFor="dark">Dark</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="system" id="system" />
            <Label htmlFor="system">System</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">Enable notifications</Label>
            <Switch
              id="notifications"
              checked={preferences.notifications}
              onCheckedChange={() => setPreferences({
                ...preferences,
                notifications: !preferences.notifications
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="marketingEmails">Marketing emails</Label>
            <Switch
              id="marketingEmails"
              checked={preferences.marketingEmails}
              onCheckedChange={() => setPreferences({
                ...preferences,
                marketingEmails: !preferences.marketingEmails
              })}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Favorite Categories</h3>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {["Smartphones", "Laptops", "Smart Home", "Audio", "Wearables", "Cameras"].map(
            (category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={(preferences.favoriteCategories || []).includes(category)}
                  onCheckedChange={() => {
                    const currentCategories = preferences.favoriteCategories || [];
                    const updatedCategories = currentCategories.includes(category)
                      ? currentCategories.filter((c) => c !== category)
                      : [...currentCategories, category];
                    setPreferences({
                      ...preferences,
                      favoriteCategories: updatedCategories,
                    });
                  }}
                />
                <Label htmlFor={`category-${category}`}>{category}</Label>
              </div>
            )
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Product Preferences</h3>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {["New Releases", "Bestsellers", "Discounted", "Premium", "Budget", "Eco-friendly"].map(
            (type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={(preferences.preferredProductTypes || []).includes(type)}
                  onCheckedChange={() => {
                    const currentTypes = preferences.preferredProductTypes || [];
                    const updatedTypes = currentTypes.includes(type)
                      ? currentTypes.filter((t) => t !== type)
                      : [...currentTypes, type];
                    setPreferences({
                      ...preferences,
                      preferredProductTypes: updatedTypes,
                    });
                  }}
                />
                <Label htmlFor={`type-${type}`}>{type}</Label>
              </div>
            )
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Sustainability Preference</h3>
        <div className="flex items-center justify-between mt-2">
          <Label htmlFor="sustainabilityFocus">
            Prioritize eco-friendly products
          </Label>
          <Switch
            id="sustainabilityFocus"
            checked={preferences.sustainabilityFocus}
            onCheckedChange={() => setPreferences({
              ...preferences,
              sustainabilityFocus: !preferences.sustainabilityFocus
            })}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Price Sensitivity</h3>
        <RadioGroup
          value={preferences.priceSensitivity}
          onValueChange={(value) => setPreferences({ ...preferences, priceSensitivity: value })}
          className="mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="low" id="low" />
            <Label htmlFor="low">Budget-focused</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="medium" />
            <Label htmlFor="medium">Value-oriented</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="high" id="high" />
            <Label htmlFor="high">Premium quality</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <h3 className="text-lg font-medium">AR Experience</h3>
        <div className="flex items-center justify-between mt-2">
          <Label htmlFor="arExperienceInterest">
            Interested in augmented reality shopping
          </Label>
          <Switch
            id="arExperienceInterest"
            checked={preferences.arExperienceInterest}
            onCheckedChange={() => setPreferences({
              ...preferences,
              arExperienceInterest: !preferences.arExperienceInterest
            })}
          />
        </div>
      </div>

      <Button onClick={savePreferences} disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : "Save Preferences"}
      </Button>
    </div>
  );
};

export default UserPreferencesSettings;
