
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, RefreshCw } from "lucide-react";

interface SystemSetting {
  key: string;
  value: string;
  type: 'text' | 'number' | 'boolean';
  label: string;
  description?: string;
}

const SystemSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Record<string, any>>({});

  // Default system settings
  const defaultSettings: SystemSetting[] = [
    {
      key: 'site_name',
      value: 'Electrify',
      type: 'text',
      label: 'Site Name',
      description: 'The name of your e-commerce site'
    },
    {
      key: 'site_email',
      value: 'support@electrify.com',
      type: 'text',
      label: 'Support Email',
      description: 'Main contact email for customer support'
    },
    {
      key: 'default_currency',
      value: 'KES',
      type: 'text',
      label: 'Default Currency',
      description: 'Default currency code for products'
    },
    {
      key: 'tax_rate',
      value: '16',
      type: 'number',
      label: 'Tax Rate (%)',
      description: 'Default tax rate percentage'
    },
    {
      key: 'free_shipping_threshold',
      value: '5000',
      type: 'number',
      label: 'Free Shipping Threshold',
      description: 'Minimum order amount for free shipping'
    },
    {
      key: 'enable_guest_checkout',
      value: 'true',
      type: 'boolean',
      label: 'Enable Guest Checkout',
      description: 'Allow customers to checkout without creating an account'
    },
    {
      key: 'enable_reviews',
      value: 'true',
      type: 'boolean',
      label: 'Enable Product Reviews',
      description: 'Allow customers to leave product reviews'
    },
    {
      key: 'enable_wishlist',
      value: 'true',
      type: 'boolean',
      label: 'Enable Wishlist',
      description: 'Allow customers to save products to wishlist'
    },
    {
      key: 'max_cart_items',
      value: '50',
      type: 'number',
      label: 'Maximum Cart Items',
      description: 'Maximum number of items allowed in cart'
    },
    {
      key: 'enable_inventory_tracking',
      value: 'true',
      type: 'boolean',
      label: 'Enable Inventory Tracking',
      description: 'Track product stock quantities'
    }
  ];

  // Load settings from database
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('key, value, type');
        
        if (error) throw error;

        const loadedSettings: Record<string, any> = {};
        
        // First, set defaults
        defaultSettings.forEach(setting => {
          loadedSettings[setting.key] = setting.type === 'boolean' 
            ? setting.value === 'true' 
            : setting.value;
        });

        // Then override with database values
        data?.forEach(setting => {
          if (setting.type === 'boolean') {
            loadedSettings[setting.key] = setting.value === 'true';
          } else {
            loadedSettings[setting.key] = setting.value;
          }
        });

        setSettings(loadedSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
        // Fallback to defaults
        const fallbackSettings: Record<string, any> = {};
        defaultSettings.forEach(setting => {
          fallbackSettings[setting.key] = setting.type === 'boolean' 
            ? setting.value === 'true' 
            : setting.value;
        });
        setSettings(fallbackSettings);
      }
    };

    loadSettings();
  }, []);

  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsData: Record<string, any>) => {
      // Save to database
      const updates = Object.entries(settingsData).map(([key, value]) => ({
        key,
        value: String(value),
        type: defaultSettings.find(s => s.key === key)?.type || 'text'
      }));

      const { error } = await supabase
        .from('system_settings')
        .upsert(updates, { onConflict: 'key' });

      if (error) throw error;
      return settingsData;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "System settings have been saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleResetSettings = () => {
    const resetSettings: Record<string, any> = {};
    defaultSettings.forEach(setting => {
      resetSettings[setting.key] = setting.type === 'boolean' 
        ? setting.value === 'true' 
        : setting.value;
    });
    setSettings(resetSettings);
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button 
            onClick={handleSaveSettings}
            disabled={saveSettingsMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Basic configuration for your e-commerce platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {defaultSettings.filter(s => ['site_name', 'site_email', 'default_currency'].includes(s.key)).map((setting) => (
              <div key={setting.key} className="space-y-2">
                <Label htmlFor={setting.key}>{setting.label}</Label>
                <Input
                  id={setting.key}
                  value={settings[setting.key] || ''}
                  onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                />
                {setting.description && (
                  <p className="text-sm text-gray-500">{setting.description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Commerce Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Commerce Settings</CardTitle>
            <CardDescription>
              Configure pricing, shipping, and checkout options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {defaultSettings.filter(s => ['tax_rate', 'free_shipping_threshold', 'max_cart_items'].includes(s.key)).map((setting) => (
              <div key={setting.key} className="space-y-2">
                <Label htmlFor={setting.key}>{setting.label}</Label>
                <Input
                  id={setting.key}
                  type="number"
                  value={settings[setting.key] || ''}
                  onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                />
                {setting.description && (
                  <p className="text-sm text-gray-500">{setting.description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Settings</CardTitle>
            <CardDescription>
              Enable or disable platform features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {defaultSettings.filter(s => s.type === 'boolean').map((setting) => (
              <div key={setting.key} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor={setting.key}>{setting.label}</Label>
                  {setting.description && (
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  )}
                </div>
                <Switch
                  id={setting.key}
                  checked={settings[setting.key] || false}
                  onCheckedChange={(checked) => handleSettingChange(setting.key, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>
              Current system status and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Platform Version</Label>
                <p className="text-sm font-mono">1.0.0</p>
              </div>
              <div>
                <Label>Database Status</Label>
                <p className="text-sm text-green-600">Connected</p>
              </div>
              <div>
                <Label>Last Backup</Label>
                <p className="text-sm">Never</p>
              </div>
              <div>
                <Label>Total Storage Used</Label>
                <p className="text-sm">--</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemSettings;
